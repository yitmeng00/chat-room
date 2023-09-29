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
    console.log("Connection started.");

    // Handle incoming WebSocket messages
    socket.on("message", (message) => {
        console.log(`Incoming msg: ${message}`);
    });

    // Handle WebSocket connection closing
    socket.on("close", () => {
        console.log("Connection closed.");
    });
});

// Define a route
app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
