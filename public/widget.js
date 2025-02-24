class BusinessChatWidget {
  constructor(config) {
    this.config = config;
    this.isOpen = false;
    this.hasNewMessage = false;
    this.isLoading = false;
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
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .chat-toggle-button {
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }

        .chat-toggle-button:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .chat-toggle-button:active {
          transform: scale(0.95);
        }

        .notification-dot {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background-color: #EF4444;
          border-radius: 50%;
        }

        .notification-dot-ping {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 16px;
          height: 16px;
          background-color: #EF4444;
          border-radius: 50%;
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #E5E7EB;
          animation: slideUp 0.3s ease-out;
        }

        .chat-window.open {
          display: flex;
        }

        .chat-header {
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          opacity: 1;
          transition: opacity 0.2s;
        }

        .chat-close:hover {
          opacity: 0.75;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-input-container {
          padding: 16px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          outline: none;
          border-color: ${this.settings.color || '#4F46E5'};
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
        }

        .chat-send {
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px;
          width: 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s;
        }

        .chat-send:hover {
          opacity: 0.9;
        }

        .chat-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message {
          max-width: 80%;
          word-wrap: break-word;
          padding: 12px;
          border-radius: 12px;
          animation: messageIn 0.3s ease-out;
          line-height: 1.4;
        }

        .message.user {
          margin-left: auto;
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.assistant {
          margin-right: auto;
          background-color: #F3F4F6;
          color: #1F2937;
          border-bottom-left-radius: 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 12px;
          background-color: #F3F4F6;
          border-radius: 12px;
          border-bottom-left-radius: 4px;
          width: fit-content;
          margin-right: auto;
          animation: messageIn 0.3s ease-out;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #9CA3AF;
          border-radius: 50%;
          animation: bounce 0.8s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            ${this.settings.businessName || 'Chat with us'}
          </h3>
          <button class="chat-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" class="chat-input" placeholder="Type your message...">
          <button class="chat-send">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      
      // Add event listeners
      button.onclick = () => this.toggleChat();
      chatWindow.querySelector('.chat-close').onclick = () => this.toggleChat();
      
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
              settings: this.settings
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
          this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
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
      this.addMessage('assistant', `Hi! I'm ${this.settings.representativeName}. How can I help you today?`);
    } catch (error) {
      console.error('Failed to initialize chat widget:', error);
      throw error;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.querySelector('.chat-window');
    const button = document.querySelector('.chat-toggle-button');
    
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