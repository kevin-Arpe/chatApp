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

let sockets = [];

io.on("connection", (socket) => {
    socket["username"] = "Unknown";

    socket.on("create_room", (roomName, browserFunc) => {
        socket.join(roomName);
        console.log(`Room ${roomName} is created`);

        io.sockets.emit("create_room", roomName);

        browserFunc();
    });
});

httpServer.listen(3000, () => console.log("Listening on port:3000"));