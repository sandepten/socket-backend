const express = require("express");
const app = express();
const PORT = 4000;
const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3000",
  },
});
let users = [];
io.on("connection", (socket) => {
  console.log(`${socket.id} user just connected!`);
  socket.on("message", (data) => {
    io.emit("messageResponse", data);
  });
  socket.on("typing", (data) => socket.broadcast.emit("typingResponse", data));
  socket.on("newUser", (data) => {
    //Adds the new user to the list of users
    users.push(data);
    //Sends the list of users to the client
    io.emit("newUserResponse", users);
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    io.emit("newUserResponse", users);
    socket.disconnect();
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
