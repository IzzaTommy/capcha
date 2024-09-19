const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: () => {
        ipcRenderer.send('ws-fn', 'StartRecord', {});
    },

    stopRecord: () => {
        ipcRenderer.send('ws-fn', 'StopRecord', {});
    }
});

contextBridge.exposeInMainWorld('titleBarAPI', {
    minimize: () => {
        ipcRenderer.send('window:minimize');
    },

    maximize: () => {
        ipcRenderer.send('window:maximize');
    },

    close: () => {
        ipcRenderer.send('window:close');
    }
});

contextBridge.exposeInMainWorld('settingsAPI', {
    getAllSettings: () => ipcRenderer.invoke('settings:getAll'),

    setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    setVolume: (value) => ipcRenderer.send('settings:setVolume', value),

    onGetVolume: (callback) => ipcRenderer.on('settings:getVolume', callback)
});

contextBridge.exposeInMainWorld('filesAPI', {
    getAllFiles: (directory) => ipcRenderer.invoke('files:getAll', directory)
});



// contextBridge.exposeInMainWorld('dialogAPI', {
//     getDirectory: () => ipcRenderer.invoke('dialog:getDirectory')
// });