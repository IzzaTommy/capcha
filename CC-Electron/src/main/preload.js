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

    // M -> R, requests a call to setInitStatLabelText
    'reqSetInitStatLabelText': (cb) => ipcRenderer.once('gen:reqSetInitStatLabelText', (_, text) => cb(text)), 

    // R -> M, creates a clip of the video
    'reqCreateClip': (videoPath, clipStartTime, clipEndTime) => ipcRenderer.invoke('gen:reqCreateClip', videoPath, clipStartTime, clipEndTime)
});

contextBridge.exposeInMainWorld('webSocketAPI', {
    // R -> M, starts recording
    'startRecord': (recProgName) => ipcRenderer.invoke('webSocket:startRecord', recProgName), 

    // R -> M, stops recording
    'stopRecord': () => ipcRenderer.invoke('webSocket:stopRecord')
});

contextBridge.exposeInMainWorld('stgsAPI', {
    // R -> M, requests a call to setAutoRecState
    'reqSetAutoRecState': () => ipcRenderer.invoke('stgs:reqSetAutoRecState'), 

    // M -> R, requests a call to reqSetRecBarBtnState
    'reqSetRecBarBtnState': (cb) => ipcRenderer.on('stgs:reqSetRecBarBtnState', (_, recProgName) => cb(recProgName)),
    
    // R -> M, opens the captures or clips directory
    'openDir': (isCaps) => ipcRenderer.invoke('stgs:openDir', isCaps), 

    // R -> M, deletes a program from the programs list
    'delProg': (progName) => ipcRenderer.invoke('stgs:delProg', progName), 

    // R -> M, gets all the videos data from the captures or clips directory
    'getAllVideos': (isCaps) => ipcRenderer.invoke('stgs:getAllVideos', isCaps),

    // R -> M, gets all the settings
    'getAllStgs': () => ipcRenderer.invoke('stgs:getAllStgs'),

    // R -> M, gets all the devices
    'getAllDevs': () => ipcRenderer.invoke('stgs:getAllDevs'),

    // R -> M, gets all the displays
    'getAllDisps': () => ipcRenderer.invoke('stgs:getAllDisps'),

    // R -> M, sets a specific setting
    'setStg': (key, value) => ipcRenderer.invoke('stgs:setStg', key, value), 

    // R -> M, renames a video from the videos list
    'renVideo': (videoPath, videoName, videoExt) => ipcRenderer.invoke('stgs:renVideo', videoPath, videoName, videoExt), 

    // R -> M, deletes a video from the videos list
    'delVideo': (videoPath) => ipcRenderer.invoke('stgs:delVideo', videoPath), 

    // M -> R, requests a call to addVideo
    'reqAddVideo': (cb) => ipcRenderer.on('stgs:reqAddVideo', (_, video, isCaps) => cb(video, isCaps)), 

    // M -> R, requests a call to delVideo
    'reqDelVideo': (cb) => ipcRenderer.on('stgs:reqDelVideo', (_, videoFullName, isCaps) => cb(videoFullName, isCaps))
});