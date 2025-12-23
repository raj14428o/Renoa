
console.log("chatCrypto.js loaded");
// ------------------------------------------------
  // MESSAGE STATES
  // ------------------------------------------------
  const MESSAGE_STATE = {
    PENDING: "pending",
    SENT: "sent",
  };

document.addEventListener("DOMContentLoaded", async () => {

  // ------------------------------------------------
  // HARD GATE
  // ------------------------------------------------
  if (!window.messagingReady) {
    console.error("messagingReady promise not found");
    return;
  }

  await window.messagingReady;

  const myUserId = window.myUserId; 
  const roomId = window.roomId;

  if (!roomId || !myUserId) {
    console.error("roomId or myUserId missing");
    return;
  }

  // ------------------------------------------------
  // LOAD MESSAGE HISTORY
  // ------------------------------------------------
  async function loadMessages() {
    const res = await fetch(`/messages/${roomId}`);
    if (!res.ok) {
      console.error("Failed to load messages");
      return;
    }

    const encryptedMessages = await res.json();

    for (const msg of encryptedMessages) {
      try {
        const text = await window.decryptMessage(
          msg.ciphertext,
          msg.nonce,
          window.sharedSecret
        );

        renderMessage({
          id: msg._id,
          text,
          sender: msg.sender === myUserId ? "me" : "them",
          state: "sent",
          timestamp: msg.createdAt,
        });
      } catch (err) {
        console.error(" Failed to decrypt message", err);
      }
    }
  }

  await loadMessages();

  console.log("Messaging ready");
  console.log("roomId:", roomId);

  // ------------------------------------------------
  // SAFETY CHECKS
  // ------------------------------------------------
  if (!window.appSocket) {
    console.error("appSocket not found");
    return;
  }

  if (typeof window.encryptMessage !== "function" ||
      typeof window.decryptMessage !== "function") {
    console.error("crypto helpers missing");
    return;
  }

  
  // ------------------------------------------------
  // SEND MESSAGE
  // ------------------------------------------------
  async function sendMessage(text) {
    if (!text) return;

    const tempId = crypto.randomUUID();

    renderMessage({
      id: tempId,
      text,
      sender: "me",
      state: MESSAGE_STATE.PENDING,
      timestamp: Date.now(),
    });

    await window.messagingReady;

    try {
      const { ciphertext, nonce } =
        await window.encryptMessage(text, window.sharedSecret);

      window.appSocket.emit("send-message", {
        roomId,
        ciphertext,
        nonce,
      });

      updateMessageState(tempId, MESSAGE_STATE.SENT);
    } catch (err) {
      console.error("Send failed:", err);
    }
  }

  // ------------------------------------------------
  // RECEIVE MESSAGE
  // ------------------------------------------------
  window.appSocket.on("receive-message", async (data) => {
    if (!data || data.roomId !== roomId) return;

    if (data.sender === myUserId) return;
    
    try {
      const text = await window.decryptMessage(
        data.ciphertext,
        data.nonce,
        window.sharedSecret
      );

      renderMessage({
        id: data.messageId,
        text,
        sender: data.sender === myUserId ? "me" : "them",
        state: MESSAGE_STATE.SENT,
        timestamp: data.createdAt || Date.now(),
      });
    } catch (err) {
      console.error("Decryption failed:", err);
    }
  });

  // ------------------------------------------------
  // UI WIRING
  // ------------------------------------------------
  const sendBtn = document.getElementById("sendBtn");
  const input = document.getElementById("messageInput");

  if (!sendBtn || !input) {
    console.warn("Chat input elements missing");
    return;
  }

  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;
    sendMessage(text);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });

  // ------------------------------------------------
  // UI HELPERS
  // ------------------------------------------------
  function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(d, today)) return "Today";
  if (isSameDay(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

let lastRenderedDate = null;

function renderDateSeparator(label) {
  const chat = document.getElementById("chatMessages");
  if (!chat) return;

  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.textContent = label;

  chat.appendChild(sep);
}

  function renderMessage(msg) {
    const chat = document.getElementById("chatMessages");
    if (!chat) return;

    const empty = chat.querySelector(".chat-empty");
    if (empty) empty.remove();

 // Date separator logic

function renderDateSeparator(label) {
  const chat = document.getElementById("chatMessages");
  if (!chat) return;

  const sep = document.createElement("div");
  sep.className = "date-separator";
  sep.textContent = label;

  chat.appendChild(sep);
}


    const div = document.createElement("div");
    div.className = `message ${msg.sender}`;
    div.dataset.id = msg.id;

      div.innerHTML = `
    <div class="bubble">
      <span class="text"></span>
      <div class="meta">
        <span class="time">${formatTime(msg.timestamp)}</span>
        <span class="state">
          ${msg.state === MESSAGE_STATE.PENDING ? "⏳" : "✓"}
        </span>
      </div>
    </div>
  `;

    div.querySelector(".text").textContent = msg.text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function updateMessageState(messageId, newState) {
    const el = document.querySelector(
      `.message[data-id="${messageId}"] .state`
    );
    if (!el) return;

    el.textContent = newState === MESSAGE_STATE.SENT ? "✓" : "⏳";
  }

});

