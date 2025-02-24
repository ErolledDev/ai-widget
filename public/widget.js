class BusinessChatPlugin {
  constructor(config) {
    this.config = config;
    this.init();
  }

  async init() {
    try {
      // Fetch settings from your API
      const response = await fetch(`https://chatwidgetai.netlify.app/api/settings/${this.config.uid}`);
      const settings = await response.json();
      
      // Create and inject styles
      const styles = document.createElement('style');
      styles.textContent = `
        .business-chat-widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }
        
        .business-chat-widget button {
          background-color: ${settings.color};
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
        }
      `;
      document.head.appendChild(styles);

      // Create widget container
      const container = document.createElement('div');
      container.className = 'business-chat-widget';
      
      // Create chat button
      const button = document.createElement('button');
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      
      // Add click handler
      button.onclick = () => {
        // Open chat in iframe or popup
        const width = 400;
        const height = 600;
        const left = window.innerWidth - width - 20;
        const top = window.innerHeight - height - 20;
        
        window.open(
          `https://chatwidgetai.netlify.app/widget/${this.config.uid}`,
          'BusinessChat',
          `width=${width},height=${height},left=${left},top=${top}`
        );
      };
      
      container.appendChild(button);
      document.body.appendChild(container);
    } catch (error) {
      console.error('Failed to initialize chat widget:', error);
    }
  }
}

window.BusinessChatPlugin = BusinessChatPlugin;