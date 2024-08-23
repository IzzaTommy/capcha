// start recording
document.getElementById('start').addEventListener('click', () => {
    window.webSocketAPI.startRecord();
});

// stop recording
document.getElementById('stop').addEventListener('click', () => {
    window.webSocketAPI.stopRecord();
});