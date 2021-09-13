const express = require("express");
const path = require("path");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const{getUser,getUsersInRoom,addUser,removeUser}=require('./utils/users')

const io = socketio(server);
const publicdirectorypath = path.join(__dirname, "../public");
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("server running on port " + PORT);
});

app.use(express.json());
app.use(express.static(publicdirectorypath));

// let count=0
io.on("connection", (socket) => {
 
  // socket.emit('countUpdated',count)
  // socket.on('increment',()=>{
  //     count++

  // emitting on single client
  //socket.emit('countUpdated',count)
  // io.emit('countUpdated',count)
  // })
  socket.on('join',({username,room},callback)=>{
    const{error,user}=addUser({id:socket.id,username,room})
    if(error)
    {
return callback(error)}

    socket.join(user.room)
    socket.emit("message", {...user,...generateMessage("Welcome")}); //single client emit current user only isrf isko jo abhi connect hua hai
    socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined`)); //all  clients except current
    callback()
    io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
  })
  socket.on("sendMessage", ({message,username}, callback) => {
    const {room}=getUser(socket.id)
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.to(room).emit("message", {username,...generateMessage(message)});
    callback();
  });
  socket.on("disconnect", () => {
   const user=removeUser(socket.id)
   if(user)
   {
    io.to(user.room).emit("message", generateMessage(`${user.username} has left`));
    io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
   }
  });
  socket.on("sendLocation", ({ latitude, longitude }, callback) => {
    const {room,username}=getUser(socket.id)
    io.to(room).emit(
      "locationMessage",{username,
      ...generateLocationMessage(
        `https://google.com/maps/?q=${latitude},${longitude}`
      )}
    ); //all clients //https://google.com/maps/?q=30.90096575.8572758
    callback();
  });
});
