const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();

//Join room
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);
  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //getting msg value
  const msg = e.target.elements.msg.value;

  //emitting msg to server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//Output msg to DOm

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">
    <span>${message.username}</span>  <span>${message.time}</span>
  </p>
  <p class="text">${message.text}</p>`;

  document.querySelector(".chat-messages").appendChild(div);
}
// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.userName;
    userList.appendChild(li);
  });
}
//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
