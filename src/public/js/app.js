// const socket = new WebSocket(`ws://${window.location.host}`);
const socket = io();

/* HTML Obj */
const box_front = document.getElementById("box_front");
const frm_username = box_front.querySelector("#frm_username");
const input_username = frm_username.querySelector("input");
const btn_username = frm_username.querySelector("button");

const box_room = document.getElementById("box_room");
const frm_room = box_room.querySelector("#frm_room");
const input_room = frm_room.querySelector("input");
const btn_room = frm_room.querySelector("button");
const list_room = document.getElementById("list_room");

const box_chat = document.getElementById("box_chat");
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
    box_room.style.display = "block";
}

function enterRoom(roomName) {
    console.log(`Enter room(Room name : ${roomName})`);
    box_room.style.display = "none";
    box_chat.style.display = "block";
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
    socket.emit("send_msg", msg);
    input_msg.value = "";
}

function init() {
    frm_username.addEventListener("submit", handleUsernameSubmit);
    frm_room.addEventListener("submit", handleRoomCreate);
    frm_msg.addEventListener("submit", handleMsgSubmit);

    /* Socket Script */
    socket.on("connect", () => {
        socket.on("enter_socket");
    });

    socket.on("create_room", (roomName) => {
        console.log(`Room ${roomName} is created`);
        const li = document.createElement("li");
        li.innerText = roomName;
        list_room.appendChild(li);
    });
}

init();