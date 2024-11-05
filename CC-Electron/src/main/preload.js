const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: () => ipcRenderer.invoke('webSocket:StartRecord'), 

    stopRecord: () => ipcRenderer.invoke('webSocket:StopRecord'), 

    reqSetActiveRecordBtn: (callback) => ipcRenderer.on('webSocket:reqSetActiveRecordBtn', callback)
});

contextBridge.exposeInMainWorld('windowAPI', {
    // sends request to main
    minimize: () => {
        ipcRenderer.send('window:minimize');
    },

    // sends request to main
    maximize: () => {
        ipcRenderer.send('window:maximize');
    },

    // sends request to main
    close: () => {
        ipcRenderer.send('window:close');
    },

    // sends request to renderer
    reqFinishInit: (callback) => ipcRenderer.on('window:reqFinishInit', callback),

    // sends request to main
    readyCheck: () => {
        ipcRenderer.send('window:readyCheck');
    }
});

contextBridge.exposeInMainWorld('settingsAPI', {
    // returns settings data
    getAllSettings: () => ipcRenderer.invoke('settings:getAllSettings'),

    // sends setting, returns setting
    setSetting: (key, value) => ipcRenderer.invoke('settings:setSetting', key, value),

    // sends setting
    setVolumeSettings: (volumeSettings) => ipcRenderer.send('settings:setVolumeSettings', volumeSettings),

    // sends request to renderer
    reqVolumeSettings: (callback) => ipcRenderer.on('settings:reqVolumeSettings', callback)
});

contextBridge.exposeInMainWorld('filesAPI', {
    // returns video data
    getAllVideosData: () => ipcRenderer.invoke('files:getAllVideosData'),

    // sends request to renderer
    reqLoadGallery: (callback) => ipcRenderer.on('files:reqLoadGallery', callback)
});