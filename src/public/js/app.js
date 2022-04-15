// const socket = new WebSocket(`ws://${window.location.host}`);
const socket = io();

/* HTML Obj */
const box_front = document.getElementById("box_front");
const frm_username = box_front.querySelector("#frm_username");
const input_username = frm_username.querySelector("input");
const btn_username = frm_username.querySelector("button");

const box_main = document.getElementById("box_main");
const frm_room = box_main.querySelector("#frm_room");
const input_room = frm_room.querySelector("input");
const btn_room = frm_room.querySelector("button");
const menu_top = box_main.querySelector("#menu_top");
const list_room = box_main.querySelector("#list_room");

const box_chat = document.getElementById("box_chat");
const list_msg = box_chat.querySelector("#list_msg");
const frm_msg = box_chat.querySelector("#frm_msg");
const input_msg = frm_msg.querySelector("input");
const btn_msg = frm_msg.querySelector("button");

/* App Scripts */
function handleUsernameSubmit(e) {
    e.preventDefault();
    const username = input_username.value;
    socket.emit("make_username", username, () => {
        showRooms();
    });
    input_username.value = "";
}

function showRooms() {
    box_front.style.display = "none";
    box_main.style.display = "flex";
}

function enterRoom(roomName) {
    console.log(`Enter room(Room name : ${roomName})`);
    
    box_main.style.display = "none";
    box_chat.style.display = "block";
}

function handleRoomClk() {
    const roomName = this.innerText;
    socket.emit("enter_room", roomName, enterRoom);
}

function handleRoomCreate(e) {
    e.preventDefault();
    const roomName = input_room.value;

    if (roomName === "") return;
    socket.emit("create_room", roomName, () => {
        enterRoom(roomName);
    });
    input_room.value = "";
}

function handleMsgSubmit(e) {
    e.preventDefault();
    const msg = input_msg.value;

    if (msg === "") return;
    socket.emit("send_msg", msg, () => {
        drawMyChatList(msg);
    });
    input_msg.value = "";
}

function makeRoomList(roomName) {
    const li = document.createElement("li");
    li.innerText = roomName;
    li.addEventListener("click", handleRoomClk);
    list_room.appendChild(li);
}

function drawMyChatList(msg) {
    const li = document.createElement("li");
    li.classList.add("my_msg")
    li.innerText = msg;
    list_msg.appendChild(li);
}

function drawFriendsChat(username, msg) {
    const li = document.createElement("li");
    li.classList.add("friends_msg");
    li.innerText = `${username}: ${msg}`;
    list_msg.appendChild(li);
}

function init() {
    frm_username.addEventListener("submit", handleUsernameSubmit);
    frm_room.addEventListener("submit", handleRoomCreate);
    frm_msg.addEventListener("submit", handleMsgSubmit);

    /* Socket Script */
    socket.on("connect", () => {
        socket.emit("req_roomInfo");
    });

    socket.on("roomInfo", (publicRooms) => {
        const roomList = publicRooms;
        roomList.forEach((roomName) => makeRoomList(roomName));
    });

    socket.on("change_room", (roomName) => {
        console.log(`Room ${roomName} is created`);
        makeRoomList(roomName);
    });

    socket.on("send_msg", (data_msg) => {
        const username = data_msg.username;
        const msg = data_msg.msg;

        console.log(`${username}: ${msg}`);
        drawFriendsChat(username, msg);
    });

    socket.on("error", (err_msg) => {
        alert(err_msg);
    });

    socket.on("disconnect", () => {
        alert("Disconnected from server");
    });
}

init();