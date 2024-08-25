const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
        }
    });

    mainWindow.loadFile('index.html');

    const ws = new WebSocket('ws://localhost:4444');

    ws.on('open', () => {
        console.log('Connected to OBS WebSocket');

        const message = {
            'op': 1,
            'd': { rpcVersion: 1 }
        };
        
        ws.send(JSON.stringify(message));
    });

    ws.on('message', (data) => {
        message = JSON.parse(data);

        console.log('--------------------------------');

        console.log('OP:', message['op']);
        for (const [key, value] of Object.entries(message['d'])) {
            console.log(key, ': ', value);
        }

        switch (message['op']) {
            case 0:
                console.log('Info: Hello!');
                break;
            case 2:
                console.log('Info: Received and validated connection, ready for normal operation.');
                break;
            case 5:
                console.log('Info: An event from OBS has occurred.');
                break;
            case 7:
                console.log('Info: Responding to request from client.');

                if (message['d']['requestStatus']['result']) {
                    console.log('Status: Request succeeded.');
                } 
                else {
                    console.log('Status: Request failed.');
                    console.error(message['d']['requestStatus']['comment']);
                }
                break;
            case 9:
                console.log('Info: Responding to request batch from client.');
                break;
            default:
                console.log('Info: Uncaught OP.')
        }
    });


    ws.on('close', (code, reason) => {
        console.log('--------------------------------');
        console.log('Disconnected from OBS WebSocket');
        console.log('Code:', code);
        console.log('Reason:', reason.toString());
    });

    ws.on('error', (error) => {
        console.log('--------------------------------');
        console.error('WebSocket error:', error);
    });

    ipcMain.on('ws-send', (event, requestType, requestData) => {
        console.log(`Sending ${requestType} request to OBS WebSocket with data:`, requestData);
        if (ws && ws.readyState === WebSocket.OPEN) {
            const requestMessage = {
                'op': 6,
                'd': {
                    requestType: requestType,
                    requestData: requestData,
                    requestId: Math.random().toString(36).substring(4)
                }
            };

            ws.send(JSON.stringify(requestMessage));
        } 
        else {
            console.log('WebSocket is not open. Cannot send message.');
        }
    });
}




app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
