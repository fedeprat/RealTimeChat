const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
// express uses this under the hood but I need it explicit so I can use it with socket.io
const server = http.createServer(app);
// now I use it with socketio
const io = socketio(server);
app.use('/js/socket.js', express.static('./node_modules/socket.io/socket.io.js'))

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//listen when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    socket.emit("message", formatMessage("", "Welcome to my real time Chat."));

    //broadcast sends messages to everybody except the user itself
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("", `${user.username} has joined the chat`)
      );

    //Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //runs when a client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage("", `${user.username} has left`)
      );
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
  //listen for messages from other people
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    //we send it to everybody
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
