      // Advanced loading simulation
      function simulateLoading() {
        const loader = document.querySelector('.chat-preloader');
        
        setTimeout(() => {
            loader.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
            loader.style.transform = 'rotateX(0deg) scale(0)';
            loader.style.opacity = 0;
            
            // Optional: Trigger next screen or chat interface
            setTimeout(() => {
                loader.style.display = 'none';
            }, 800);
        }, 4000);
    }

    // Initialize loading
    simulateLoading();