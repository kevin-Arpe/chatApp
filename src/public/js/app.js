/* Object */
let data_publicRooms = [];
const logo_publicRooms = {};
let roomSortType = "ord_create";

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
const btn_logout = document.getElementById("btn_logout");
const frm_room = document.querySelector("#frm_room");
const input_room = frm_room.querySelector("input");
const btn_room = frm_room.querySelector("button");
const input_img = document.getElementById("input_img");

const menu_top = box_main.querySelector("#menu_top");
const btn_sort = document.querySelector("#btn_sort");
const list_sort = document.querySelector("#list_sort");
const btn_newChat = document.querySelector("#btn_newChat");
const list_room = box_main.querySelector("#list_room");

const box_chat = document.getElementById("box_chat");
const icon_exit = document.querySelector("#icon_exit");
const list_msg = box_chat.querySelector("#list_msg");
const frm_msg = box_chat.querySelector("#frm_msg");
const input_msg = frm_msg.querySelector("textarea");
const btn_msg = frm_msg.querySelector("button");

/* App Scripts */
function handleChatIconClick() {
    if (frm_room.classList[0] == CLASS_HIDDEN) {
        frm_room.classList.remove(CLASS_HIDDEN);

        input_room.classList.remove("slide-down");
        input_room.classList.add("slide-down");

        setTimeout(() => {
            input_room.focus();
        }, 200);
    } else {
        input_room.classList.remove("slide-down");
        frm_room.classList.add(CLASS_HIDDEN);
    }
}

function handleUsernameSubmit(e) {
    e.preventDefault();
    const username = input_username.value;
    socket.emit("make_username", username, () => {
        showRooms();
    });
    input_username.value = "";
}

function handleLogout() {
    const logoutCheck = confirm("로그아웃 하시겠습니까?");
    if (!logoutCheck) return;
    socket.emit("logout");
    box_front.classList.remove(CLASS_HIDDEN);
    box_main.classList.add(CLASS_HIDDEN);
}

function showSortList(e) {
    if (list_sort.classList[0] == undefined) {
        list_sort.classList.add(CLASS_HIDDEN);
    } else {
        list_sort.classList.remove(CLASS_HIDDEN);
    }
}

function handleRoomSort(e) {
    const sortType = e.target.id;

    if (roomSortType !== "ord_create" && sortType == "ord_create") {
        deleteRoomList();
        socket.emit("req_roomInfo");
        roomSortType = "ord_create";
    } else if (roomSortType !== "ord_name" && sortType == "ord_name") {
        deleteRoomList();
        data_publicRooms.sort();
        data_publicRooms.forEach((room) => makeRoomList(room));
        roomSortType = "ord_name";
    } else {
        return;
    }

    showSortList();
}

function showRooms() {
    box_front.classList.add(CLASS_HIDDEN);
    box_main.classList.remove(CLASS_HIDDEN);
}

function enterRoom(roomName) {
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
    const roomName = this.getElementsByClassName("text_roomName")[0].innerText;
    socket.emit("enter_room", roomName, enterRoom);
}

function handleRoomCreate(e) {
    e.preventDefault();
    const roomName = input_room.value;
    let base64 = "";

    if (roomName === "") return;

    const isGetImage = confirm("채팅방 로고 이미지를 추가하시겠습니까?");
    if (isGetImage) {
        input_img.value = "";
        input_img.click();
        input_img.addEventListener("change", (e) => {
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = function() {
                base64 = reader.result.replace(/.*base64,/, '');
                socket.emit("create_room", roomName, base64, () => {
                    enterRoom(roomName);
                });
                input_room.value = "";
            }
            reader.onerror = function(err) {
                console.log(err);
            }
        });
    } else {
        socket.emit("create_room", roomName, base64, () => {
            enterRoom(roomName);
        });
        input_room.value = "";
    }
}

function handleRoomExit() {
    box_chat.classList.add(CLASS_HIDDEN);
    box_main.classList.remove(CLASS_HIDDEN);

    socket.emit("exit_room");
    roomSortType = "ord_create";
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

function deleteRoomList() {
    while (list_room.firstChild) {
        list_room.removeChild(list_room.firstChild);
    }
}

function makeRoomList(roomName) {
    const li = document.createElement("li");
    const img_container = document.createElement("div");
    const icon_room = document.createElement("img");
    const text_roomName = document.createElement("span");
    icon_room.classList.add("icon_room");
    text_roomName.classList.add("text_roomName");
    text_roomName.innerText = roomName;

    const base64 = logo_publicRooms[roomName];
    if (base64 !== "") {
        icon_room.src = `data:image/png;base64, ${base64}`;
    } else {
        icon_room.src = `data:image/png;base64, ${logo_publicRooms["default"]}`;
    }

    img_container.appendChild(icon_room);
    li.appendChild(img_container);
    li.appendChild(text_roomName);
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
    // document.addEventListener("mouseup", (e) => {
    //     if (!frm_room.contains(e.target)) {
    //         newChatRoomOverlay.classList.add(CLASS_HIDDEN);
    //     }
    // });
    // document.addEventListener("keydown", (e) => {
    //     if (e.key == "Escape" && frm_room.classList[0] == undefined) {
    //         newChatRoomOverlay.classList.add(CLASS_HIDDEN);
    //     }
    // });

    frm_username.addEventListener("submit", handleUsernameSubmit);
    btn_logout.addEventListener("click", handleLogout);

    btn_sort.addEventListener("click", showSortList);
    list_sort.addEventListener("click", handleRoomSort);

    btn_newChat.addEventListener("click", handleChatIconClick);
    frm_room.addEventListener("submit", handleRoomCreate);

    icon_exit.addEventListener("click", handleRoomExit);
    frm_msg.addEventListener("submit", handleMsgSubmit);
    input_msg.addEventListener("keydown", handleMsgKeyPress);

    /* Socket Script */
    socket.on("connect", () => {
        socket.emit("req_roomInfo");
    });

    socket.on("refreshRoomList", (publicRooms, logos) => {
        deleteRoomList();
        data_publicRooms = publicRooms.slice();

        if (logos !== null) {
            data_publicRooms.forEach((room) => {
                if (!logo_publicRooms[room]) logo_publicRooms[room] = logos[room];
            });
            logo_publicRooms["default"] = logos["default"];
        }
        data_publicRooms.forEach((room) => makeRoomList(room, logo_publicRooms[room]));
    });

    socket.on("create_room", (roomName, logo_64) => {
        data_publicRooms.push(roomName);
        logo_publicRooms[roomName] = logo_64;
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