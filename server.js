// my-p2p-messenger/server.js
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const ss = require('socket.io-stream');
const fs = require('fs');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected with ID:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit('user-disconnected', socket.id);
  });

  socket.on('chat-message', (message) => {
    console.log('Received message:', message);
    io.emit('chat-message', message);
  });

  socket.on('get-users', () => {
    const users = [];
    for (let [id, socket] of io.of('/').sockets) {
      users.push({ id, username: socket.username });
    }
    socket.emit('user-connected', users);
  });

  socket.broadcast.emit('user-connected', { id: socket.id, username: socket.username });

  // Handle file info
  socket.on('file-info', (fileInfo) => {
    console.log('Receiving file:', fileInfo.name, fileInfo.size);
    socket.to(fileInfo.receiverId).emit('file-info', fileInfo);
  });

  // Handle file stream
  ss(socket).on('file-stream', (stream, data) => {
    const filename = `${data.name}-${Date.now()}`;
    const filepath = path.join(__dirname, 'uploads', filename);

    const writeStream = fs.createWriteStream(filepath);
    stream.pipe(writeStream);

    stream.on('end', () => {
      console.log('File received and saved:', filename);
      socket.to(data.receiverId).emit('chat-message', {
        sender: data.sender,
        file: { name: data.name, size: data.size, status: 'received' }
      });
    });

    stream.on('error', (err) => {
      console.error('Error receiving file:', err);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});