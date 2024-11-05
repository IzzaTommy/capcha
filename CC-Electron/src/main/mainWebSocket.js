// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, instances, initMainVariables, SETTINGS_DATA_DEFAULTS, SETTINGS_DATA_SCHEMA, GAMES, flags, data, state } from './mainVariables.js';
import { initMainWindow } from './mainWindow.js';
import { initMainOBS } from './mainOBS.js';
import { initMainSettings } from './mainSettings.js';
import { attemptAsyncFunction } from './mainSharedFunctions.js';

export { initMainWebSocket, webSocketSend };

async function initMainWebSocket() {
    await initWebSocket();
    initWebSocketL();
}

function initWebSocket() {
    return new Promise((resolve, reject) => {
        // clear an existing attempt
        if (instances['webSocket']) {
            instances['webSocket'].removeAllListeners();
            instances['webSocket'].terminate();
        }

        // start a new attempt
        instances['webSocket'] = new WebSocket('ws://localhost:4444');

        // remove later
        instances['webSocket'].on('open', () => {
            console.log('\n---------------- OPEN ----------------');
            console.log('Connected to OBS WebSocket');
        });
    
        // remove later
        instances['webSocket'].on('error', (error) => {
            console.log('\n---------------- ERROR ----------------');
            console.error('Connection error:', error['code']);
        });
    
        // retry connection
        instances['webSocket'].on('close', (code, reason) => {
            console.log('\n---------------- CLOSE ----------------');
            console.log('Disconnected from OBS WebSocket');
            console.log('Code:', code);
            console.log('Reason:', reason.toString());
            console.log('Retrying connection');
            setTimeout(() => {
                initWebSocket().then(resolve).catch(reject);
            }, 1000);
        });

        // listen for message
        instances['webSocket'].on('message', (data) => {
            const message = JSON.parse(data);

            console.log('\n---------------- MESSAGE ----------------');
        
            console.log('OP:', message['op']);
            for (const [key, value] of Object.entries(message['d'])) {
                console.log(key, ': ', value);
            }
        
            switch (message['op']) {
                case 0:
                    console.log('Info: Hello!');

                    console.log('\n---------------- SEND ----------------');
                    console.log('OP: 1');
                    console.log('RPC Version: 1');
                    instances['webSocket'].send(JSON.stringify({ 'op': 1, 'd': { rpcVersion: 1 } }));
                    break;
                case 2:
                    console.log('Info: Received and validated connection, ready for normal operation.');

                    resolve();
                    break;
                case 5:
                    console.log('Info: An event from OBS has occurred.');
                    break;
                case 7:
                    console.log('Info: Responding to a request coming from a client.');
        
                    if (state['pendingRequests'].has(message['d']['requestId'])) {
                        const { resolve, reject } = state['pendingRequests'].get(message['d']['requestId']);
            
                        if (message['d']['requestStatus']['result']) {
                            console.log('Status: Successful.');
                            resolve(message['d']);
                        } 
                        else {
                            console.log('Status: Failed.');
                            console.error(message['d']['requestStatus']['comment']);
                            reject(new Error(message['d']));
                        }
            
                        state['pendingRequests'].delete(message['d']['requestId']);
                    }
                    break;
                case 9:
                    console.log('Info: Responding to a request batch coming from the client.');
                    break;
                default:
                    console.log('Info: Unexpected OP: ', message['op']);
            }
        });
    });
}


function initWebSocketL() {
    ipcMain.handle('webSocket:StartRecord', async (_) => {
        const recording = (await webSocketSend('StartRecord', {}))['requestStatus']['result'];

        flags['recording'] = recording;

        return recording;
    });

    ipcMain.handle('webSocket:StopRecord', async (_) => {
        const recording = (await webSocketSend('StopRecord', {}))['requestStatus']['result'];

        flags['recording'] = !recording;

        return recording;
    });
}

function webSocketSend(requestType, requestData) {
    const requestId = Math.random().toString(36).substring(2, 15);

    console.log('\n---------------- SEND ----------------');
        
    console.log('OP: 6');
    console.log('Request Type: ', requestType);
    console.log('Request ID: ', requestId);
    console.log('Request Data: ', requestData);

    return new Promise((resolve, reject) => {
        state['pendingRequests'].set(requestId, { resolve, reject });

        instances['webSocket'].send(JSON.stringify({ 'op': 6,'d': { requestType, requestData, requestId } }));
    });
}
