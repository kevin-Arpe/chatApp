import express from "express";
import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";

/* Server Side code */
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views"); /* or app.set("views", path.join(__dirname, "/views")); */
app.use("/public", express.static(__dirname + "/public")); // image, video, html, css, javascript와 같은 정적 파일 경로 지정
// app.use(express.static("public")); // 윗 줄은 가상의 경로("/public")를 사용하고 싶을때, 이 코드는 가상의 경로가 아닌 물리적 경로를 사용할때..
app.get("/", (_, res) => res.render("home")); /* 처음에는 get으로 입력받는 값, 두번 째 인자는 콜백함수 */
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});

let publicRooms = [];
let roomLogos = {};
function getPublicRooms() {
    const {sockets: {adapter: { sids, rooms }}} = io;
    publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) publicRooms.push(key);
    });
    return publicRooms;
}

io.on("connection", (socket) => {
    let prevSendUser = "";
    socket["username"] = "Unknown";

    socket.on("req_roomInfo", () => {
        socket.emit("refreshRoomList", getPublicRooms());
    });

    socket.on("make_username", (username, browserFunc) => {
        if (username !== "") socket["username"] = username;
        browserFunc();
    });

    socket.on("logout", () => {
        socket["username"] = "Unknown";
    });

    socket.on("create_room", (roomName, base64, browserFunc) => {
        const rooms = io.sockets.adapter.rooms;
        roomLogos.roomName = base64;

        let isVaildRoomName = 1;
        rooms.forEach((_, key) => {
            if (key == roomName) {
                isVaildRoomName = 0;
                return false;
            }
        });

        if (!isVaildRoomName) {
            socket.emit("error", "That room name already exist");
        } else {
            socket.join(roomName);
            publicRooms = getPublicRooms();
            io.sockets.emit("create_room", roomName, roomLogos[roomName]);
            browserFunc();
        }
    });

    socket.on("enter_room", (roomName, browserFunc) => {
        socket.join(roomName);
        const data_msg = {
            "type": "user_enter",
            "username": socket["username"],
            "roomName": roomName
        }

        io.sockets.emit("refreshRoomList", getPublicRooms());
        socket.rooms.forEach((room) => socket.to(room).emit("system_msg", data_msg));
        browserFunc(roomName);
    });

    socket.on("send_msg", (msg, browserFunc) => {
        let isSameUser = 0;
        if (prevSendUser == socket["username"]) isSameUser = 1;

        const data_msg = {
            "username": socket["username"],
            "msg": msg,
            "isSameUser": isSameUser
        }
        
        browserFunc();
        socket.rooms.forEach((room) => socket.to(room).emit("send_msg", data_msg));
        prevSendUser = socket["username"];
    });

    socket.on("exit_room", () => {
        const data_msg = {
            "type": "user_exit",
            "username": socket["username"]
        }
        socket.rooms.forEach((room) => {
            socket.to(room).emit("system_msg", data_msg);
            if (publicRooms.indexOf(room) !== -1) {
                socket.leave(room);
                publicRooms = getPublicRooms();
                io.sockets.emit("refreshRoomList", publicRooms);
            }
        });
    });

    socket.on("disconnecting", () => {
        if (socket.username == "Unknown") return;
        publicRooms = getPublicRooms();
        const data_msg = {
            "type": "user_exit",
            "username": socket["username"]
        }

        let current_room;
        socket.rooms.forEach((room) => {
            if (publicRooms.indexOf(room) !== -1) {
                current_room = room;
                socket.leave(room);
            }
        });

        const roomSize = io.sockets.adapter.rooms.get(current_room)?.size;
        if (roomSize > 0) {
            socket.rooms.forEach((room) => socket.to(room).emit("system_msg", data_msg));
        } else {
            io.sockets.emit("refreshRoomList", getPublicRooms());
        }
    });
});

httpServer.listen(3000, () => console.log("Listening on port:3000"));