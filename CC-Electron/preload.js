const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: () => {
        ipcRenderer.send('ws-send', 'StartRecord', {});
    },

    stopRecord: () => {
        ipcRenderer.send('ws-send', 'StopRecord', {});
    }
});