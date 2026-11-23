const io = require('socket.io')(8000, {
  cors: {
    origin: `http://127.0.0.1:3000`
  }
});

let actUser = [];
let typingUsers = {};

io.on('connect', (socket) => {
  socket.on('add-new-user', (newUserID) => {
    if (!actUser.some((user) => user.UserID === newUserID)) {
      actUser.push({ UserID: newUserID, SocketID: socket.id });
    }
    console.log('User connected', actUser);
    io.emit('get-user', actUser);
  });

  socket.on('send-mess', (data) => {
    const user = actUser.find((user) => user.UserID === data.UserRecip);
    if (user) {
      io.to(user.SocketID).emit('rec-mess', data);
    }
    if (data.groupId) {
      io.emit('rec-group-mess', data);
    }
  });

  socket.on('send-invit', (data) => {
    const user = actUser.find((user) => user.UserID === data.UserRecip);
    if (user) {
      io.to(user.SocketID).emit('rec-invit', data);
    }
  });

  socket.on('send-acc-invit', (data) => {
    const user = actUser.find((user) => user.UserID === data.UserSend);
    if (user) {
      io.to(user.SocketID).emit('rec-acc-invit', data);
    }
  });

  socket.on('send-dec-invit', (data) => {
    const user = actUser.find((user) => user.UserID === data.UserSend);
    if (user) {
      io.to(user.SocketID).emit('rec-dec-invit', data);
    }
  });

  socket.on('send-del-invit', (data) => {
    const user = actUser.find((user) => user.UserID === data.UserRecip);
    if (user) {
      io.to(user.SocketID).emit('rec-del-invit', data);
    }
  });

  socket.on('typing-start', (data) => {
    typingUsers[socket.id] = { userId: data.userId, userName: data.userName, chatWith: data.chatWith };
    const recipient = actUser.find((user) => user.UserID === data.chatWith);
    if (recipient) {
      io.to(recipient.SocketID).emit('get-typing', {
        userId: data.userId,
        userName: data.userName,
        chatWith: data.chatWith
      });
    }
  });

  socket.on('typing-stop', (data) => {
    delete typingUsers[socket.id];
    const recipient = actUser.find((user) => user.UserID === data.chatWith);
    if (recipient) {
      io.to(recipient.SocketID).emit('get-typing-stop', { userId: data.userId, chatWith: data.chatWith });
    }
  });

  socket.on('disconnect', () => {
    actUser = actUser.filter((user) => user.SocketID !== socket.id);
    delete typingUsers[socket.id];
    console.log('User disconnected', actUser);
    io.emit('get-user', actUser);
    io.emit('get-typing', Object.values(typingUsers));
  });
});
