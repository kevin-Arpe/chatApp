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

function getPublicRooms() {
    const {sockets: {adapter: { sids, rooms }}} = io;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) publicRooms.push(key);
    });
    return publicRooms;
}

io.on("connection", (socket) => {
    let prevSendUser = "";
    socket["username"] = "Unknown";

    socket.on("req_roomInfo", () => {
        socket.emit("roomInfo", getPublicRooms());
    });

    socket.on("make_username", (username, browserFunc) => {
        socket["username"] = username;
        browserFunc();
    });

    socket.on("create_room", (roomName, browserFunc) => {
        console.log(io.sockets.adapter.rooms);
        const rooms = io.sockets.adapter.rooms;

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
            console.log(`Room ${roomName} is created`);

            io.sockets.emit("change_room", roomName);

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
        console.log(`${data_msg.username} : ${data_msg.msg}`);
        socket.rooms.forEach((room) => socket.to(room).emit("send_msg", data_msg));
        prevSendUser = socket["username"];
    });
});

httpServer.listen(3000, () => console.log("Listening on port:3000"));