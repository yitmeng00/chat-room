const WS_URL = "ws://127.0.0.1:3000/server/";

const MESSAGE_TYPES = Object.freeze({
    NAME: "name",
    JOIN: "join",
    WELCOME: "welcome",
    MESSAGE: "message",
    LEAVE: "leave",
    ONLINE_COUNT: "online_count",
});

const ELEMENT_IDS = Object.freeze({
    CONNECTION_STATUS: "client__connection-status",
    ONLINE_COUNT: "client__online-count",
    MESSAGES: "client__messages",
    INPUT_MSG: "client__input-msg",
    SEND_BTN: "client__send-msg-btn",
    CLOSE_BTN: "client__close-connection-btn",
});

const createElement = (tag, classes = [], attrs = {}) => {
    const el = document.createElement(tag);
    if (classes.length) el.classList.add(...classes);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
};

const setConnectionStatus = (state) => {
    const el = document.getElementById(ELEMENT_IDS.CONNECTION_STATUS);
    el.className = "";

    if (state === "active") {
        el.classList.add("inline-block", "w-2", "h-2", "rounded-full", "bg-green-400");
        el.title = "Active";
    } else {
        el.classList.add("inline-block", "w-2", "h-2", "rounded-full", "bg-gray-500");
        el.title = "Inactive";
    }
};

const scrollToBottom = () => {
    const container = document.getElementById(ELEMENT_IDS.MESSAGES).parentElement;
    container.scrollTop = container.scrollHeight;
};

const renderMessage = ({ type, name, message, isSelf }) => {
    const messagesEl = document.getElementById(ELEMENT_IDS.MESSAGES);
    let container;

    if (type === MESSAGE_TYPES.MESSAGE) {
        container = createElement("div", [
            "flex",
            "flex-col",
            "mb-1",
            ...(isSelf ? ["items-end"] : ["items-start"]),
        ]);

        if (!isSelf) {
            const nameEl = createElement("span", [
                "text-xs",
                "text-gray-500",
                "font-medium",
                "ml-3",
                "mb-0.5",
            ]);
            nameEl.textContent = name;
            container.appendChild(nameEl);
        }

        const bubble = createElement("div", [
            "max-w-xs",
            "sm:max-w-sm",
            "px-4",
            "py-2",
            "rounded-2xl",
            "text-sm",
            "break-words",
            "leading-relaxed",
            ...(isSelf
                ? ["bg-indigo-500", "text-white", "rounded-tr-sm"]
                : ["bg-white", "text-gray-800", "rounded-tl-sm", "shadow-sm"]),
        ]);
        bubble.textContent = message;
        container.appendChild(bubble);
    } else if (
        type === MESSAGE_TYPES.JOIN ||
        type === MESSAGE_TYPES.LEAVE ||
        type === MESSAGE_TYPES.WELCOME
    ) {
        container = createElement("div", ["flex", "justify-center", "my-2"]);

        const pill = createElement("span", [
            "text-xs",
            "text-gray-500",
            "bg-gray-200",
            "rounded-full",
            "px-3",
            "py-1",
        ]);

        if (type === MESSAGE_TYPES.WELCOME) {
            pill.textContent = "Welcome to the room!";
        } else if (type === MESSAGE_TYPES.JOIN) {
            pill.textContent = isSelf ? "You joined the room" : `${name} joined the room`;
        } else if (type === MESSAGE_TYPES.LEAVE) {
            pill.textContent = isSelf ? "You left the room" : `${name} left the room`;
        }

        container.appendChild(pill);
    } else {
        return;
    }

    messagesEl.appendChild(container);
    scrollToBottom();
};

const sendMessage = (socket, inputEl) => {
    const message = inputEl.value.trim();

    if (!message) {
        alert("Please input your message.");
        return;
    }

    if (socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ type: MESSAGE_TYPES.MESSAGE, message }));
    inputEl.value = "";
};

const closeModal = (modal) => {
    if (modal) modal.style.display = "none";
};

const openModal = (socket) => {
    return new Promise((resolve) => {
        const modal = createElement(
            "div",
            [
                "fixed",
                "inset-0",
                "bg-black/60",
                "transition-opacity",
            ],
            {
                id: "client__dynamic-modal",
                "aria-labelledby": "modal-title",
                role: "dialog",
                "aria-modal": "true",
            },
        );

        const overlay = createElement("div", [
            "fixed",
            "inset-0",
            "z-10",
            "w-screen",
            "overflow-y-auto",
        ]);
        const overlay2 = createElement("div", [
            "flex",
            "min-h-full",
            "justify-center",
            "items-center",
            "px-4",
        ]);
        const modalContent = createElement("div", [
            "w-full",
            "max-w-sm",
            "overflow-hidden",
            "rounded-2xl",
            "bg-slate-800",
            "shadow-2xl",
        ]);

        const modalHeader = createElement("div", [
            "px-5",
            "pt-4",
            "flex",
            "justify-end",
        ]);
        const closeButton = createElement("button", [
            "text-gray-400",
            "hover:text-red-400",
            "transition-colors",
            "w-9",
            "h-9",
            "flex",
            "items-center",
            "justify-center",
            "rounded-full",
            "hover:bg-slate-700",
            "cursor-pointer",
        ]);
        closeButton.appendChild(
            createElement("i", ["fa-solid", "fa-xmark", "fa-lg"]),
        );
        modalHeader.appendChild(closeButton);

        const modalBody = createElement("div", ["px-6", "pb-2", "pt-1"]);

        const avatarDiv = createElement("div", [
            "w-14",
            "h-14",
            "bg-indigo-500",
            "rounded-full",
            "flex",
            "items-center",
            "justify-center",
            "mx-auto",
            "mb-4",
        ]);
        avatarDiv.appendChild(
            createElement("i", ["fa-regular", "fa-circle-user", "fa-2xl", "text-white"]),
        );

        const title = createElement("h3", [
            "text-white",
            "text-lg",
            "font-semibold",
            "text-center",
            "mb-1",
        ]);
        title.textContent = "Enter your name";

        const subtitle = createElement("p", [
            "text-gray-400",
            "text-sm",
            "text-center",
            "mb-4",
        ]);
        subtitle.textContent = "Choose a name to appear in the chat";

        const inputWrapper = createElement("div");
        const inputField = createElement(
            "input",
            [
                "w-full",
                "bg-slate-700",
                "text-white",
                "placeholder-gray-400",
                "rounded-xl",
                "px-4",
                "py-3",
                "text-sm",
                "focus:outline-none",
                "focus:ring-2",
                "focus:ring-indigo-500",
                "transition",
            ],
            { type: "text", placeholder: "Your name..." },
        );
        inputWrapper.appendChild(inputField);

        modalBody.appendChild(avatarDiv);
        modalBody.appendChild(title);
        modalBody.appendChild(subtitle);
        modalBody.appendChild(inputWrapper);

        const modalFooter = createElement("div", [
            "px-6",
            "py-4",
            "flex",
            "flex-col",
            "gap-2",
        ]);

        const joinButton = createElement("button", [
            "w-full",
            "bg-indigo-500",
            "hover:bg-indigo-600",
            "active:bg-indigo-700",
            "text-white",
            "rounded-xl",
            "py-2.5",
            "text-sm",
            "font-semibold",
            "transition-colors",
            "cursor-pointer",
        ], { type: "button" });
        joinButton.textContent = "Join";

        const guestButton = createElement("button", [
            "w-full",
            "bg-slate-700",
            "hover:bg-slate-600",
            "text-gray-300",
            "rounded-xl",
            "py-2.5",
            "text-sm",
            "font-semibold",
            "transition-colors",
            "cursor-pointer",
        ], { type: "button" });
        guestButton.textContent = "Join as a guest";

        modalFooter.appendChild(joinButton);
        modalFooter.appendChild(guestButton);

        modal.appendChild(overlay);
        overlay.appendChild(overlay2);
        overlay2.appendChild(modalContent);
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        document.body.appendChild(modal);

        const joinWithName = (name) => {
            socket.send(JSON.stringify({ type: MESSAGE_TYPES.NAME, name }));
            closeModal(modal);
            setConnectionStatus("active");
            resolve();
        };

        closeButton.onclick = () => {
            closeModal(modal);
            resolve();
        };

        joinButton.onclick = () => {
            const name = inputField.value.trim();
            if (name) {
                joinWithName(name);
            } else {
                alert("Please enter your name.");
            }
        };

        guestButton.onclick = () => joinWithName("anonymous");
    });
};

document.addEventListener("DOMContentLoaded", async () => {
    const socket = new WebSocket(WS_URL);

    await openModal(socket);

    socket.onclose = () => setConnectionStatus("inactive");

    socket.onerror = () => {
        document.getElementById(ELEMENT_IDS.CONNECTION_STATUS).textContent =
            "Error: Unable to connect to server.";
    };

    socket.onmessage = ({ data }) => {
        const messageData = JSON.parse(data);
        const { type, onlineCount } = messageData;

        if (type === MESSAGE_TYPES.ONLINE_COUNT) {
            document.getElementById(ELEMENT_IDS.ONLINE_COUNT).textContent =
                onlineCount;
        } else {
            renderMessage(messageData);
        }
    };

    const inputMsg = document.getElementById(ELEMENT_IDS.INPUT_MSG);

    inputMsg.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage(socket, inputMsg);
        }
    });

    document.getElementById(ELEMENT_IDS.SEND_BTN).onclick = (e) => {
        e.preventDefault();
        sendMessage(socket, inputMsg);
    };

    document.getElementById(ELEMENT_IDS.CLOSE_BTN).onclick = (e) => {
        e.preventDefault();
        alert("You left the conversation.");
        socket.close();
    };
});
