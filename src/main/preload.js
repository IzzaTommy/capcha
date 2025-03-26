const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('procAPI', {
    // M -> R, requests a call to finishInit
    'reqFinishInit': (cb) => ipcRenderer.on('proc:reqFinishInit', cb)
});

contextBridge.exposeInMainWorld('genAPI', {
    // M -> R, requests a call to setInitStatLabelText
    'reqSetInitStatLabelText': (cb) => ipcRenderer.once('gen:reqSetInitStatLabelText', (_, text) => cb(text)), 

    // R -> M, minimizes the window
    'minWindow': () => ipcRenderer.send('gen:minWindow'), 

    // R -> M, maximizes the window
    'maxWindow': () => ipcRenderer.send('gen:maxWindow'), 

    // R -> M, closes the window
    'closeWindow': () => ipcRenderer.send('gen:closeWindow'), 

    // M -> R, requests a call to setMaxBarIcon
    'reqSetMaxBarIcon': (cb) => ipcRenderer.on('gen:reqSetMaxBarIcon', (_, isMax) => cb(isMax))
});

contextBridge.exposeInMainWorld('editSectAPI', {
    // R -> M, creates a clip of the video
    'reqCreateClip': (videoPath, clipStartTime, clipEndTime) => ipcRenderer.invoke('editSect:reqCreateClip', videoPath, clipStartTime, clipEndTime)
});

contextBridge.exposeInMainWorld('webSocketAPI', {
    // R -> M, starts recording
    'startRecord': (recProgName) => ipcRenderer.invoke('webSocket:startRecord', recProgName), 

    // R -> M, stops recording
    'stopRecord': () => ipcRenderer.invoke('webSocket:stopRecord'), 

    // M -> R, requests a call to setRecBarBtnState
    'reqSetRecBarBtnState': (cb) => ipcRenderer.on('webSocket:reqSetRecBarBtnState', (_, recProgName) => cb(recProgName))
});

contextBridge.exposeInMainWorld('dirsSectAPI', {
    // R -> M, opens the captures or clips directory
    'openDir': (isCaps) => ipcRenderer.invoke('dirsSect:openDir', isCaps), 

    // R -> M, gets all the videos data from the captures or clips directory
    'getAllVideos': (isCaps) => ipcRenderer.invoke('dirsSect:getAllVideos', isCaps), 

    // R -> M, renames a video from the videos list
    'renVideo': (videoPath, videoName, videoExt) => ipcRenderer.invoke('dirsSect:renVideo', videoPath, videoName, videoExt), 

    // R -> M, deletes a video from the videos list
    'delVideo': (videoPath) => ipcRenderer.invoke('dirsSect:delVideo', videoPath), 

    // M -> R, requests a call to addVideo
    'reqAddVideo': (cb) => ipcRenderer.on('dirsSect:reqAddVideo', (_, video, isCaps) => cb(video, isCaps)), 

    // M -> R, requests a call to delVideo
    'reqDelVideo': (cb) => ipcRenderer.on('dirsSect:reqDelVideo', (_, videoFullName, isCaps) => cb(videoFullName, isCaps))
});

contextBridge.exposeInMainWorld('stgsAPI', {    
    // R -> M, gets all the settings
    'getAllStgs': () => ipcRenderer.invoke('stgs:getAllStgs'),

    // R -> M, gets all the devices
    'getAllDevs': () => ipcRenderer.invoke('stgs:getAllDevs'),

    // R -> M, gets all the displays
    'getAllDisps': () => ipcRenderer.invoke('stgs:getAllDisps'),

    // R -> M, sets a specific setting
    'setStg': (key, value) => ipcRenderer.invoke('stgs:setStg', key, value), 

    // R -> M, deletes a program from the programs list
    'delProg': (progName) => ipcRenderer.invoke('stgs:delProg', progName), 

    // R -> M, requests a call to setAutoRecState
    'reqSetAutoRecState': () => ipcRenderer.invoke('stgs:reqSetAutoRecState')
});