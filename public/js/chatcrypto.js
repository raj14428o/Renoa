console.log("chatCrypto.js loaded");

document.addEventListener("DOMContentLoaded", async () => {

  // ------------------------------------------------
  // HARD GATE — wait for crypto + keys + room join
  // ------------------------------------------------
  if (!window.messagingReady) {
    console.error("messagingReady promise not found");
    return;
  }

  await window.messagingReady;

  console.log("Messaging fully ready");
  console.log("sharedSecret:", window.sharedSecret);
  console.log("roomId:", window.roomId);

  // ------------------------------------------------
  // SAFETY CHECKS
  // ------------------------------------------------
  if (!window.appSocket) {
    console.error("appSocket not found");
    return;
  }

  if (typeof window.encryptMessage !== "function") {
    console.error("encryptMessage missing");
    return;
  }

  if (typeof window.decryptMessage !== "function") {
    console.error("decryptMessage missing");
    return;
  }

  // ------------------------------------------------
  // MESSAGE STATES
  // ------------------------------------------------
  const MESSAGE_STATE = {
    PENDING: "pending",
    SENT: "sent",
  };

  // ------------------------------------------------
  // SEND MESSAGE (race-free)
  // ------------------------------------------------
  async function sendMessage(text) {
    if (!text) return;

    const messageId = crypto.randomUUID();

    // Optimistic UI
    renderMessage({
      id: messageId,
      text,
      sender: "me",
      state: MESSAGE_STATE.PENDING,
      timestamp: Date.now(),
    });

    try {
      // GUARANTEE key exists
      if (!window.sharedSecret) {
        console.warn("⏳ Waiting for shared secret...");
        await window.messagingReady;
      }

      //  Encrypt
      const { ciphertext, nonce } =
        await window.encryptMessage(text, window.sharedSecret);

      //  Emit
      window.appSocket.emit("send-message", {
        roomId: window.roomId,
        messageId,
        ciphertext,
        nonce,
      });

      //  Mark sent
      updateMessageState(messageId, MESSAGE_STATE.SENT);

    } catch (err) {
      console.error(" Send failed:", err);
    }
  }

  // ------------------------------------------------
  // RECEIVE MESSAGE
  // ------------------------------------------------
  window.appSocket.on("receive-message", async (data) => {
    if (!data || !data.messageId) return;

    try {
      if (!window.sharedSecret) {
        console.warn(" Waiting for key before decrypt...");
        await window.messagingReady;
      }

      const text = await window.decryptMessage(
        data.ciphertext,
        data.nonce,
        window.sharedSecret
      );

      renderMessage({
        id: data.messageId,
        text,
        sender: "them",
        state: MESSAGE_STATE.SENT,
        timestamp: Date.now(),
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
    console.warn(" Chat input elements missing");
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
  function renderMessage(msg) {
    const chat = document.getElementById("chatMessages");
    if (!chat) return;

    const empty = chat.querySelector(".chat-empty");
    if (empty) empty.remove();

    const div = document.createElement("div");
    div.className = `message ${msg.sender}`;
    div.dataset.id = msg.id;

    div.innerHTML = `
      <div class="bubble">
        <span class="text"></span>
        <span class="state">
          ${msg.state === MESSAGE_STATE.PENDING ? "⏳" : "✓"}
        </span>
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

