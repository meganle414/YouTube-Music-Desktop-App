const { ipcRenderer } = require('electron');

window.onload = () => {
    // Get the audio/video element
    const videoElement = document.querySelector('video');

    if (videoElement) {
        // console.log('Video found');
        // Monitor volume changes
        videoElement.onvolumechange = () => {
            ipcRenderer.send('volume-changed', videoElement.volume);
        };

        // Monitor video play/pause state changes
        videoElement.onplay = () => {
            ipcRenderer.send('state-changed', 'playing');
            // console.log('Video state:', videoElement.paused ? 'paused' : 'playing');
        };

        videoElement.onpause = () => {
            ipcRenderer.send('state-changed', 'paused');
            // console.log('Video state:', videoElement.paused ? 'paused' : 'playing');
        };
    }
};
