const { ipcRenderer } = require('electron');

window.onload = () => {
    function attachVideoListeners(videoElement) {
        // Monitor volume changes
        videoElement.onvolumechange = () => {
            ipcRenderer.send('volume-changed', videoElement.volume);
        };

        // Monitor video play/pause state changes
        videoElement.onplay = () => {
            ipcRenderer.send('state-changed', 'playing');
        };

        videoElement.onpause = () => {
            ipcRenderer.send('state-changed', 'paused');
        };
    }

    function observeForVideoChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Look for a new video element
                    const videoElement = document.querySelector('video');
                    if (videoElement) {
                        console.log('New video element detected.');
                        attachVideoListeners(videoElement);
                    }
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initial setup for video element
    function setupVideoElementListeners() {
        const videoElement = document.querySelector('video');

        if (videoElement) {
            console.log('Initial video element found, attaching event listeners.');
            attachVideoListeners(videoElement);
        } else {
            console.log('Initial video element not found, retrying...');
            setTimeout(setupVideoElementListeners, 1000);  // Retry every second if no video element found
        }
    }

    // Start initial video element listener setup
    setupVideoElementListeners();

    // Start observing for dynamic changes in the DOM (e.g., new videos)
    observeForVideoChanges();
};
