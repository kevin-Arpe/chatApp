// const socket = new WebSocket(`ws://${window.location.host}`);
const socket = io();

/* HTML Obj */
const frm_room = document.getElementById("frm_room");
const input_room = frm_room.querySelector("input");
const btn_room = frm_room.querySelector("button");

const list_room = document.getElementById("list_room");

const frm_msg = document.getElementById("frm_msg");
const input_msg = frm_msg.querySelector("input");
const btn_msg = frm_msg.querySelector("button");

/* App Scripts */
function enterRoom(roomName) {
    console.log(`Enter room(Room name : ${roomName})`);
}

function handleRoomCreate(e) {
    e.preventDefault();
    const roomName = input_room.value;
    socket.emit("create_room", roomName, () => {
        enterRoom(roomName);
    });
    input_room.value = "";
}

function handleMsgSubmit(e) {
    e.preventDefault();
    const msg = input_msg.value;

    socket.send(msg);
    input_msg.value = "";
}

function init() {
    frm_room.addEventListener("submit", handleRoomCreate);

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