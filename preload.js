const { ipcRenderer } = require('electron');

window.onload = () => {
    // Get the audio/video element
    const videoElement = document.querySelector('video');

    if (videoElement) {
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
};
