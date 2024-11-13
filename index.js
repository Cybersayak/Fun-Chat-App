const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static('public'));

let onlineUsers = {}; // Track users online

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User joins the chat with a username
    socket.on('join', (username) => {
        onlineUsers[socket.id] = username;
        io.emit('user-connected', username); // Notify everyone
    });

    // Handle incoming chat message
    socket.on('chat-message', (msg) => {
        const username = onlineUsers[socket.id];
        io.emit('chat-message', { username, msg });
    });

    // "User is typing" feature
    socket.on('typing', () => {
        const username = onlineUsers[socket.id];
        socket.broadcast.emit('typing', username);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const username = onlineUsers[socket.id];
        delete onlineUsers[socket.id];
        io.emit('user-disconnected', username); // Notify everyone
    });
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
