/**
 * Module for initializing OBS for the main process
 * 
 * @module mainOBS
 * @requires child_process
 * @requires electron
 * @requires net
 * @requires path
 */
import { spawn } from 'child_process';
import { app } from 'electron';
import net from 'net'
import path from 'path';
import { atmpAsyncFunc } from './mainGeneral.js';

// OBS constants
// resource directory, app path
const RESOURCE_DIRECTORY = process.resourcesPath;
const APP_PATH = app.getAppPath();

// OBS executable path, password, and termination signal
const OBS_EXECUTABLE_PATH = app.isPackaged 
    ? path.join(RESOURCE_DIRECTORY, 'obs-studio', 'bin', '64bit', 'obs64.exe') 
    : path.join(APP_PATH, 'obs-studio', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');
export const OBS_PASSWORD = 'CapChaOBSPassword';
const OBS_TERMINATION_SIGNAL = 'SIGTERM';

// OBS variable
let tcpPort;

// OBS instance
let obsProc;

/**
 * Initializes the OBS variable
 */
export function initMainOBSVars() {
    // tcp port
    tcpPort = -1;

    // OBS process instance
    obsProc = null;
}

/**
 * Initializes OBS
 */
export async function initMainOBS() {
    // initialize the OBS process
    await initOBSProc();
}

/**
 * Initializes the OBS process
 */
async function initOBSProc() {
    // get an available TCP port
    tcpPort = await atmpAsyncFunc(findTCPPort);

    // start a separate, portable OBS instance (so the actual OBS can be run alongside if the user wants)
    obsProc = spawn(OBS_EXECUTABLE_PATH, [
        '--portable',  // separate from regular OBS
        '--multi',  // allow multiple instances of OBS to run at once
        '--minimize-to-tray',  // hidden by default
        '--websocket_password', OBS_PASSWORD, 
        '--websocket_port', tcpPort
    ], {
        cwd: path.dirname(OBS_EXECUTABLE_PATH),
    });
}

/**
 * Gets the OBS state
 * 
 * @returns {boolean} - If the OBS process exists and is not killed
 */
export function getOBSState() {
    return obsProc && !obsProc.killed;
}

/**
 * Sets the OBS state to killed
 */
export function setOBSState() {
    obsProc.kill(OBS_TERMINATION_SIGNAL);
}

/**
 * Gets the TCP port used by WebSocket
 * 
 * @returns {number} - The TCP port
 */
export function getTCPPort() {
    return tcpPort;
}

/**
 * Finds an available TCP port for WebSocket
 * 
 * @returns {number} - The available TCP port
 */
function findTCPPort() {
    return new Promise((resolve, reject) => {
        // create a new server, port
        const server = net.createServer();
        let port = -1;

        // let the OS assign an available port (0) and listen
        server.listen(0, () => {
            // get the port number
            port = server.address().port;

            // close the port
            server.close();
        });

        // on error, reject the promise
        server.once('error', reject);

        // on close, resolve the promise with the port number
        server.once('close', () => resolve(port));
    });

}