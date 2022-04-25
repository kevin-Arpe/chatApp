/* CLASS_NAME */
const CLASS_HIDDEN = "hidden";

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
const icon_exit = document.querySelector("#icon_exit");
const list_msg = box_chat.querySelector("#list_msg");
const frm_msg = box_chat.querySelector("#frm_msg");
const input_msg = frm_msg.querySelector("textarea");
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
    box_front.classList.add(CLASS_HIDDEN);
    box_main.classList.remove(CLASS_HIDDEN);
}

function enterRoom(roomName) {
    console.log(`Enter room(Room name : ${roomName})`);
    
    box_main.classList.add(CLASS_HIDDEN);
    box_chat.classList.remove(CLASS_HIDDEN);

    const data_msg = {
        "type": "room_enter",
        "username": "",
        "roomName": roomName
    }
    drawSystemMsg(data_msg);
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

function handleRoomExit() {
    box_chat.classList.add(CLASS_HIDDEN);
    box_main.classList.remove(CLASS_HIDDEN);

    socket.emit("exit_room");
    refreshChatList();
}

function refreshChatList() {
    while (list_msg.firstChild) {
        list_msg.removeChild(list_msg.firstChild);
    }
}

function handleMsgSubmit(e, isWithKeyPress) {
    if (isWithKeyPress) e.preventDefault();
    const msg = input_msg.value;

    if (msg === "") return;
    socket.emit("send_msg", msg, () => {
        drawMyChat(msg);
    });
    input_msg.value = "";
}

function handleMsgKeyPress(e) {
    const isWithKeyPress = 1;
    if (!e.shiftKey) {
        if (e.keyCode == 13) {
            e.preventDefault();
            handleMsgSubmit(isWithKeyPress)
        };
    }
}

function makeRoomList(roomName) {
    const li = document.createElement("li");
    const icon_room = document.createElement("div");
    const text_roomname = document.createElement("div");
    icon_room.classList.add("icon_room");
    text_roomname.classList.add("text_roomname");
    text_roomname.innerText = roomName;

    li.appendChild(icon_room);
    li.appendChild(text_roomname);
    li.addEventListener("click", handleRoomClk);
    list_room.appendChild(li);
}

function drawMyChat(msg) {
    const li = document.createElement("li");
    li.classList.add("my_msg");
    const textBox = document.createElement("div");
    textBox.innerText = msg;
    li.appendChild(textBox);
    list_msg.appendChild(li);
}

function drawFriendsChat(username, msg, isSameUser) {
    const li = document.createElement("li");
    li.classList.add("friends_msg");
    const div = document.createElement("div");

    const textBox = document.createElement("div");
    textBox.classList.add("textBox");
    textBox.innerText = msg;

    const nameBox = document.createElement("div");
    if (!isSameUser) {
        nameBox.classList.add("nameBox");
        nameBox.innerText = username;
        div.appendChild(nameBox);
    }
    div.appendChild(textBox);
    li.appendChild(div);
    list_msg.appendChild(li);
}

function drawSystemMsg(data_msg) {
    const msg_type = data_msg.type;
    const username = data_msg.username;
    const roomName = data_msg.roomName;
    
    const li = document.createElement("li");
    li.classList.add("system_msg");
    const textBox = document.createElement("div");
    textBox.classList.add("textBox");
    if (msg_type == "user_enter") {
        textBox.innerText = `${username} 님이 입장하셨습니다`;
    } else if (msg_type == "room_enter") {
        textBox.innerText = `채팅방 ${roomName}에 입장하였습니다`;
    } else if (msg_type == "user_exit") {
        textBox.innerText = `${username} 님이 퇴장하셨습니다`;
    }

    li.appendChild(textBox);
    list_msg.appendChild(li);
}

function init() {
    box_main.classList.add(CLASS_HIDDEN);
    box_chat.classList.add(CLASS_HIDDEN);

    frm_username.addEventListener("submit", handleUsernameSubmit);
    frm_room.addEventListener("submit", handleRoomCreate);
    icon_exit.addEventListener("click", handleRoomExit);
    frm_msg.addEventListener("submit", handleMsgSubmit);
    input_msg.addEventListener("keydown", handleMsgKeyPress);

    /* Socket Script */
    socket.on("connect", () => {
        socket.emit("req_roomInfo");
    });

    socket.on("refreshRoomList", (publicRooms) => {
        while (list_room.firstChild) {
            list_room.removeChild(list_room.firstChild);
        }
        const roomList = publicRooms;
        roomList.forEach((roomName) => makeRoomList(roomName));
    });

    socket.on("change_room", (roomName) => {
        makeRoomList(roomName);
    });

    socket.on("send_msg", (data_msg) => {
        const username = data_msg.username;
        const msg = data_msg.msg;
        const isSameUser = data_msg.isSameUser;

        console.log(`${username}: ${msg}`);
        drawFriendsChat(username, msg, isSameUser);
    });

    socket.on("system_msg", (data_msg) => {
        drawSystemMsg(data_msg);
    });

    socket.on("error", (err_msg) => {
        alert(err_msg);
    });

    socket.on("disconnect", () => {
        alert("Disconnected from server");
    });
}

init();