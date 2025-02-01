const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: (recordingGame) => ipcRenderer.invoke('webSocket:StartRecord', recordingGame), 

    stopRecord: () => ipcRenderer.invoke('webSocket:StopRecord'), 

    reqTogRecBarBtn: (callback) => ipcRenderer.on('webSocket:reqTogRecBarBtn', (_, recordingGame) => callback(recordingGame))
});

contextBridge.exposeInMainWorld('processAPI', {
    // sends request to renderer
    reqFinishInit: (callback) => ipcRenderer.on('process:reqFinishInit', callback),
});

contextBridge.exposeInMainWorld('windowAPI', {
    // sends request to main
    minWindow: () => {
        ipcRenderer.send('window:minWindow');
    },

    // sends request to main
    maxWindow: () => {
        ipcRenderer.send('window:maxWindow');
    },

    // sends request to main
    closeWindow: () => {
        ipcRenderer.send('window:closeWindow');
    },


    // sends request to main
    reqTogAutoRec: () => {
        ipcRenderer.send('window:reqTogAutoRec');
    },

    openDir: (isCaps) => {
        ipcRenderer.send('window:openDir', isCaps);
    }
});

contextBridge.exposeInMainWorld('stgsAPI', {
    // returns stgs data
    getAllStgsData: () => ipcRenderer.invoke('stgs:getAllStgsData'),

    // sends stg, returns stg
    setStg: (key, value) => ipcRenderer.invoke('stgs:setStg', key, value),

    // returns devices data
    getAllDevicesData: () => ipcRenderer.invoke('stgs:getAllDevicesData'),

    // returns displays data
    getAllDisplaysData: () => ipcRenderer.invoke('stgs:getAllDisplaysData')
});

contextBridge.exposeInMainWorld('filesAPI', {
    getAllDirData: (isCaps) => ipcRenderer.invoke('files:getAllDirData', isCaps),

    getDirSize: (isCaps) => ipcRenderer.invoke('files:getDirSize', isCaps),
});

contextBridge.exposeInMainWorld('clipAPI', {
    createClip: (videoDataPath, clipStartTime, clipEndTime) => ipcRenderer.invoke('clip:createClip', videoDataPath, clipStartTime, clipEndTime)
});