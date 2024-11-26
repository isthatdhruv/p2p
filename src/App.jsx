// my-p2p-messenger/src/App.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import io from 'socket.io-client';
import ss from 'socket.io-stream';

const socket = io('http://192.168.60.33:3000'); // Replace with your LAN IP

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  useEffect(() => {
    const enteredUsername = prompt('Enter your username:');
    setUsername(enteredUsername || 'Anonymous');
    socket.emit('get-users');

    socket.on('chat-message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    socket.on('user-connected', (user) => {
      if (Array.isArray(user)) {  // Check if it's an array of users
        setUsers(user);
      } else {
        setUsers(prevUsers => [...prevUsers, user]);
      }
    });

    socket.on('user-disconnected', (userId) => {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    });

    return () => {
      socket.off('chat-message');
      socket.off('user-connected');
      socket.off('user-disconnected');
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      const newMessage = { sender: username, text: message };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      socket.emit('chat-message', newMessage);
      setMessage('');
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);

    if (event.target.files[0]) {
      const fileMessage = {
        sender: username,
        file: { name: event.target.files[0].name }
      };
      setMessages(prevMessages => [...prevMessages, fileMessage]);
    }
  };

  const handleFileTransfer = () => {
    if (file && selectedRecipient) {
      const stream = ss.createStream();

      socket.emit('file-info', {
        name: file.name,
        size: file.size,
        sender: username,
        receiverId: selectedRecipient.id
      });

      ss(socket).emit('file-stream', stream, {
        name: file.name,
        size: file.size,
        sender: username, // Include sender in the stream data
        receiverId: selectedRecipient.id
      });

      const blobStream = ss.createBlobReadStream(file);
      blobStream.pipe(stream);

      setMessages(prevMessages => [
        ...prevMessages,
        {
          sender: username,
          file: { name: file.name, size: file.size, status: 'sent' }
        }
      ]);
    } else {
      alert('Please select a recipient.');
    }
  };

  return (
    <div className="container">
      <h1>P2P LAN Messenger</h1>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message"
          className="form-control"
        />
        <button onClick={handleSendMessage} className="btn btn-primary">
          Send
        </button>
      </div>
      <div className="file-input">
        <input type="file" onChange={handleFileChange} id="fileInput" />
        <label htmlFor="fileInput" className="btn btn-primary">
          Select File
        </label>
        <button onClick={handleFileTransfer} disabled={!file} className="btn btn-success">
          Transfer File
        </button>
      </div>
      <div>
        <select
          value={selectedRecipient ? selectedRecipient.id : ''}
          onChange={(e) => {
            const recipientId = e.target.value;
            setSelectedRecipient(users.find(user => user.id === recipientId));
          }}
        >
          <option value="">Select Recipient</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
      </div>
      <ul className="messages">
        {messages.map((msg, index) => (
          <li key={index}>
            <span className={`sender ${msg.sender === username ? 'you' : 'other'}`}>
              {msg.sender}:
            </span>
            <span className="message-text">
              {msg.text}
              {msg.file && (
                <span>
                  (File: {msg.file.name}, Size: {msg.file.size}
                  {msg.file.status && `, Status: ${msg.file.status}`}
                  {msg.file.status === 'received' && msg.file.data && (
                    <a href={msg.file.data} download={msg.file.name}>Open</a>
                  )}
                  )
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);