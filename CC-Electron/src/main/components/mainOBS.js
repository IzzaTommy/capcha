/**
 * Module for initializing OBS for the main process
 * 
 * @module mainOBS
 * @requires child_process
 * @requires path
 */
import { spawn } from 'child_process';
import path from 'path';

// OBS constants
// active directory
const ACTIVE_DIRECTORY = import.meta.dirname;

// OBS executable path and termination signal
const OBS_EXECUTABLE_PATH = path.join(ACTIVE_DIRECTORY, '..', '..', '..', '..', 'build_x64', 'rundir', 'RelWithDebInfo', 'bin', '64bit', 'obs64.exe');
const OBS_TERMINATION_SIGNAL = 'SIGTERM';

// OBS instance
let obsProc;

/**
 * Initializes the OBS variable
 */
export function initMainOBSVars() {
    // OBS process
    obsProc = null;
}

/**
 * Initializes OBS
 */
export function initMainOBS() {
    // initialize the OBS process
    initOBSProc();
}

/**
 * Initializes the OBS process
 */
function initOBSProc() {
    // start a separate, portable OBS instance (so the actual OBS can be run alongside if the user wants)
    obsProc = spawn(OBS_EXECUTABLE_PATH, [
        '--portable',  // separate from regular OBS
        '--multi',  // allow multiple instances of OBS to run at once
        '--minimize-to-tray'  // hidden by default
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