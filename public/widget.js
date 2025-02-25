class BusinessChatWidget {
  constructor(config) {
    this.config = config;
    this.isOpen = false;
    this.hasNewMessage = false;
    this.isLoading = false;
    this.messages = [];
    this.showContactForm = false;
    this.showConsent = true;
    this.consentAccepted = false;
    this.hasSubmittedForm = false;
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
          width: 56px !important;
          height: 56px !important;
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          border: none !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
          position: relative !important;
          transform-origin: center !important;
        }

        .chat-toggle-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
        }

        .chat-toggle-button svg {
          width: 24px !important;
          height: 24px !important;
          stroke-width: 2.5 !important;
        }

        .chat-window.open {
          display: flex !important;
        }

        .chat-header {
          background: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          padding: 12px 16px !important;
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

        .chat-messages {
          flex: 1 !important;
          overflow-y: auto !important;
          padding: 16px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          scroll-behavior: smooth !important;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px !important;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: transparent !important;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1) !important;
          border-radius: 3px !important;
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
          outline: none !important;
        }

        .chat-input:focus {
          border-color: ${this.settings.color || '#4F46E5'} !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
        }

        .chat-send {
          width: 40px !important;
          height: 40px !important;
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          border: none !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s !important;
          padding: 0 !important;
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
          font-size: 14px !important;
          line-height: 1.4 !important;
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

        .contact-form {
          background-color: #F9FAFB !important;
          padding: 16px !important;
          border-radius: 12px !important;
          margin: 8px 0 !important;
          animation: messageIn 0.3s ease-out !important;
        }

        .contact-form label {
          display: block !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #374151 !important;
          margin-bottom: 4px !important;
        }

        .contact-form input {
          width: 100% !important;
          padding: 8px 12px !important;
          border: 1px solid #D1D5DB !important;
          border-radius: 6px !important;
          margin-bottom: 12px !important;
          font-size: 14px !important;
          outline: none !important;
        }

        .contact-form input:focus {
          border-color: ${this.settings.color || '#4F46E5'} !important;
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
        }

        .contact-form button {
          width: 100% !important;
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          padding: 8px 16px !important;
          border: none !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }

        .contact-form button:hover {
          opacity: 0.9 !important;
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

        .consent-modal {
          position: fixed !important;
          bottom: 90px !important;
          right: 24px !important;
          width: 350px !important;
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
          padding: 16px !important;
          animation: slideUp 0.3s ease-out !important;
          z-index: 999999 !important;
        }

        .consent-modal h4 {
          font-size: 16px !important;
          font-weight: 500 !important;
          color: #111827 !important;
          margin: 0 0 8px 0 !important;
        }

        .consent-modal p {
          font-size: 14px !important;
          color: #4B5563 !important;
          margin: 0 0 16px 0 !important;
          line-height: 1.5 !important;
        }

        .consent-modal .buttons {
          display: flex !important;
          justify-content: flex-end !important;
          gap: 8px !important;
        }

        .consent-modal button {
          padding: 6px 12px !important;
          font-size: 14px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }

        .consent-modal .decline {
          background: none !important;
          border: none !important;
          color: #4B5563 !important;
        }

        .consent-modal .accept {
          background-color: ${this.settings.color || '#4F46E5'} !important;
          color: white !important;
          border: none !important;
        }

        .notification-dot {
          position: absolute !important;
          top: -1px !important;
          right: -1px !important;
          width: 12px !important;
          height: 12px !important;
          background-color: #EF4444 !important;
          border-radius: 50% !important;
        }

        .notification-dot-ping {
          position: absolute !important;
          top: -1px !important;
          right: -1px !important;
          width: 12px !important;
          height: 12px !important;
          background-color: #EF4444 !important;
          border-radius: 50% !important;
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite !important;
        }

        .hidden {
          display: none !important;
        }

        .privacy-link {
          color: ${this.settings.color || '#4F46E5'} !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }

        .loading-spinner {
          animation: spin 1s linear infinite !important;
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
          <button class="chat-close" aria-label="Close chat">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" id="chatMessage" name="chatMessage" class="chat-input" placeholder="Type your message..." aria-label="Chat message">
          <button class="chat-send" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      `;

      // Create consent modal
      const consentModal = document.createElement('div');
      consentModal.className = 'consent-modal hidden';
      consentModal.innerHTML = `
        <h4>Privacy Notice</h4>
        <p>
          By using this chat service, you agree that your messages and provided information may be stored and processed to improve our service. 
          We respect your privacy and will protect your data according to our 
          <a href="https://chatwidgetai.netlify.app/privacy" target="_blank" class="privacy-link">privacy policy</a>.
        </p>
        <div class="buttons">
          <button class="decline">Decline</button>
          <button class="accept">Accept & Continue</button>
        </div>
      `;

      // Create toggle button
      const button = document.createElement('button');
      button.className = 'chat-toggle-button';
      button.setAttribute('aria-label', 'Open chat');
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle h-6 w-6"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
      `;
      
      // Add event listeners
      button.onclick = () => {
        if (!this.consentAccepted) {
          consentModal.classList.remove('hidden');
        } else {
          this.toggleChat();
          button.classList.add('hidden');
        }
      };

      consentModal.querySelector('.accept').onclick = () => {
        this.consentAccepted = true;
        consentModal.classList.add('hidden');
        this.toggleChat();
        button.classList.add('hidden');
      };

      consentModal.querySelector('.decline').onclick = () => {
        consentModal.classList.add('hidden');
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
                userId: this.config.uid
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          this.hideTypingIndicator();
          this.addMessage('assistant', data.response);

          // Show contact form after 4 messages if not submitted
          if (this.messages.length >= 4 && !this.showContactForm && !this.hasSubmittedForm) {
            this.showContactForm = true;
            this.displayContactForm();
          }
        } catch (error) {
          console.error('Failed to send message:', error);
          this.hideTypingIndicator();
          this.addMessage('assistant', 'I apologize, but I encountered an error. How else can I assist you?');
        } finally {
          this.isLoading = false;
          sendButton.disabled = false;
          
          // Update send button icon
          sendButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          `;
        }
      };
      
      sendButton.onclick = sendMessage;
      input.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
      };
      
      container.appendChild(chatWindow);
      container.appendChild(consentModal);
      container.appendChild(button);
      document.body.appendChild(container);
      
      // Add initial message
      this.addMessage('assistant', 'Hi! How can I help you today?');
    } catch (error) {
      console.error('Failed to initialize chat widget:', error);
      throw error;
    }
  }

  displayContactForm() {
    const messagesContainer = document.querySelector('.chat-messages');
    const formDiv = document.createElement('div');
    formDiv.className = 'contact-form';
    formDiv.innerHTML = `
      <form id="visitorContactForm">
        <label for="visitorName">Name</label>
        <input type="text" id="visitorName" name="visitorName" required>
        
        <label for="visitorEmail">Email</label>
        <input type="email" id="visitorEmail" name="visitorEmail" required>
        
        <p class="text-xs text-gray-500 mb-4">
          By submitting this form, you agree to our 
          <a href="https://chatwidgetai.netlify.app/privacy" target="_blank" class="privacy-link">privacy policy</a>.
        </p>
        
        <button type="submit">Submit</button>
      </form>
    `;

    formDiv.querySelector('form').onsubmit = async (e) => {
      e.preventDefault();
      const name = formDiv.querySelector('#visitorName').value;
      const email = formDiv.querySelector('#visitorEmail').value;
      
      if (name && email) {
        await this.sendMessage(`Contact Information:\nName: ${name}\nEmail: ${email}`);
        formDiv.remove();
        this.showContactForm = false;
        this.hasSubmittedForm = true;
        
        // Send thank you message
        await this.sendMessage("Thank you for providing your contact information! We'll be in touch soon. How else can I assist you today?");
      }
    };

    messagesContainer.appendChild(formDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

    this.messages.push({ role, content });

    if (role === 'assistant' && !this.isOpen) {
      this.hasNewMessage = true;
      this.updateNotificationDot();
    }
  }

  async sendMessage(message) {
    try {
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
            userId: this.config.uid
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
}

window.BusinessChatPlugin = BusinessChatWidget;