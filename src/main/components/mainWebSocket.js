/**
 * Module for initializing WebSocket for the main process
 * 
 * @module mainWebSocket
 * @requires crypto
 * @requires electron
 * @requires ps-list
 * @requires ws
 * @requires mainGeneral
 * @requires mainOBS
 */
import crypto from 'crypto';
import { ipcMain } from 'electron';
import psList from 'ps-list';
import { WebSocket } from 'ws';
import { ASYNC_DELAY_IN_MSECONDS, addLogMsg, sendIPC, atmpAsyncFunc } from './mainGeneral.js';
import { OBS_PASSWORD, getTCPPort } from './mainOBS.js';
import { getStg } from './mainSettings.js';

// WebSocket constants
// captures date format
const CAPTURES_DATE_FORMAT = '%MM%DD%YY%hh%mm%ss';

// WebSocket variable
let recProgName;

// WebSocket flag
let isRec;

// WebSocket map and instance
let pendReqs, webSocket;

/**
 * Initializes the WebSocket variables
 */
export function initMainWebSocketVars() {
    // recording program name
    recProgName = '';

    // recording flag
    isRec = false;

    // pending requests map
    pendReqs = new Map();

    // WebSocket connection instance
    webSocket = null;
}

/**
 * Initializes WebSocket
 */
export async function initMainWebSocket() {
    // initialize WebSocket
    await atmpAsyncFunc(startWebSocket, 7, ASYNC_DELAY_IN_MSECONDS, 'Failed to load WebSocket!', true);  // boolean1 isInit

    // initialize the WebSocket listeners
    initWebSocketL();
}

/**
 * Starts the WebSocket instance
 * 
 * @returns {Promise} The result of opening a WebSocket connection
 */
function startWebSocket() {
    // return a promise to initialize WebSocket
    return new Promise((resolve, reject) => {
        // if an instance exists
        if (webSocket) {
            // remove all listeners and terminate the instance
            webSocket.removeAllListeners();
            webSocket.terminate();
        }

        // get a new WebSocket instance
        webSocket = new WebSocket(`ws://localhost:${getTCPPort()}`);

        // on open, log that WebSocket is open
        webSocket.on('open', () => addLogMsg('WebSocket', 'OPEN', 'Connected to OBS WebSocket'));
    
        // on error, log that WebSocket had an error
        webSocket.on('error', () => addLogMsg('WebSocket', 'ERROR', 'Couldn\'t connect to OBS WebSocket'));
    
        // on close, log that the WebSocket connection has closed and reject the promise
        webSocket.on('close', (code, reason) => {
            // log that the WebSocket connection has closed
            addLogMsg('WebSocket', 'CLOSE', 'Connection to OBS WebSocket closed', false);  // boolean1 isFinalMsg
            addLogMsg('WebSocket', 'CLOSE', `Code: ${code}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            addLogMsg('WebSocket', 'CLOSE', `Reason: ${reason.length === 0 ? 'N/A' : reason}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
            reject('WebSocket connection failed');
        });

        // on message, log the operation
        webSocket.on('message', (data) => {
            // parse the data
            const msg = JSON.parse(data);
        
            // log that a message has been received from OBS WebSocket
            addLogMsg('WebSocket', 'MSG', 'Received message from OBS WebSocket', false);  // boolean1 isFinalMsg
            
            // log the operation number, details, and data
            switch (msg['op']) {
                case 0:
                    // log the operation number, message, version, and RPC version
                    addLogMsg('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', 'First message from the server', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `OBS WebSocket Version: ${msg['d']['obsWebSocketVersion']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `RPC Version: ${msg['d']['rpcVersion']}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // send op 1 to OBS WebSocket to initiate a connection
                    webSocket.send(JSON.stringify(
                        { 
                            'op': 1, 
                            'd': { 'rpcVersion': 1, 'authentication': getAuthStr(msg['d']['authentication']['challenge'], msg['d']['authentication']['salt']) } 
                        }));

                    break;

                case 2:
                    // log the operation number, message, and RPC version
                    addLogMsg('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', 'Connection validated, ready for normal operation', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Negotiated RPC Version: ${msg['d']['negotiatedRpcVersion']}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // resolve the promise after validating connection
                    resolve();

                    break;

                case 5:
                    // log the operation number, message, event type, intent, and data
                    addLogMsg('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', 'An event from OBS has occurred', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Event Type: ${msg['d']['eventType']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Event Intent: ${msg['d']['eventIntent']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Event Data: ${msg['d']['eventData'] ? JSON.stringify(msg['d']['eventData']) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    break;

                case 7:
                    // log the operation number, message, request type, id, status, and data
                    addLogMsg('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', 'OBS WebSocket is responding to a request coming from a client', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Request Type: ${msg['d']['requestType']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Request ID: ${msg['d']['requestId']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Request Status: ${msg['d']['requestStatus'] ? JSON.stringify(msg['d']['requestStatus']) : 'N/A'}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Response Data: ${msg['d']['responseData'] ? JSON.stringify(msg['d']['responseData']) : 'N/A'}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // check if the request ID is in the pending requests map
                    if (pendReqs.has(msg['d']['requestId'])) {
                        // get the promise from the map
                        const { resolve, reject } = pendReqs.get(msg['d']['requestId']);
            
                        // check if the request was successful
                        if (msg['d']['requestStatus']['result']) {
                            // log that the request was successful
                            addLogMsg('WebSocket', 'MSG', `Request successful`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                            
                            // resolve the promise
                            resolve(msg['d']);
                        } 
                        else {
                            // log that the request failed
                            addLogMsg('WebSocket', 'MSG', `Request failed`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                            // reject the promise
                            reject(msg['d']);
                        }
            
                        // delete the request from the pending requests map
                        pendReqs.delete(msg['d']['requestId']);
                    }

                    break;

                case 9:
                    // log the operation number, message, request id, and results
                    addLogMsg('WebSocket', 'MSG', `OP: ${msg['op']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', 'OBS WebSocket is responding to a request batch coming from a client', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Request ID: ${msg['d']['requestId']}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                    addLogMsg('WebSocket', 'MSG', `Results: ${msg['d']['results'] ? JSON.stringify(msg['d']['results']) : 'N/A'}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                    // NEED TO HANDLE INDIVIDUAL BATCH REQUESTS
                    // check if the request ID is in the pending requests map
                    if (pendReqs.has(msg['d']['requestId'])) {
                        // get the promise from the map
                        const { resolve, reject } = pendReqs.get(msg['d']['requestId']);
            
                        // check if the request was successful
                        if (msg['d']['results'][0]['requestStatus']['result']) {
                            // log that the request was successful
                            addLogMsg('WebSocket', 'MSG', `Request successful`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
                            
                            // resolve the promise
                            resolve(msg['d']);
                        } 
                        else {
                            // log that the request failed
                            addLogMsg('WebSocket', 'MSG', `Request failed`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

                            // reject the promise
                            reject(msg['d']);
                        }
            
                        // delete the request from the pending requests map
                        pendReqs.delete(msg['d']['requestId']);
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
    ipcMain.handle('webSocket:startRecord', async (_, recProgName) => {
        // set the video file name
        await atmpAsyncFunc(() => sendWebSocketReq('SetProfileParameter', { parameterCategory: 'Output', parameterName: 'FilenameFormatting', parameterValue: `${recProgName}-CC${CAPTURES_DATE_FORMAT}` }));

        // request WebSocket to start recording and set the is recording flag
        isRec = (await atmpAsyncFunc(() => sendWebSocketReq('StartRecord', { })))['requestStatus']['result'];

        // return the is recording flag
        return isRec;
    });

    // on stopRecord, stop recording
    ipcMain.handle('webSocket:stopRecord', async (_) => {
        // request WebSocket to stop recording and set the is recording flag (negated to get if the recording is on)
        isRec = !(await atmpAsyncFunc(() => sendWebSocketReq('StopRecord', { })))['requestStatus']['result'];

        // return the is recording flag (negated to get if the recording stopped)
        return !isRec;
    });
}

/**
 * Gets the recording flag
 * 
 * @returns {boolean} - The recording flag
 */
export function getIsRec() {
    return isRec;
}

/**
 * Gets the authentication string for OBS WebSocket
 * 
 * @param {string} chall - The challenge of the authentication
 * @param {string} salt - The salt of the authentication
 * @returns {string} - The authentication string
 */
function getAuthStr(chall, salt) {
    return crypto.createHash('sha256').update((crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64') + chall)).digest('base64');
}

/**
 * Sends a request to OBS WebSocket
 * 
 * @param {string} reqType - The type (name) of the request
 * @param {Object} reqData - The data (arguments) of the request
 * @returns {Promise} The result of the request
 */
export function sendWebSocketReq(reqType, reqData) {
    // get a new request ID
    const reqId = Math.random().toString(36).substring(2, 15);

    // log the operation number, message, request type, id, and data
    addLogMsg('WebSocket', 'REQ', 'Request sent to OBS WebSocket', false);  // boolean1 isFinalMsg
    addLogMsg('WebSocket', 'REQ', 'OP: 6', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', 'Client making a request to OBS WebSocket', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Request Type: ${reqType}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Request ID: ${reqId}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Request Data: ${reqData ? JSON.stringify(reqData) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

    // return a promise with the request in the pending requests map, then initiate the request
    return new Promise((resolve, reject) => {
        // add the request to the pending requests map
        pendReqs.set(reqId, { resolve, reject });

        // send the request to OBS WebSocket
        webSocket.send(JSON.stringify({ 'op': 6, 'd': { 'requestType': reqType, 'requestId': reqId, 'requestData': reqData } }));
    });
}

/**
 * Sends a batch request to OBS WebSocket
 * 
 * @param {boolean} haltOnFail - Whether the request should halt if any request fails
 * @param {number} execType - -1, 0, 1, 2 for None, SerialRealtime, SerialFrame, or Parallel respectively
 * @param {Object[]} reqs - The array of request objects
 * @returns {Promise} The result of the batch request
 */
export function sendWebSocketBatchReq(haltOnFail, execType, reqs) {
    // get a new request ID
    const reqId = Math.random().toString(36).substring(2, 15);

    // log the operation number, message, request id, arguments, and requests
    addLogMsg('WebSocket', 'REQ', 'Batch request sent to OBS WebSocket', false);  // boolean1 isFinalMsg
    addLogMsg('WebSocket', 'REQ', 'OP: 8', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', 'Client making a batch request to OBS WebSocket', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Request ID: ${reqId}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Halt on failure: ${haltOnFail}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Execution Type: ${execType}`, false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    addLogMsg('WebSocket', 'REQ', `Requests: ${reqs ? JSON.stringify(reqs) : 'N/A'}`, true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

    // return a promise with the request in the pending requests map, then initiate the request
    return new Promise((resolve, reject) => {
        // add the batch request to the pending requests map
        pendReqs.set(reqId, { resolve, reject });

        // send the batch request to OBS WebSocket
        webSocket.send(JSON.stringify({ 'op': 8, 'd': { 'requestId': reqId, 'haltOnFailure': haltOnFail, 'executionType': execType, 'requests': reqs } }));
    });
}

/**
 * Checks if certain programs are running and toggle recording
 */
export async function checkProgs() {
    // get the process and programs lists
    const procs = await atmpAsyncFunc(psList);
    const progs = getStg('programs');

    // check if recording is on
    if (isRec) {
        // check if the recording program is not running or the program is not in the list
        if ((recProgName && !procs.some(proc => proc['name'] === progs[recProgName]['fullName'])) || !progs[recProgName]) {
            // request a call to setRecBarBtnState on the renderer process
            sendIPC('webSocket:reqSetRecBarBtnState');
        }
    }
    else {
        // iterate through each program
        for (const [progName, progInfo] of Object.entries(progs)) {
            // check the program list for a match
            if (procs.some(proc => proc['name'] === progInfo['fullName'])) {
                // set the recording program
                recProgName = progName;

                // request a call to setRecBarBtnState on the renderer process
                sendIPC('webSocket:reqSetRecBarBtnState', recProgName);

                break;
            }
        }
    }
}