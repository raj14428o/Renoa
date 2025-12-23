async function loadConversationHistory() {
  console.log("🚀 loadConversationHistory called");
   const res = await fetch("/messages/conversations", {
    method: "GET",
    credentials: "include",   
    cache: "no-store",        
    headers: {
      "Accept": "application/json"
    }
  });


  const {conversations}= await res.json();
  console.log("📦 conversations data:", conversations);

  const history = document.getElementById("conversationHistory");
  const empty = document.getElementById("chatEmpty");

  if (!history || !empty) return;

  if (!conversations || conversations.length === 0) {
    // no conversations → show empty state
    empty.classList.remove("hidden");
    history.classList.add("hidden");
    return;
  }

  // conversations exist
  empty.classList.add("hidden");
  history.classList.remove("hidden");
  history.innerHTML = "";

  conversations.forEach(c => {
    const other = c.members.find(m => m._id !== window.myUserId);
    const unread = c.unreadCount?.[window.myUserId] || 0;

    const div = document.createElement("div");
    div.className = "user-item";
    div.onclick = () => openChat(other._id);

    div.innerHTML = `
      <img src="${other.profileImageUrl}">
      <div style="flex:1">
        <div>${other.fullName}</div>
        <small>${c.lastMessage.text}</small>
      </div>
      ${unread ? `<span class="badge">${unread}</span>` : ""}
    `;

    history.appendChild(div);
  });
}

loadConversationHistory();
