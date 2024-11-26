// my-p2p-messenger/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import io from 'socket.io-client';
import './app.css';

const socket = io('http://192.168.1.2:3000');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Listen for incoming chat messages
    socket.on('chat-message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('chat-message', { sender: 'You', text: message }); // Replace 'You' with the actual sender ID
      setMessage('');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileTransfer = () => {
    if (file) {
      // Implement file transfer logic here (chunking, sending, receiving)
      // ...
      console.log('File selected:', file);
      // Example: Send file name and size for demonstration
      socket.emit('file-transfer', { name: file.name, size: file.size }); 
    }
  };

  return (
    <div className='container'>
      <h1>P2P LAN Messenger</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileTransfer} disabled={!file}>
          Transfer File
        </button>
      </div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <b>{msg.sender}:</b> {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);