// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import EventEmitter from 'events';

import { THUMBNAIL_SIZE, ACTIVE_DIRECTORY, DEF_VIDEO_DIRECTORY, DEF_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, GLOBAL_EMITTER, components, initVariables } from './variablesEJS.js';
import { initMainWindow, initMainWindowL } from './mainWindowEJS.js';
import { initOBS } from './obsEJS.js';
import { initSettings, initSettingsL } from './settingsEJS.js';

export { initWebSocket, initWebSocketL, wsFunction };

function initWebSocket() {
    if (components['webSocket']) {
        components['webSocket'].removeAllListeners();
        components['webSocket'].terminate();
    }

    components['webSocket'] = new WebSocket('ws://localhost:4444');

    components['webSocket'].on('open', () => {
        console.log('Connected to OBS WebSocket');

        components['webSocket'].removeAllListeners('error');
        components['webSocket'].removeAllListeners('close');
        
        GLOBAL_EMITTER.emit('webSocketOpen');

        const message = {
            'op': 1,
            'd': { rpcVersion: 1 }
        };
        
        components['webSocket'].send(JSON.stringify(message));       
    });

    components['webSocket'].on('error', (error) => {
        console.error('1 Connection error:', error['code']);
    });

    components['webSocket'].on('close', (code, reason) => {
        console.log('2 Disconnected from OBS WebSocket');
        console.log('3 Code:', code, 'Reason:', reason.toString());
        console.log('4 Retrying connection...');
        setTimeout(initWebSocket, 3000);
    });
}

function initWebSocketL() {
    components['webSocket'].on('message', (data) => {
        const message = JSON.parse(data);
    
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

                GLOBAL_EMITTER.emit('webSocketLOpen');
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

        console.log('--------------------------------');
    });
    
    components['webSocket'].on('close', (code, reason) => {
        console.log('--------------------------------');
        console.log('Disconnected from OBS WebSocket');
        console.log('Code:', code);
        console.log('Reason:', reason.toString());
        console.log('--------------------------------');
    });
    
    components['webSocket'].on('error', (error) => {
        console.log('--------------------------------');
        console.error('WebSocket error: \n', error['code']);

        if (error['code'] === ' ECONNREFUSED') {
            setTimeout(attemptConnection, 2000);
        }
        console.log('--------------------------------');
    });

    ipcMain.on('ws-fn', (_, requestType, requestData) => {
        wsFunction(requestType, requestData);
    });
}

function wsFunction(requestType, requestData) {
    console.log(` --- Sending ${requestType} request to OBS WebSocket with data:`, requestData);
    
    if (components['webSocket'] && components['webSocket'].readyState === WebSocket.OPEN) {
        const requestMessage = {
            'op': 6,
            'd': {
                requestType: requestType,
                requestData: requestData,
                requestId: Math.random().toString(36).substring(4)
            }
        };

        components['webSocket'].send(JSON.stringify(requestMessage));
    } 
    else {
        console.log('WebSocket is not open. Cannot send message.');
    }
}