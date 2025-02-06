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
    ACTIVE_DIRECTORY, MAIN_WINDOW_WIDTH_MIN, MAIN_WINDOW_HEIGHT_MIN, MAIN_WINDOW_ICON_PATH, PRELOAD_PATH, INDEX_PATH, 
    CHECK_PROGRAMS_DELAY_IN_MSECONDS, TIME_PAD, EVENT_PAD, LOGS_PATH, LOGS_DIV, 
    OBS_EXECUTABLE_PATH, CAPTURES_DATE_FORMAT, 
    SCENE_NAME, SPEAKER_INPUT_NAME, MICROPHONE_INPUT_NAME, 
    CAPTURES_THUMBNAIL_DIRECTORY, CLIPS_THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE, 
    SETTINGS_CONFIG_PATH, SETTINGS_DATA_SCHEMA, SETTINGS_DATA_DEFS, RECORD_ENCODER_PATH, SHELL_DEVICES_COMMAND, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    data, flags, insts, progs, states, uuids 
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
    insts['obsProcess'] = spawn(OBS_EXECUTABLE_PATH, [
        '--portable',
        '--multi',
        '--minimize-to-tray'
    ], {
        cwd: path.dirname(OBS_EXECUTABLE_PATH),
    });
}