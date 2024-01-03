document.addEventListener("DOMContentLoaded", async function () {
    // Create a WebSocket connection to the server
    const socket = new WebSocket("ws://127.0.0.1:3000/server/");

    // Open modal
    await openModal(socket);

    // Handle WebSocket connection events
    // socket.onopen = () => {
    //     document.getElementById("client__connection-status").innerHTML =
    //         "Online";
    // };

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
        const messageData = JSON.parse(data);
        const { type, clientID, name, message } = messageData;

        console.log(`Message data from server:`, messageData);
        console.log(`Data type of type: ${typeof type}`);
        console.log(`Data type of client ID: ${typeof clientID}`);
        console.log(`Data type of client Name: ${typeof name}`);
        console.log(`Data type of message: ${typeof message}`);

        let msg;
        switch (type) {
            case "join":
                msg = `${name} joined the room.`;
                break;
            case "welcome":
                msg = `Welcome to the room!`;
                break;
            case "message":
                msg = `${name}: ${message}`;
                break;
            case "leave":
                msg = `${name} left the room.`;
                break;
        }

        // Create a new paragraph element to display the received message
        const paragraph = document.createElement("p");
        paragraph.innerHTML = msg;
        document.getElementById("client__messages").appendChild(paragraph);
        document.getElementById("client__input-msg").value = "";
    };

    // Send a message to the server when the "Send" button is clicked or Enter key is pressed
    const inputMsg = document.getElementById("client__input-msg");

    inputMsg.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            sendMessage(socket, inputMsg);
        }
    });

    // Send a message to the server when the "Send" button is clicked
    document.getElementById("client__send-msg-btn").onclick = (e) => {
        e.preventDefault();

        sendMessage(socket, inputMsg);
    };

    // Close the WebSocket connection when the "Close" button is clicked
    document.getElementById("client__close-connection-btn").onclick = (e) => {
        e.preventDefault();

        const chatSpace = document.querySelector(".client__chatroom-container");
        chatSpace.style.display = "none";

        alert("You left the conversation.");

        socket.close();
    };
});

const sendMessage = (socket, inputMsg) => {
    const message = inputMsg.value.trim();

    if (message) {
        console.log(`Message to be sent: ${message}`);
        console.log(`Data type: ${typeof message}`);

        const msgSendToServer = JSON.stringify({ type: "message", message });

        socket.send(msgSendToServer);
        inputMsg.value = "";
    } else {
        alert(`Please input your message.`);
    }
};

// Initialize a modal
const openModal = (socket) => {
    return new Promise((resolve) => {
        // Create the modal container
        const modal = document.createElement("div");
        modal.id = "client__dynamic-modal";
        modal.setAttribute("aria-labelledby", "modal-title");
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.classList.add(
            "fixed",
            "inset-0",
            "bg-gray-500",
            "bg-opacity-75",
            "transition-opacity"
        );

        // Create the modal overlay
        const overlay = document.createElement("div");
        overlay.classList.add(
            "fixed",
            "inset-0",
            "z-10",
            "w-screen",
            "overflow-y-auto"
        );

        const overlay2 = document.createElement("div");
        overlay2.classList.add(
            "flex",
            "min-h-full",
            "justify-center",
            "items-center"
        );

        // Create the modal content
        const modalContent = document.createElement("div");
        modalContent.classList.add(
            "overflow-hidden",
            "rounded-lg",
            "bg-white",
            "shadow-xl",
            "transition-all"
        );

        // Create the modal header
        const modalHeader = document.createElement("div");
        modalHeader.classList.add(
            "border-b",
            "border-gray",
            "px-6",
            "py-3",
            "flex",
            "flex-row-reverse"
        );

        const closeButton = document.createElement("button");
        const closeButtonIcon = document.createElement("i");
        closeButtonIcon.classList.add(
            "fa-solid",
            "fa-xmark",
            "fa-xl",
            "hover:text-red-600"
        );

        modalHeader.appendChild(closeButton);
        closeButton.appendChild(closeButtonIcon);

        // Create the modal body
        const modalBody = document.createElement("div");
        modalBody.classList.add("bg-white", "px-6", "py-4", "flex");

        const avatarDiv = document.createElement("div");
        avatarDiv.classList.add(
            "flex",
            "h-10",
            "w-10",
            "items-center",
            "justify-center",
            "rounded-full"
        );

        const avatarIcon = document.createElement("i");
        avatarIcon.classList.add("fa-regular", "fa-circle-user", "fa-2xl");

        avatarDiv.appendChild(avatarIcon);

        const textDiv = document.createElement("div");
        textDiv.classList.add("ml-4", "text-left", "grow");

        const title = document.createElement("h3");
        title.classList.add("text-base", "font-semibold");
        title.textContent = "Enter your name";

        const input = document.createElement("div");
        input.classList.add("mt-2");

        const inputField = document.createElement("input");
        inputField.setAttribute("type", "text");
        inputField.classList.add(
            "p-2",
            "border",
            "border-black",
            "w-full",
            "rounded-md"
        );

        input.appendChild(inputField);
        textDiv.appendChild(title);
        textDiv.appendChild(input);

        modalBody.appendChild(avatarDiv);
        modalBody.appendChild(textDiv);

        // Create the modal footer
        const modalFooter = document.createElement("div");
        modalFooter.classList.add(
            "bg-gray-50",
            "px-6",
            "py-4",
            "flex",
            "flex-row-reverse",
            "gap-3"
        );

        const joinButton = document.createElement("button");
        joinButton.setAttribute("type", "button");
        joinButton.classList.add(
            "w-auto",
            "justify-center",
            "rounded-md",
            "bg-white",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            "text-gray-900",
            "shadow-sm",
            "ring-1",
            "ring-inset",
            "ring-gray-300",
            "hover:bg-gray-50"
        );
        joinButton.textContent = "Join";

        const guestButton = document.createElement("button");
        guestButton.setAttribute("type", "button");
        guestButton.classList.add(
            "w-auto",
            "justify-center",
            "rounded-md",
            "bg-white",
            "px-3",
            "py-2",
            "text-sm",
            "font-semibold",
            "text-gray-900",
            "shadow-sm",
            "ring-1",
            "ring-inset",
            "ring-gray-300",
            "hover:bg-gray-50"
        );
        guestButton.textContent = "Join as a guest";

        modalFooter.appendChild(joinButton);
        modalFooter.appendChild(guestButton);

        modal.appendChild(overlay);
        overlay.appendChild(overlay2);
        overlay2.appendChild(modalContent);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);

        // Close modal action
        closeButton.onclick = () => {
            closeModal(modal);
            resolve();
        };

        // Join with name
        joinButton.onclick = () => {
            const name = inputField.value.trim();
            if (name) {
                const msgSendToServer = JSON.stringify({ type: "name", name });

                socket.send(msgSendToServer);
                closeModal(modal);
                resolve();

                // Set the status to "Online" after the user joins
                document.getElementById("client__connection-status").innerHTML =
                    "Online";
            } else {
                alert("Please enter your name.");
            }
        };

        // Join as a guest
        guestButton.onclick = () => {
            const msgSendToServer = JSON.stringify({
                type: "name",
                name: "anonymous",
            });

            socket.send(msgSendToServer);
            closeModal(modal);
            resolve();

            // Set the status to "Online" after the user joins
            document.getElementById("client__connection-status").innerHTML =
                "Online";
        };

        document.body.appendChild(modal);
    });
};

// Close modal
const closeModal = (modal) => {
    if (modal) {
        modal.style.display = "none";
    }
};
