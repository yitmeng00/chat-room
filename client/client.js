// Create a WebSocket connection to the server
const socket = new WebSocket("ws://127.0.0.1:3000/server/");

// Handle WebSocket connection events
socket.onopen = () => {
    document.getElementById("client__connection-status").innerHTML =
        "Online";
};

socket.onclose = () => {
    document.getElementById("client__connection-status").innerHTML =
        "Offline";
};

socket.onerror = (event) => {
    document.getElementById(
        "client__connection-status"
    ).innerHTML = `Error Connecting to Server: ${event.message}`;
};

// Listen for messages from the server
socket.onmessage = ({ data }) => {
    console.log(`Message from server: ${data}`);
    console.log(`Data type: ${typeof data}`);

    // Create a new paragraph element to display the received message
    const paragraph = document.createElement("p");
    paragraph.innerHTML = data;
    document.getElementById("client__messages").appendChild(paragraph);
    document.getElementById("client__input-msg").value = "";
};

// Send a message to the server when the "Send" button is clicked
document.getElementById("client__send-msg-btn").onclick = (e) => {
    e.preventDefault();

    const message = document.getElementById("client__input-msg").value.trim();

    if (message) {
        console.log(`Message to be send: ${message}`);
        console.log(`Data type: ${typeof message}`);

        socket.send(message);
    } else {
        alert(`Please input your message.`);
    }
};

// Close the WebSocket connection when the "Close" button is clicked
document.getElementById("client__close-connection-btn").onclick = (e) => {
    e.preventDefault();

    socket.close();
};
