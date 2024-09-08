const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('webSocketAPI', {
    startRecord: () => {
        ipcRenderer.send('ws-send', 'StartRecord', {});
    },

    stopRecord: () => {
        ipcRenderer.send('ws-send', 'StopRecord', {});
    }
});

contextBridge.exposeInMainWorld('titleBarAPI', {
    minimize: () => {
        ipcRenderer.send('tb-send', 'minimize');
    },

    maximize: () => {
        ipcRenderer.send('tb-send', 'maximize');
    },

    close: () => {
        ipcRenderer.send('tb-send', 'close');
    }
});

// Expose the `getVideos` function to the renderer process
contextBridge.exposeInMainWorld('videoAPI', {
    getVideos: async (directory) => {
        try {
            // Invoke the 'get-videos' handler and return the resolved value
            const videos = await ipcRenderer.invoke('get-videos', directory);
            return videos; // This is the returned data from ipcMain.handle
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    }
});