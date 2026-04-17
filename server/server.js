import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT || 3000;

const MESSAGE_TYPES = Object.freeze({
    NAME: "name",
    MESSAGE: "message",
    JOIN: "join",
    WELCOME: "welcome",
    LEAVE: "leave",
    ONLINE_COUNT: "online_count",
});

const MAX_NAME_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 500;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();
let onlineClientCount = 0;

wss.on("connection", (socket) => {
    console.log("Client connected.");

    socket.on("message", (data) => {
        try {
            const payload = JSON.parse(data);

            if (payload.type === MESSAGE_TYPES.NAME) {
                const rawName =
                    typeof payload.name === "string" ? payload.name.trim() : "";
                const name = rawName.slice(0, MAX_NAME_LENGTH);
                const clientId = generateClientId();

                clients.set(socket, {
                    clientName: name === "anonymous" ? "" : name,
                    clientID: clientId,
                });

                const { clientName, clientID } = clients.get(socket);
                const displayName = clientName || `Guest ${clientID}`;

                broadcast({
                    type: MESSAGE_TYPES.JOIN,
                    clientID,
                    name: displayName,
                    message: "joined the room.",
                });

                socket.send(
                    JSON.stringify({
                        type: MESSAGE_TYPES.WELCOME,
                        clientID,
                        name: displayName,
                        message: "Welcome to the room!",
                    }),
                );

                console.log(`${displayName} joined.`);

                onlineClientCount++;
                updateOnlineClientCount();
            } else if (payload.type === MESSAGE_TYPES.MESSAGE) {
                if (!clients.has(socket)) return;

                const { clientName, clientID } = clients.get(socket);
                const displayName = clientName || `Guest ${clientID}`;
                const message =
                    typeof payload.message === "string"
                        ? payload.message.trim().slice(0, MAX_MESSAGE_LENGTH)
                        : "";

                if (!message) return;

                broadcast({
                    type: MESSAGE_TYPES.MESSAGE,
                    clientID,
                    name: displayName,
                    message,
                });

                console.log(`Message from ${displayName}: ${message}`);
            }
        } catch (error) {
            console.error("Failed to process message:", error.message);
        }
    });

    socket.on("close", () => {
        console.log("Client disconnected.");

        if (!clients.has(socket)) return;

        const { clientName, clientID } = clients.get(socket);
        const displayName = clientName || `Guest ${clientID}`;

        clients.delete(socket);
        onlineClientCount--;

        if (wss.clients.size > 0) {
            broadcast({
                type: MESSAGE_TYPES.LEAVE,
                clientID,
                name: displayName,
                message: "left the room.",
            });
            updateOnlineClientCount();
        } else {
            wss.close();
        }
    });
});

wss.on("close", () => {
    console.log("WebSocket server closed.");
});

const broadcast = (broadcastData) => {
    const { clientID } = broadcastData;

    clients.forEach((socketData, client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(
                JSON.stringify({
                    ...broadcastData,
                    isSelf: socketData.clientID === clientID,
                }),
            );
        }
    });
};

const updateOnlineClientCount = () => {
    broadcast({
        type: MESSAGE_TYPES.ONLINE_COUNT,
        onlineCount: onlineClientCount,
    });
};

const generateClientId = () => {
    return Math.random().toString(36).substring(2, 11);
};

app.get("/", (_req, res) => {
    res.send("Hello, World!");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
