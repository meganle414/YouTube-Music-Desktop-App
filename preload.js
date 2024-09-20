const { ipcRenderer } = require('electron');

window.onload = () => {
    function clickNoThanksButton() {
        const noThanksButton = document.querySelector('no-thanks');
        if (noThanksButton) {
            noThanksButton.click();
            console.log("YouTube Premium 'No Thanks' button clicked");
        }
    }

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
            clickNoThanksButton();
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // Look for a new video element
                    const videoElement = document.querySelector('video');
                    if (videoElement) {
                        attachVideoListeners(videoElement);
                    }

                    // Check if new video found is an ad
                    const adSkipButton = document.querySelector('.ytp-ad-skip-button-container');
                    const adText = document.querySelector('.ytp-ad-text');
                    if (adSkipButton || adText) {
                        // Fast forward the video to skip the ad
                        videoElement.currentTime = videoElement.duration;  // Skip to end of ad
                        console.log('Ad detected and skipped');
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
            attachVideoListeners(videoElement);
        } else {
            setTimeout(setupVideoElementListeners, 1000);  // Retry every second if no video element found
        }
    }

    // Start initial video element listener setup
    setupVideoElementListeners();

    // Start observing for dynamic changes in the DOM (e.g., new videos)
    observeForVideoChanges();
};
