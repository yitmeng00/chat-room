import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

// Create an Express application
const app = express();

// Create an HTTP server using Express app
const server = http.createServer(app);

// Create a WebSocket server by attaching it to the HTTP server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Map();

// WebSocket server event handling
wss.on("connection", (socket) => {
    console.log(`Connection started.`);

    // Handle incoming messages from clients
    socket.on("message", (messages) => {
        try {
            const data = JSON.parse(messages);

            if (data.type === "name") {
                const { name } = data;

                // Generate a unique client ID
                const clientId = generateClientId();

                if (name === "anonymous") {
                    // If the client joined as a guest, store the ID and an empty name
                    clients.set(socket, { clientName: "", clientID: clientId });
                } else {
                    // If the client joined with a name, store both name and ID
                    clients.set(socket, {
                        clientName: name,
                        clientID: clientId,
                    });
                }

                const { clientName, clientID } = clients.get(socket);
                const client = clientName || `Guest ${clientID}`;

                const broadcastData = {
                    type: "join",
                    clientID,
                    name: client,
                    message: "joined the room.",
                };
                broadcast(broadcastData);

                const msgSendToClient = JSON.stringify({
                    type: "welcome",
                    clientID,
                    name: client,
                    message: `Welcome to the room!`,
                });

                socket.send(msgSendToClient);

                console.log(`Client Name: ${client}`);
            } else if (data.type === "message") {
                const { message } = data;

                const { clientName, clientID } = clients.get(socket);
                const client = clientName || `Guest ${clientID}`;

                const broadcastData = {
                    type: "message",
                    clientID,
                    name: client,
                    message,
                };
                broadcast(broadcastData);

                console.log(`Message from ${client}: ${message}`);
                console.log(`Msg Type: ${typeof message}`);
                console.log(`Msg toString: ${message.toString()}`);
            }
        } catch (error) {
            console.error("Invalid message format.");
        }
    });

    // Handle client disconnection
    socket.on("close", () => {
        console.log(`Connection closed.`);

        if (wss.clients.size > 1) {
            const { clientName, clientID } = clients.get(socket);
            const client = clientName || `Guest ${clientID}`;

            socket.terminate();

            const broadcastData = {
                type: "leave",
                clientID,
                name: client,
                message: `left the room.`,
            };
            // Notify all clients when a user leaves the chat
            broadcast(broadcastData);
        }

        // Close the WebSocket server if there are no connected clients
        if (wss.clients.size == 0) wss.close();
    });
});

wss.on("close", () => {
    console.log(`Server is closed`);
});

function broadcast(broadcastData) {
    clients.forEach((socketData, client) => {
        if (client.readyState === 1) {
            const { clientID } = broadcastData;
            const msgDataSendToClient = JSON.stringify({
                ...broadcastData,
                isSelf: socketData.clientID === clientID ? true : false,
            });

            client.send(msgDataSendToClient);
        } else {
            console.error("WebSocket connection is not open.");
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
