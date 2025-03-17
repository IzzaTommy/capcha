/**
 * Module for initializing all components for the main process
 * 
 * @module main
 * @requires electron
 * @requires mainGeneral
 * @requires mainOBS
 * @requires mainWebSocket
 * @requires mainSettings
 */
import { app, powerMonitor } from 'electron';
import { initMainGenVars, initMainGen, checkLogsDirSize, addLogMsg, openDevTools, sendIPC } from './components/mainGeneral.js';
import { initMainOBSVars, initMainOBS, getOBSState, setOBSState } from './components/mainOBS.js';
import { initMainWebSocketVars, initMainWebSocket, getIsRec } from './components/mainWebSocket.js';
import { initMainStgsVars, initMainStgs } from './components/mainSettings.js';

// on ready, initialize all components
app.on('ready', initMain);

// THIS DOES NOT WORK, SLEEP NEEDS TO BE ALLOWED ON THE OBS SIDE
// on suspend, log and stop recording if it is enabled
powerMonitor.on('suspend', () => {
    // log that a suspension has been detected
    addLogMsg('General', 'SUSPD', 'Suspension detected', false);  // boolean1 isFinalMsg

    // check if the program is recording
    if (getIsRec()) {
        // log the recording status
        addLogMsg('General', 'SUSPD', 'Recording active', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
        addLogMsg('General', 'SUSPD', 'Attempting to stop recording', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

        // request a call to setRecBarBtnState on the renderer process
        sendIPC('stgs:reqSetRecBarBtnState');
    }
    else {
        // log the recording status
        addLogMsg('General', 'SUSPD', 'Recording not active', true, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
    }
});

// typical execution: before-quit -> close all windows -> window-all-closed -> will-quit -> quit
// close button clicked: close all windows -> window-all-closed -> before-quit -> will-quit -> quit

// on window-all-closed, log and initiate the app quitting process
app.on('window-all-closed', () => {
    // log that all windows have been closed
    addLogMsg('General', 'CLOSE', 'All windows closed');

    // quit the app
    app.quit();
})

// on before-quit, log and kill the OBS process
app.on('before-quit', () => { 
    // log that the OBS process is being terminated
    addLogMsg('General', 'CLOSE', 'Terminating the OBS Process', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg

    // check if the OBS process is not terminated
    if (getOBSState()) {
        // terminate the OBS state
        setOBSState();
    }

    // log if the OBS process has been terminated
    addLogMsg('General', 'CLOSE', `${getOBSState() ? 'Failed to terminate' : 'Successfully terminated'}` + ' the OBS Process', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
});

// on will-quit, log that CapCha is quitting
app.on('will-quit', () => {
    addLogMsg('General', 'CLOSE', 'Quitting CapCha', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
});

// on quit, log that CapCha has successfully quit
app.on('quit', () => {
    addLogMsg('General', 'CLOSE', 'Successfully quit CapCha', false, true);  // boolean1 isFinalMsg, boolean2 isSubMsg
});

/**
 * Initializes the main process
 */
function initMain() {
    // initialize the main variables
    initVars();

    // initialize the main components
    init();
}

/**
 * Initializes all the variables
 */
function initVars() {
    // initialize all the variables
    initMainGenVars();
    initMainOBSVars();
    initMainWebSocketVars();
    initMainStgsVars();
}

/**
 * Initializes the general components
 */
async function init() {
    // initialize the general components
    initMainGen(finishInit);
}

/**
 * Initializes OBS, WebSocket, and the settings
 */
async function finishInit() {
    // check the logs directory storage limit
    checkLogsDirSize();
    
    // initialize OBS
    await initMainOBS();

    // initialize WebSocket
    await initMainWebSocket();

    // initialize the settings
    await initMainStgs();

    openDevTools();
    // request a call to finishInit on the renderer process
    sendIPC('proc:reqFinishInit');
}