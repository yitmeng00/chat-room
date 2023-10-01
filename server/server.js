const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Create an Express application
const app = express();

// Create an HTTP server using Express app
const server = http.createServer(app);

// Create a WebSocket server by attaching it to the HTTP server
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Map();

// WebSocket server event handling
wss.on("connection", (socket) => {
    console.log(`Connection started.`);

    // Generate a unique client ID
    const clientId = generateClientId();

    clients.set(socket, clientId);

    // Notify all clients when a new user joins the chat
    broadcast(`Client ${clientId} joined the room`);

    // Handle incoming messages from clients
    socket.on("message", (message) => {
        console.log(`Message from Client ${clientId}: ${message}`);
        console.log(`Msg Type: ${typeof message}`);
        console.log(`Msg toString: ${message.toString()}`);

        // Broadcast the received message with the client's name to all connected clients
        broadcast(`Client ${clientId}: ${message}`);
    });

    // Handle client disconnection
    socket.on("close", () => {
        console.log(`Connection closed.`);

        const clientId = clients.get(socket);
        
        socket.terminate();
        clients.delete(socket);
        
        // Notify all clients when a user leaves the chat
        broadcast(`Client ${clientId} left the room`);

        // Close the WebSocket server if there are no connected clients
        if (wss.clients.size == 0) wss.close();
    });
});

wss.on("close", () => {
    console.log(`Server is closed`);
});

function broadcast(message) {
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Generate a random alphanumeric client ID
function generateClientId() {
    return Math.random().toString(36).substring(2, 11);
}

// Define a route
app.get("/", (req, res) => {
    res.send(`Hello, World!`);
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
