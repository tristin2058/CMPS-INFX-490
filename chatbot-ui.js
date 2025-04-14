// Dynamically create the chatbot UI
function createChatbotUI() {
  const chatbotHTML = `
    <style>
      #chatbot-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
      }

      #chatbot-button {
        width: 60px;
        height: 60px;
        background-color: #64d9ff;
        color: #0f2027;
        border: none;
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        transition: transform 0.3s ease, background-color 0.3s ease;
      }

      #chatbot-button:hover {
        transform: scale(1.1);
        background-color: #3cc8f2;
      }

      #chatbot-popup {
        position: fixed;
        bottom: 100px;
        left: 20px;
        width: 320px;
        background: rgba(15, 32, 39, 0.95);
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        display: none;
        flex-direction: column;
        z-index: 1000;
        overflow: hidden;
      }

      #chatbot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #64d9ff;
        color: #0f2027;
        border-radius: 10px 10px 0 0;
      }

      #chatbot-header h3 {
        margin: 0;
        font-size: 18px;
      }

      #chatbot-header button {
        background: none;
        border: none;
        color: #0f2027;
        font-size: 20px;
        cursor: pointer;
      }

      #chatbot-messages {
        padding: 10px;
        max-height: 300px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.05);
        color: white;
        flex: 1;
      }

      #chatbot-input-container {
        display: flex;
        padding: 10px;
        gap: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 0 0 10px 10px;
      }

      #chatbot-input {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      #chatbot-input::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }

      #chatbot-send {
        background-color: #64d9ff;
        color: #0f2027;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        cursor: pointer;
        font-weight: bold;
      }

      #chatbot-send:hover {
        background-color: #3cc8f2;
      }

      .user-message {
        text-align: right;
        margin: 5px 0;
        color: #64d9ff;
      }

      .assistant-message {
        text-align: left;
        margin: 5px 0;
        color: #ffffff;
      }

      .assistant-message h3 {
        font-size: 16px;
        color: #64d9ff;
        margin-bottom: 6px;
      }

      .assistant-message ul {
        margin-left: 20px;
        padding-left: 0;
      }

      .assistant-message li {
        list-style-type: disc;
        margin: 4px 0;
      }

      .assistant-message strong {
        color: #ffffff;
      }

      .error-message {
        text-align: center;
        color: #f44336;
      }
    </style>

    <div id="chatbot-container">
      <button id="chatbot-button">
        <i class="fas fa-comment-dots"></i>
      </button>

      <div id="chatbot-popup">
        <div id="chatbot-header">
          <h3>AI Chatbot</h3>
          <button id="chatbot-close">&times;</button>
        </div>
        <div id="chatbot-messages"></div>
        <div id="chatbot-input-container">
          <input type="text" id="chatbot-input" placeholder="Need any help..." />
          <button id="chatbot-send">Send</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", chatbotHTML);

  const chatbotButton = document.getElementById("chatbot-button");
  const chatbotPopup = document.getElementById("chatbot-popup");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotMessages = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");

  let messageHistory = [
    { role: "system", content: "You are a helpful assistant." },
  ];

  // Toggle chatbot popup
  chatbotButton.addEventListener("click", () => {
    chatbotPopup.style.display = "block";
  });

  chatbotClose.addEventListener("click", () => {
    chatbotPopup.style.display = "none";
  });

  // Send message to chatbot
  chatbotSend.addEventListener("click", async () => {
    const userMessage = chatbotInput.value.trim();
    if (!userMessage) return;

    chatbotMessages.innerHTML += `<div class="user-message">${userMessage}</div>`;
    chatbotInput.value = "";

    messageHistory.push({ role: "user", content: userMessage });

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory }),
      });

      const data = await response.json();

      // ✅ Use marked to render markdown formatting
      chatbotMessages.innerHTML += `
        <div class="assistant-message">
          ${marked.parse(data.response)}
        </div>`;
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

      messageHistory.push({ role: "assistant", content: data.response });
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      chatbotMessages.innerHTML += `<div class="error-message">Error: Unable to fetch response.</div>`;
    }
  });
}

// ✅ Initialize the chatbot UI
createChatbotUI();
