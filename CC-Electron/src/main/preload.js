const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: () => {
        ipcRenderer.send('ws-fn', 'StartRecord', {});
    },

    stopRecord: () => {
        ipcRenderer.send('ws-fn', 'StopRecord', {});
    }
});

contextBridge.exposeInMainWorld('windowAPI', {
    minimize: () => {
        ipcRenderer.send('window:minimize');
    },

    maximize: () => {
        ipcRenderer.send('window:maximize');
    },

    close: () => {
        ipcRenderer.send('window:close');
    },

    reqFinishInitRend: (callback) => ipcRenderer.on('window:reqFinishInitRend', callback)
});

contextBridge.exposeInMainWorld('settingsAPI', {
    getAllSettings: () => ipcRenderer.invoke('settings:getAllSettings'),

    setSetting: (key, value) => ipcRenderer.invoke('settings:setSetting', key, value),
    setVolumeSettings: (volumeSettings) => ipcRenderer.send('settings:setVolumeSettings', volumeSettings),

    reqVolumeSettings: (callback) => ipcRenderer.on('settings:reqVolumeSettings', callback)
});

contextBridge.exposeInMainWorld('filesAPI', {
    getAllVideosData: () => ipcRenderer.invoke('files:getAllVideosData'),

    reqLoadGallery: (callback) => ipcRenderer.on('files:reqLoadGallery', callback)
});