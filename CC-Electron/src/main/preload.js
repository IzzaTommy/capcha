const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('procAPI', {
    // M -> R, requests a call to finishInit
    reqFinishInit: (callback) => ipcRenderer.on('proc:reqFinishInit', callback)
});

contextBridge.exposeInMainWorld('genAPI', {
    // R -> M, minimizes the window
    minWindow: () => ipcRenderer.send('gen:minWindow'),

    // R -> M, maximizes the window
    maxWindow: () => ipcRenderer.send('gen:maxWindow'),

    // R -> M, closes the window
    closeWindow: () => ipcRenderer.send('gen:closeWindow'),

    // R -> M, creates a clip of the video
    reqCreateClip: (videoDataPath, clipStartTime, clipEndTime) => ipcRenderer.invoke('gen:reqCreateClip', videoDataPath, clipStartTime, clipEndTime)
});

contextBridge.exposeInMainWorld('webSocketAPI', {
    // R -> M, starts recording
    startRecord: (recGame) => ipcRenderer.invoke('webSocket:startRecord', recGame), 

    // R -> M, stops recording
    stopRecord: () => ipcRenderer.invoke('webSocket:stopRecord')
});

contextBridge.exposeInMainWorld('stgsAPI', {
    // R -> M, requests a call to togAutoRec
    reqTogAutoRec: () => ipcRenderer.send('stgs:reqTogAutoRec'), 

    // M -> R, requests a call to togRecBarBtn
    reqTogRecBarBtn: (callback) => ipcRenderer.on('stgs:reqTogRecBarBtn', (_, recGame) => callback(recGame)),

    // R -> M, gets the size of the captures or clips directory
    getDirSize: (isCaps) => ipcRenderer.invoke('stgs:getDirSize', isCaps), 
    
    // R -> M, opens the captures or clips directory
    openDir: (isCaps) => ipcRenderer.send('stgs:openDir', isCaps), 

    // R -> M, deletes a program from the programs list
    delProg: (name) => ipcRenderer.invoke('stgs:delProg', name), 

    // R -> M, gets the videos data from the captures or clips directory
    getAllDirData: (isCaps) => ipcRenderer.invoke('stgs:getAllDirData', isCaps),

    // R -> M, gets all settings data
    getAllStgsData: () => ipcRenderer.invoke('stgs:getAllStgsData'),

    // R -> M, gets all devices data
    getAllDevsData: () => ipcRenderer.invoke('stgs:getAllDevsData'),

    // R -> M, gets all displays data
    getAllDispsData: () => ipcRenderer.invoke('stgs:getAllDispsData'),

    // R -> M, sets a specific setting
    setStg: (key, value) => ipcRenderer.invoke('stgs:setStg', key, value),
});