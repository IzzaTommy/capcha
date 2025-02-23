const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('procAPI', {
    // M -> R, requests a call to finishInit
    'reqFinishInit': (cb) => ipcRenderer.on('proc:reqFinishInit', cb)
});

contextBridge.exposeInMainWorld('genAPI', {
    // R -> M, minimizes the window
    'minWindow': () => ipcRenderer.send('gen:minWindow'),

    // R -> M, maximizes the window
    'maxWindow': () => ipcRenderer.send('gen:maxWindow'),

    // R -> M, closes the window
    'closeWindow': () => ipcRenderer.send('gen:closeWindow'),

    // R -> M, creates a clip of the video
    'reqCreateClip': (videoDataPath, clipStartTime, clipEndTime) => ipcRenderer.invoke('gen:reqCreateClip', videoDataPath, clipStartTime, clipEndTime)
});

contextBridge.exposeInMainWorld('webSocketAPI', {
    // R -> M, starts recording
    'startRecord': (recProg) => ipcRenderer.invoke('webSocket:startRecord', recProg), 

    // R -> M, stops recording
    'stopRecord': () => ipcRenderer.invoke('webSocket:stopRecord')
});

contextBridge.exposeInMainWorld('stgsAPI', {
    // R -> M, requests a call to setAutoRecState
    'reqSetAutoRecState': () => ipcRenderer.send('stgs:reqSetAutoRecState'), 

    // M -> R, requests a call to reqSetRecBarBtnState
    'reqSetRecBarBtnState': (cb) => ipcRenderer.on('stgs:reqSetRecBarBtnState', (_, recProg) => cb(recProg)),
    
    // R -> M, opens the captures or clips directory
    'openDir': (isCaps) => ipcRenderer.send('stgs:openDir', isCaps), 

    // R -> M, deletes a program from the programs list
    'delProg': (name) => ipcRenderer.invoke('stgs:delProg', name), 

    // R -> M, gets the videos data from the captures or clips directory
    'getAllDirData': (isCaps) => ipcRenderer.invoke('stgs:getAllDirData', isCaps),

    // R -> M, gets all settings data
    'getAllStgsData': () => ipcRenderer.invoke('stgs:getAllStgsData'),

    // R -> M, gets all devices data
    'getAllDevsData': () => ipcRenderer.invoke('stgs:getAllDevsData'),

    // R -> M, gets all displays data
    'getAllDispsData': () => ipcRenderer.invoke('stgs:getAllDispsData'),

    // R -> M, sets a specific setting
    'setStg': (key, value) => ipcRenderer.invoke('stgs:setStg', key, value), 

    // R -> M, deletes a video from the videos list
    'delVideo': (videoPath) => ipcRenderer.send('stgs:delVideo', videoPath), 

    // M -> R, requests a call to addVideo
    'reqAddVideo': (cb) => ipcRenderer.on('stgs:reqAddVideo', (_, videoData, isCaps) => cb(videoData, isCaps)), 

    // M -> R, requests a call to delVideo
    'reqDelVideo': (cb) => ipcRenderer.on('stgs:reqDelVideo', (_, extName, isCaps) => cb(extName, isCaps))
});