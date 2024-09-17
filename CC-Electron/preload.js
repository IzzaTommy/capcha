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

    setAllSettings: (settings) => ipcRenderer.send('settings:setAll', settings),

    onReqSave: (callback) => ipcRenderer.on('settings:reqSave', callback),
});

contextBridge.exposeInMainWorld('dialogAPI', {
    getDirectory: () => ipcRenderer.invoke('dialog:getDirectory')
});

contextBridge.exposeInMainWorld('videoAPI', {
    getVideos: async (directory) => {
        try {
            const videos = await ipcRenderer.invoke('get-videos', directory);
            return videos;
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    }
});