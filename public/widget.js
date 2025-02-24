class BusinessChatWidget {
  constructor(config) {
    this.config = config;
    this.isOpen = false;
    this.init();
  }

  async init() {
    try {
      // Fetch settings from your API
      const response = await fetch(`https://chatwidgetai.netlify.app/api/settings/${this.config.uid}`, {
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });
      this.settings = await response.json();
      
      // Create and inject styles
      const styles = document.createElement('style');
      styles.textContent = `
        .business-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        .chat-toggle-button {
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .chat-toggle-button:hover {
          transform: scale(1.05);
        }

        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 40px rgba(0,0,0,0.16);
          display: none;
          flex-direction: column;
          overflow: hidden;
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
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }

        .chat-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .chat-input-container {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        }

        .chat-send {
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
        }

        .message {
          margin-bottom: 12px;
          max-width: 80%;
          word-wrap: break-word;
        }

        .message.user {
          margin-left: auto;
          background-color: ${this.settings.color || '#4F46E5'};
          color: white;
          padding: 8px 12px;
          border-radius: 12px 12px 0 12px;
        }

        .message.assistant {
          background-color: #f3f4f6;
          color: #1f2937;
          padding: 8px 12px;
          border-radius: 12px 12px 12px 0;
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
          <h3>${this.settings.businessName || 'Chat with us'}</h3>
          <button class="chat-close">✕</button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" class="chat-input" placeholder="Type your message...">
          <button class="chat-send">Send</button>
        </div>
      `;

      // Create toggle button
      const button = document.createElement('button');
      button.className = 'chat-toggle-button';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      
      // Add event listeners
      button.onclick = () => this.toggleChat();
      chatWindow.querySelector('.chat-close').onclick = () => this.toggleChat();
      
      const sendButton = chatWindow.querySelector('.chat-send');
      const input = chatWindow.querySelector('.chat-input');
      
      const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;
        
        input.value = '';
        this.addMessage('user', message);
        
        try {
          const response = await fetch(`https://chatwidgetai.netlify.app/api/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Origin': window.location.origin
            },
            body: JSON.stringify({
              message,
              userId: this.config.uid,
              settings: this.settings
            })
          });
          
          const data = await response.json();
          this.addMessage('assistant', data.response);
        } catch (error) {
          console.error('Failed to send message:', error);
          this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
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
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.querySelector('.chat-window');
    chatWindow.classList.toggle('open');
    
    if (this.isOpen) {
      chatWindow.querySelector('.chat-input').focus();
    }
  }

  addMessage(role, content) {
    const messagesContainer = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

window.BusinessChatPlugin = BusinessChatWidget;