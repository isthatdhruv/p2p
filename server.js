// my-p2p-messenger/server.js
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const path = require('path');

const port = process.env.PORT || 3000;


// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Handle chat messages
  socket.on('chat-message', (message) => {
    console.log('Received message:', message);
    // Broadcast the message to all other users (or to a specific recipient)
    socket.broadcast.emit('chat-message', message); 
    // You can modify this to send the message to a specific user 
    // using socket.to(receiverId).emit('chat-message', message);
  });

  // Handle file transfer (you'll need to implement file chunking and transfer logic)
  socket.on('file-transfer', (fileChunk) => {
    // ... (Implement file transfer logic here)
  });
});

server.listen(port,'0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});