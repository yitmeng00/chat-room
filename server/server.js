const express = require("express");
const http = require("http");
const WebSocket = require("ws");

// Create an Express application
const app = express();

// Create an HTTP server using Express app
const server = http.createServer(app);

// Create a WebSocket server by attaching it to the HTTP server
const wss = new WebSocket.Server({ server });

// WebSocket server event handling
wss.on("connection", (socket) => {
    console.log(`Connection started.`);

    // Handle incoming messages from clients
    socket.on("message", (message) => {
        console.log(`Client msg: ${message}`);
        console.log(`Msg Type: ${typeof message}`);
        console.log(`Msg toString: ${message.toString()}`);

        // Broadcast the received message to all connected clients
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    // Handle client disconnection
    socket.on("close", () => {
        console.log(`Connection closed.`);
        socket.terminate();

        // Close the WebSocket server if there are no connected clients
        if (wss.clients.size == 0) wss.close();
    });
});

wss.on("close", () => {
    console.log("Server is closed");
});

// Define a route
app.get("/", (req, res) => {
    res.send(`Hello, World!`);
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
