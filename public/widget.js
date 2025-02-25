class BusinessChatWidget {
  constructor(config) {
    this.config = config;
    this.isOpen = false;
    this.hasNewMessage = false;
    this.isLoading = false;
    this.messages = [];
    this.init();
  }

  async init() {
    try {
      // Fetch settings from your API
      const response = await fetch(`https://chatwidgetai.netlify.app/api/settings/${this.config.uid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.settings = await response.json();
      
      // Create and inject styles
      const styles = document.createElement('style');
      styles.textContent = `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .business-chat-widget {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          z-index: 999999 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-end !important;
        }

        .chat-window {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          width: 350px !important;
          height: 500px !important;
          background: white !important;
          border-radius: 16px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          display: none !important;
          flex-direction: column !important;
          overflow: hidden !important;
          border: 1px solid #E5E7EB !important;
          animation: slideUp 0.3s ease-out !important;
        }

        .chat-toggle-button {
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          border: none !important;
          border-radius: 50% !important;
          width: 56px !important;
          height: 56px !important;
          cursor: pointer !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
          position: relative !important;
        }

        .chat-toggle-button svg {
          width: 24px !important;
          height: 24px !important;
          stroke-width: 2.5 !important;
        }

        .chat-send {
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .chat-send svg {
          width: 20px !important;
          height: 20px !important;
          stroke-width: 2.5 !important;
        }

        .chat-window.open {
          display: flex !important;
        }

        .chat-header {
          background: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          padding: 16px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
        }

        .chat-header h3 {
          margin: 0 !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .chat-header svg {
          width: 20px !important;
          height: 20px !important;
          stroke-width: 2.5 !important;
        }

        .chat-close {
          background: none !important;
          border: none !important;
          color: white !important;
          cursor: pointer !important;
          padding: 4px !important;
          opacity: 0.8 !important;
          transition: opacity 0.2s !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .chat-close:hover {
          opacity: 1 !important;
        }

        .chat-close svg {
          width: 20px !important;
          height: 20px !important;
          stroke-width: 2.5 !important;
        }

        .chat-messages {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 16px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        .chat-input-container {
          padding: 16px !important;
          border-top: 1px solid #E5E7EB !important;
          display: flex !important;
          gap: 8px !important;
          background: white !important;
        }

        .chat-input {
          flex: 1 !important;
          padding: 8px 16px !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 9999px !important;
          font-size: 14px !important;
          transition: all 0.2s !important;
        }

        .chat-input:focus {
          outline: none !important;
          border-color: ${this.settings.color || '#4F46E5'} !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
        }

        .chat-send {
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          border: none !important;
          border-radius: 9999px !important;
          width: 40px !important;
          height: 40px !important;
          padding: 8px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
        }

        .chat-send:hover {
          transform: scale(1.05) !important;
        }

        .chat-send:disabled {
          opacity: 0.75 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        .chat-send svg {
          width: 20px !important;
          height: 20px !important;
          stroke-width: 2.5 !important;
        }

        .message {
          max-width: 85% !important;
          word-wrap: break-word !important;
          padding: 10px 16px !important;
          border-radius: 16px !important;
          animation: messageIn 0.3s ease-out !important;
          line-height: 1.4 !important;
          font-size: 14px !important;
        }

        .message.user {
          margin-left: auto !important;
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          border-bottom-right-radius: 4px !important;
        }

        .message.assistant {
          margin-right: auto !important;
          background-color: #F3F4F6 !important;
          color: #1F2937 !important;
          border-bottom-left-radius: 4px !important;
        }

        .typing-indicator {
          display: flex !important;
          gap: 4px !important;
          padding: 10px 16px !important;
          background-color: #F3F4F6 !important;
          border-radius: 16px !important;
          border-bottom-left-radius: 4px !important;
          width: fit-content !important;
          margin-right: auto !important;
          animation: messageIn 0.3s ease-out !important;
        }

        .typing-dot {
          width: 8px !important;
          height: 8px !important;
          background-color: #9CA3AF !important;
          border-radius: 50% !important;
          animation: bounce 0.8s infinite !important;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s !important;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s !important;
        }

        .hidden {
          display: none !important;
        }
      `;
      document.head.appendChild(styles);

      // Create widget container
      const container = document.createElement('div');
      container.className = 'business-chat-widget';
      
      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.className = 'chat-window';
      chatWindow.innerHTML = `
        <div class="chat-header">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle h-6 w-6"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
            ${this.settings.businessName || 'Chat with us'}
          </h3>
          <button class="chat-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" class="chat-input" placeholder="Type your message...">
          <button class="chat-send">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;

      // Create toggle button
      const button = document.createElement('button');
      button.className = 'chat-toggle-button';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle h-6 w-6"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
      `;
      
      // Add event listeners
      button.onclick = () => {
        this.toggleChat();
        button.classList.add('hidden');
      };
      
      chatWindow.querySelector('.chat-close').onclick = () => {
        this.toggleChat();
        button.classList.remove('hidden');
      };
      
      const sendButton = chatWindow.querySelector('.chat-send');
      const input = chatWindow.querySelector('.chat-input');
      
      const sendMessage = async () => {
        const message = input.value.trim();
        if (!message || this.isLoading) return;
        
        input.value = '';
        this.addMessage('user', message);
        
        try {
          this.isLoading = true;
          this.showTypingIndicator();
          sendButton.disabled = true;
          
          const response = await fetch('https://chatwidgetai.netlify.app/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message,
              userId: this.config.uid,
              settings: {
                ...this.settings,
                userId: this.config.uid // Add userId to settings for analytics
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          this.hideTypingIndicator();
          this.addMessage('assistant', data.response);
        } catch (error) {
          console.error('Failed to send message:', error);
          this.hideTypingIndicator();
          this.addMessage('assistant', 'I apologize, but I encountered an error. How else can I assist you?');
        } finally {
          this.isLoading = false;
          sendButton.disabled = false;
        }
      };
      
      sendButton.onclick = sendMessage;
      input.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
      };
      
      container.appendChild(chatWindow);
      container.appendChild(button);
      document.body.appendChild(container);
      
      // Add initial message
      this.addMessage('assistant', 'Hi! How can I help you today?');
    } catch (error) {
      console.error('Failed to initialize chat widget:', error);
      throw error;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.querySelector('.chat-window');
    
    if (this.isOpen) {
      chatWindow.classList.add('open');
      chatWindow.querySelector('.chat-input').focus();
      this.hasNewMessage = false;
      this.updateNotificationDot();
    } else {
      chatWindow.classList.remove('open');
    }
  }

  showTypingIndicator() {
    const messagesContainer = document.querySelector('.chat-messages');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  updateNotificationDot() {
    const button = document.querySelector('.chat-toggle-button');
    const existingDots = button.querySelectorAll('.notification-dot, .notification-dot-ping');
    existingDots.forEach(dot => dot.remove());

    if (this.hasNewMessage && !this.isOpen) {
      const dot = document.createElement('span');
      dot.className = 'notification-dot';
      const pingDot = document.createElement('span');
      pingDot.className = 'notification-dot-ping';
      button.appendChild(pingDot);
      button.appendChild(dot);
    }
  }

  addMessage(role, content) {
    const messagesContainer = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    if (role === 'assistant' && !this.isOpen) {
      this.hasNewMessage = true;
      this.updateNotificationDot();
    }
  }
}

window.BusinessChatPlugin = BusinessChatWidget;