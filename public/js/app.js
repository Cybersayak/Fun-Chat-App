const socket = io();
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send-button');
const usernameInput = document.getElementById('username');

// Enable/disable message input based on username
function toggleMessageInput(enabled) {
    messageInput.disabled = !enabled;
    sendButton.disabled = !enabled;
}

// Send message to server
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('chat-message', message);
        messageInput.value = '';
    }
}

// Handle enter key press
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Join the chat with a username
usernameInput.addEventListener('change', () => {
    const username = usernameInput.value.trim();
    if (username) {
        socket.emit('join', username);
        usernameInput.disabled = true;
        toggleMessageInput(true);
    }
});

// Notify others when typing
let typingTimeout;
messageInput.addEventListener('input', () => {
    socket.emit('typing');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stop-typing');
    }, 1000);
});

// Display messages from the server
socket.on('chat-message', (data) => {
    const output = document.getElementById('output');
    const messageClass = data.username === usernameInput.value ? 'sent' : 'received';
    output.innerHTML += `
        <p class="${messageClass}">
            <strong>${data.username}</strong>
            ${data.msg}
        </p>
    `;
    output.scrollTop = output.scrollHeight;
    document.getElementById('feedback').innerHTML = '';
});

// Display typing feedback
socket.on('typing', (username) => {
    const feedback = document.getElementById('feedback');
    feedback.innerHTML = `<p><em>${username} is typing...</em></p>`;
});

// Clear typing feedback
socket.on('stop-typing', () => {
    document.getElementById('feedback').innerHTML = '';
});

// System messages (join/leave)
function addSystemMessage(message) {
    const output = document.getElementById('output');
    output.innerHTML += `<p class="system-message"><em>${message}</em></p>`;
    output.scrollTop = output.scrollHeight;
}

// Notify when a user connects
socket.on('user-connected', (username) => {
    addSystemMessage(`${username} joined the chat`);
});

// Notify when a user disconnects
socket.on('user-disconnected', (username) => {
    addSystemMessage(`${username} left the chat`);
});


