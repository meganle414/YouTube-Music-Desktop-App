const { ipcRenderer } = require('electron');

window.onload = () => {
    function clickNoThanksButton() {
        const noThanksButton = document.querySelector('no-thanks');
        if (noThanksButton) {
            noThanksButton.click();
            console.log("YouTube Premium 'No Thanks' button clicked");
        }
    }

    // // Monitor DOM changes and check for the appearance of the "No Thanks" button
    // const observer = new MutationObserver(() => {
    //     clickNoThanksButton();
    // });

    // // Observe the entire document for changes
    // observer.observe(document.body, {
    //     childList: true,
    //     subtree: true,
    // });

    // // Call the function initially to check if the button is already present
    // clickNoThanksButton();

    // function observeDOMChanges() {
    //     // Ensure document.body is available before observing it
    //     if (!document.body) {
    //         setTimeout(observeDOMChanges, 100); // Retry after 100ms
    //         return;
    //     }

    //     const observer = new MutationObserver(() => {
    //         clickNoThanksButton();
    //     });

    //     // Start observing the document body
    //     observer.observe(document.body, {
    //         childList: true,
    //         subtree: true,
    //     });
    //     // Initial check to click "No Thanks" if the button is already present
    //     clickNoThanksButton();
    // }

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

        // Additional check during playback to skip any ad that starts playing
        const skipAdInterval = setInterval(() => {
            const isAdPlaying = document.body.classList.contains('ad-showing');
            if (isAdPlaying) {
                videoElement.currentTime = videoElement.duration;  // Skip to end of ad
                console.log('Ad detected during playback and skipped');
            }
        }, 1000);  // Check every second while video is playing

        // Clear interval when video is no longer available
        videoElement.onended = () => {
            clearInterval(skipAdInterval);
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

                    const adSkipButton = document.querySelector('.ytp-ad-skip-button-container');
                    if (adSkipButton) {
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

    // // Start observing for DOM changes
    // observeDOMChanges();

    // Start observing for dynamic changes in the DOM (e.g., new videos)
    observeForVideoChanges();
};
