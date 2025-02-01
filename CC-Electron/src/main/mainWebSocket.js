// ES6 imports
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import WebSocket from 'ws';
import path from 'path';
import { promises as fs, writeFileSync, existsSync } from 'fs';
import Store from 'electron-store';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import psList from 'ps-list';
import { exec } from 'child_process';

import { 
    THUMBNAIL_SIZE, 
    ACTIVE_DIR, DEF_CAPS_DIR, DEF_CLIPS_DIR, CAPS_THUMBNAIL_DIR, CLIPS_THUMBNAIL_DIR, OBS_EXECUTABLE_PATH, 
    SCENE_NAME, SPKR_INPUT_NAME, MIC_INPUT_NAME, 
    STGS_DATA_DEFAULTS, STGS_DATA_SCHEMA, 
    PROGRAMS, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    instances, flags, 
    data, state, uuid, 
    initMainVariables 
} from './mainVariables.js';
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
    ipcMain.handle('webSocket:StartRecord', async (_, recordingGame) => {
        // return Promise.reject(new Error("Simulated error for testing"));
        await attemptAsyncFunction(() => webSocketSend('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'FilenameFormatting', parameterValue: `${recordingGame}-%MM%DD%YY%hh%mm%ss` }), ATTEMPTS, FAST_DELAY_IN_MSECONDS);
        // attempt async here?
        const recording = (await webSocketSend('StartRecord', {}))['requestStatus']['result'];

        flags['recording'] = recording;

        return recording;
    });

    ipcMain.handle('webSocket:StopRecord', async (_) => {
        // return Promise.reject(new Error("Simulated error for testing"));
        // attempt async here?
        const recording = (await webSocketSend('StopRecord', {}))['requestStatus']['result'];

        flags['recording'] = !recording;

        return recording;
    });


    ipcMain.handle('clip:createClip', async (_, videoDataPath, clipStartTime, clipEndTime) => {

        try {
            // Wrap the FFmpeg logic in a Promise
            const result = await new Promise((resolve, reject) => {
                const command = ffmpeg(videoDataPath);
    
                command.setStartTime(clipStartTime);
                command.videoFilters(`scale=${data['stgs'].get('clipsWidth')}:${data['stgs'].get('clipsHeight')}`);
                
                command.duration(clipEndTime - clipStartTime);

                command.videoCodec('libx264');
                command.audioCodec('copy');

                command.output(path.join(data['stgs'].get('clipsPath'), `CLIP-${getFormattedDate()}.${data['stgs'].get('clipsFormat')}`));
    
                command.on('end', () => {
                    resolve(path.join(data['stgs'].get('clipsPath'), 'testoutput.mp4'))
                });
                command.on('error', reject);
                command.run();
            });
    
            console.log('Processed video saved to:', result);
            
        } 
        catch (error) {
            console.error('Processing failed:', error);
        }

        console.log('done?');
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

function getFormattedDate() {
    const now = new Date();

    const MM = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const DD = String(now.getDate()).padStart(2, '0');
    const YY = String(now.getFullYear()).slice(-2); // Get the last two digits of the year
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');

    return `${MM}${DD}${YY}${hh}${mm}${ss}`;
}