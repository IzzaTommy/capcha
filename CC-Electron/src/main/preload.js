const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: (recordingGame) => ipcRenderer.invoke('webSocket:StartRecord', recordingGame), 

    stopRecord: () => ipcRenderer.invoke('webSocket:StopRecord'), 

    reqToggleRecordBtn: (callback) => ipcRenderer.on('webSocket:reqToggleRecordBtn', (_, recordingGame) => callback(recordingGame))
});

contextBridge.exposeInMainWorld('windowAPI', {
    // sends request to main
    minimizeWindow: () => {
        ipcRenderer.send('window:minimizeWindow');
    },

    // sends request to main
    maximizeWindow: () => {
        ipcRenderer.send('window:maximizeWindow');
    },

    // sends request to main
    closeWindow: () => {
        ipcRenderer.send('window:closeWindow');
    },

    // sends request to renderer
    reqFinishInit: (callback) => ipcRenderer.on('window:reqFinishInit', callback),

    // sends request to main
    reqToggleAutoRecord: () => {
        ipcRenderer.send('window:reqToggleAutoRecord');
    }
});

contextBridge.exposeInMainWorld('settingsAPI', {
    // returns settings data
    getAllSettingsData: () => ipcRenderer.invoke('settings:getAllSettingsData'),

    // sends setting, returns setting
    setSetting: (key, value) => ipcRenderer.invoke('settings:setSetting', key, value),

    // returns devices data
    getAllDevicesData: () => ipcRenderer.invoke('settings:getAllDevicesData'),

    // returns displays data
    getAllDisplaysData: () => ipcRenderer.invoke('settings:getAllDisplaysData')
});

contextBridge.exposeInMainWorld('filesAPI', {
    // returns video data
    getAllCapturesData: () => ipcRenderer.invoke('files:getAllCapturesData'),

    // returns video data
    getAllClipsData: () => ipcRenderer.invoke('files:getAllClipsData'),

    // // sends request to renderer
    // reqLoadCapturesGallery: (callback) => ipcRenderer.on('files:reqLoadCapturesGallery', callback),

    // // sends request to renderer
    // reqLoadClipsGallery: (callback) => ipcRenderer.on('files:reqLoadClipsGallery', callback)
});

contextBridge.exposeInMainWorld('clipAPI', {
    createClip: (videoDataPath, clipStartTime, clipEndTime) => ipcRenderer.invoke('clip:createClip', videoDataPath, clipStartTime, clipEndTime)
});