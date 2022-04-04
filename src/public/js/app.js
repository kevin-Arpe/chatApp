// const socket = new WebSocket(`ws://${window.location.host}`);
const socket = io();

/* HTML Obj */
const frm_room = document.getElementsById("frm_room");
const input_room = frm_room.querySelector("input");
const btn_room = frm_room.querySelector("button");

const frm_msg = document.getElementById("frm_msg");
const input_msg = frm_msg.querySelector("input");
const btn_msg = frm_msg.querySelector("button");

/* Socket Scripts */
// socket.addEventListener("open", () => {
//     console.log("Connect to server ✅");
// });

// socket.addEventListener("close", () => {
//     console.log("Disconnect to server ❌");
// });

// socket.addEventListener("message", (msg) => {
//     console.log(`Someone : $${msg}`);
// });

/* App Scripts */
function handleRoomSubmit(e) {
    e.preventDefault();
    const room = input_room.value;
    socket.send(room);
    input_room.value = "";
}

function handleMsgSubmit(e) {
    e.preventDefault();
    const msg = input_msg.value;

    socket.send(msg);
    input_msg.value = "";
}

function init() {
    frm_msg.addEventListener("submit", handleMsgSubmit);
}

init();