/**
 * Module for initializing OBS for the main process
 * 
 * @module mainOBS
 * @requires child_process
 * @requires path
 * @requires mainVariables
 */
import { spawn } from 'child_process';
import path from 'path';
import { 
    MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, CHECK_PROGRAMS_DELAY_IN_MSECONDS, PAD, LOGS_PATH, LOGS_DIVIDER, THUMBNAIL_SIZE, 
    ACTIVE_DIRECTORY, CAPTURES_DIRECTORY_DEF, CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_DIRECTORY_DEF, CLIPS_THUMBNAIL_DIRECTORY, OBS_EXECUTABLE_PATH, 
    CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    SETTINGS_PATH_DEF, STGS_DATA_SCHEMA, STGS_DATA_DEFAULTS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, inst, progs, state, uuid 
} from './mainVariables.js';

/**
 * @exports initMainOBS
 */
export { initMainOBS };

/**
 * Initializes OBS
 */
function initMainOBS() {
    initOBSProc();
}

/**
 * Initializes the OBS process
 */
function initOBSProc() {
    // start a separate, portable OBS instance (so the actual OBS can be run alongside if the user wants)
    inst['obsProcess'] = spawn(OBS_EXECUTABLE_PATH, [
        '--portable',
        '--multi',
        '--minimize-to-tray'
    ], {
        cwd: path.dirname(OBS_EXECUTABLE_PATH),
    });
}