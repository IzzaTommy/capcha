const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: () => {
        ipcRenderer.send('ws-send', 'StartRecord', {});
    },

    stopRecord: () => {
        ipcRenderer.send('ws-send', 'StopRecord', {});
    }
});

contextBridge.exposeInMainWorld('titleBarAPI', {
    minimize: () => {
        ipcRenderer.send('tb-send', 'minimize');
    },

    maximize: () => {
        ipcRenderer.send('tb-send', 'maximize');
    },

    close: () => {
        ipcRenderer.send('tb-send', 'close');
    }
});