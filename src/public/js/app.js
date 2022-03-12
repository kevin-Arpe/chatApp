const socket = new WebSocket(`ws://${window.location.host}`);

/* HTML Obj */
const frm_msg = document.getElementById("frm_msg");
const input_msg = frm_msg.querySelector("input");
const button_msg = frm_msg.querySelector("button");

/* Socket Scripts */
socket.addEventListener("open", () => {
    console.log("Connect to server ✅");
});

socket.addEventListener("close", () => {
    console.log("Disconnect to server ❌");
});

socket.addEventListener("message", (msg) => {
    console.log(`Someone : $${msg}`);
});

/* App Scripts */
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