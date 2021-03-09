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
const server = http.createServer(app);
const io = socketio(server);
const botName = "Nusrat";

//Set static folder
app.use(express.static(path.join(__dirname, "public")));
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    //only display the messages if user has join the same room or if do not display the messages if two users are in diff room
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Whatup!"));

    //broadcast when a user cnnects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `A ${user.userName} has join the chat`)
      );
    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });
  //listen for chat mssg
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.userName, msg));
  });

  //runs when client discoonect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.emit(
        "message",
        formatMessage(botName, `${user.userName} has left the chat`)
      );
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});
