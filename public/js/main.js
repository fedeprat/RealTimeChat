const socket = window.io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

//get username and room from url
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit('joinRoom', {username, room})

//get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

socket.on("message", (message) => {
  outputMessage(message);
  //scroll automatic everytime new message appears
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
//message submits
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //I get the message typed in the form
  const msg = e.target.elements.msg.value;

  // I emit it to the server
  socket.emit("chatMessage", msg);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output message to dom
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

//add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room
}

//add users to DOM
function outputUsers(users) {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`
}