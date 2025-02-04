/**
 * Module for initializing WebSocket for the main process
 * 
 * @module mainWebSocket
 * @requires electron
 * @requires fluent-ffmpeg
 * @requires path
 * @requires ws
 * @requires mainVariables
 * @requires mainGeneral
 */
import { ipcMain } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { WebSocket } from 'ws';
import { 
    MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, CHECK_PROGRAMS_DELAY_IN_MSECONDS, PAD, LOGS_PATH, LOGS_DIVIDER, THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, CAPTURES_DIRECTORY_DEF, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_DIRECTORY_DEF, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_PATH_DEF, STGS_DATA_SCHEMA, STGS_DATA_DEFAULTS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, inst, progs, state, uuid 
} from './mainVariables.js';
import { initMainGeneral, togAutoRec, checkProgs, getVideoDate, getLogDate, logProc, atmpAsyncFunc } from './mainGeneral.js';

/**
 * @exports initMainWebSocket, webSocketReq, webSocketBatchReq
 */
export { initMainWebSocket, webSocketReq, webSocketBatchReq };

/**
 * Initializes WebSocket
 */
async function initMainWebSocket() {
    await atmpAsyncFunc(() => initWebSocket());
    initWebSocketL();
}

/**
 * Initializes the WebSocket instance
 * 
 * @returns {Promise} The result of opening a WebSocket connection
 */
function initWebSocket() {
    return new Promise((resolve, reject) => {
        // clear an existing attempt
        if (inst['webSocket']) {
            inst['webSocket'].removeAllListeners();
            inst['webSocket'].terminate();
        }

        // start a new attempt to connect to WebSocket
        inst['webSocket'] = new WebSocket('ws://localhost:4444');

        // on open, log that WebSocket is open
        inst['webSocket'].on('open', () => { 
            logProc('WebSocket', 'OPEN', 'Connected to OBS WebSocket');
        });
    
        // on error, log that WebSocket had an error
        inst['webSocket'].on('error', () => { 
            logProc('WebSocket', 'ERROR', 'Couldn\'t connect to OBS WebSocket');
        });
    
        // on close, log that the WebSocket connection closed and reject the promise
        inst['webSocket'].on('close', (code, reason) => {
            logProc('WebSocket', 'CLOSE', 'Connection to OBS WebSocket closed', false);  // boolean1 isFinalMsg
            logProc('WebSocket', 'CLOSE', `Code: ${code}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            logProc('WebSocket', 'CLOSE', `Reason: ${reason.length === 0 ? 'N/A' : reason}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

            reject('WebSocket connection failed');
        });

        // on message log the operation
        inst['webSocket'].on('message', (data) => {
            // parse the data
            const msg = JSON.parse(data);
        
            logProc('WebSocket', 'MSG', 'Received message from OBS WebSocket', false);  // boolean1 isFinalMsg
            
            // log the operation number, operation details, and data
            switch (msg['op']) {
                case 0:
                    logProc('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', 'First message from the server', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `OBS WebSocket Version: ${msg['d']['obsWebSocketVersion']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `RPC Version: ${msg['d']['rpcVersion']}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // send op 1 to OBS WebSocket to initiate connection
                    inst['webSocket'].send(JSON.stringify({ 'op': 1, 'd': { rpcVersion: 1 } }));

                    break;

                case 2:
                    logProc('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', 'Connection validated, ready for normal operation', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Negotiated RPC Version: ${msg['d']['negotiatedRpcVersion']}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // resolve after validating connection
                    resolve();

                    break;

                case 5:
                    logProc('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', 'An event from OBS has occurred', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Event Type: ${msg['d']['eventType']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Event Intent: ${msg['d']['eventIntent']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Event Data: ${msg['d']['eventData'] ? JSON.stringify(msg['d']['eventData']) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    break;

                case 7:
                    logProc('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', 'OBS WebSocket is responding to a request coming from a client', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Request Type: ${msg['d']['requestType']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Request ID: ${msg['d']['requestId']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Request Status: ${msg['d']['requestStatus'] ? JSON.stringify(msg['d']['requestStatus']) : 'N/A'}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Response Data: ${msg['d']['responseData'] ? JSON.stringify(msg['d']['responseData']) : 'N/A'}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // resolve/reject any pending requests
                    if (state['pendReqs'].has(msg['d']['requestId'])) {
                        const { resolve, reject } = state['pendReqs'].get(msg['d']['requestId']);
            
                        if (msg['d']['requestStatus']['result']) {
                            logProc('WebSocket', 'MSG', `Request successful`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                            
                            resolve(msg['d']);
                        } 
                        else {
                            logProc('WebSocket', 'MSG', `Request failed`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                            reject(msg['d']);
                        }
            
                        state['pendReqs'].delete(msg['d']['requestId']);
                    }

                    break;

                case 9:
                    logProc('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', 'OBS WebSocket is responding to a request batch coming from a client', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Request ID: ${msg['d']['requestId']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    logProc('WebSocket', 'MSG', `Results: ${msg['d']['results'] ? JSON.stringify(msg['d']['results']) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // handle mapping...
                    if (state['pendReqs'].has(msg['d']['requestId'])) {
                        const { resolve, reject } = state['pendReqs'].get(msg['d']['requestId']);
            
                        if (msg['d']['results'][0]['requestStatus']['result']) {
                            logProc('WebSocket', 'MSG', `Request successful`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                            
                            resolve(msg['d']);
                        } 
                        else {
                            logProc('WebSocket', 'MSG', `Request failed`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                            reject(msg['d']);
                        }
            
                        state['pendReqs'].delete(msg['d']['requestId']);
                    }
                    break;
            }
        });
    });
}

/**
 * Initializes the WebSocket listeners
 */
function initWebSocketL() {
    // on startRecord, set the video file name and start recording
    ipcMain.handle('webSocket:startRecord', async (_, recGame) => {
        await atmpAsyncFunc(() => webSocketReq('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'FilenameFormatting', parameterValue: `${recGame}-${CAPTURES_DATE_FORMAT}` }));
        flags['isRec'] = (await atmpAsyncFunc(() => webSocketReq('StartRecord', {})))['requestStatus']['result'];

        // return if recording is enabled or not
        return flags['isRec'];
    });

    // on stopRecord, stop recording
    ipcMain.handle('webSocket:stopRecord', async (_) => {
        flags['isRec'] = !(await atmpAsyncFunc(() => webSocketReq('StopRecord', {})))['requestStatus']['result'];

        // return if recording is disabled or not
        return !flags['isRec'];
    });

    //
    ipcMain.handle('clip:createClip', async (_, videoDataPath, clipStartTime, clipEndTime) => {
        try {
            const result = await new Promise((resolve, reject) => {
                const command = ffmpeg(videoDataPath);
    
                command.setStartTime(clipStartTime);
                command.duration(clipEndTime - clipStartTime);
                // command.videoFilters(`scale=${data['stgs'].get('clipsWidth')}:${data['stgs'].get('clipsHeight')}`);

                command.videoCodec('h264_nvenc');
                command.audioCodec('aac');

                // command.outputOptions('-threads 2');
                // command.outputOptions('-preset fast');
                command.outputOptions('-c copy');
                command.output(path.join(data['stgs'].get('clipsPath'), `CLIP-${getVideoDate()}.${data['stgs'].get('clipsFormat')}`));
    
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

/**
 * Sends a request to OBS WebSocket
 * 
 * @param {string} reqType - The type (name) of the request
 * @param {Object} reqData - The data (parameters) of the request
 * @returns {Promise} The result of the request
 */
function webSocketReq(reqType, reqData) {
    // generate a new request ID
    const reqId = Math.random().toString(36).substring(2, 15);

    // log the operation number, operation details, and data
    logProc('WebSocket', 'REQ', 'Request sent to OBS WebSocket', false);  // boolean1 isFinalMsg
    logProc('WebSocket', 'REQ', 'OP: 6', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', 'Client making a request to OBS WebSocket', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Request Type: ${reqType}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Request ID: ${reqId}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Request Data: ${reqData ? JSON.stringify(reqData) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

    // return a promise with the request in the pending requests map, then initiate the request
    return new Promise((resolve, reject) => {
        state['pendReqs'].set(reqId, { resolve, reject });

        inst['webSocket'].send(JSON.stringify({ 'op': 6, 'd': { 'requestType': reqType, 'requestId': reqId, 'requestData': reqData } }));
    });
}



function webSocketBatchReq(haltOnFail, execType, reqs) {
    // generate a new request ID
    const reqId = Math.random().toString(36).substring(2, 15);

    // log the operation number, operation details, and data
    logProc('WebSocket', 'REQ', 'Batch request sent to OBS WebSocket', false);  // boolean1 isFinalMsg
    logProc('WebSocket', 'REQ', 'OP: 8', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', 'Client making a batch request to OBS WebSocket', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Request ID: ${reqId}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Halt on failure: ${haltOnFail}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Execution Type: ${execType}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    logProc('WebSocket', 'REQ', `Requests: ${reqs ? JSON.stringify(reqs) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

    // return a promise with the request in the pending requests map, then initiate the request
    return new Promise((resolve, reject) => {
        state['pendReqs'].set(reqId, { resolve, reject });

        inst['webSocket'].send(JSON.stringify({ 'op': 8, 'd': { 'requestId': reqId, 'haltOnFailure': haltOnFail, 'executionType': execType, 'requests': reqs } }));
    });
}