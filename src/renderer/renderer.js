/**
 * Module for initializing all components for the renderer process
 * 
 * @module renderer
 * @requires rendererGeneral
 * @requires rendererNavigationBlock
 * @requires rendererEditorSection
 * @requires rendererDirectoriesSection
 * @requires rendererSettingsSection
 */
import { STATE, initRendGenVars, initRendGen, setInitOvrlState, setInitStatLabelText, setTitleBarStyle, setContStatLabelText } from './components/rendererGeneral.js';
import { initRendNavBlockVars, initRendNavBlock } from './components/rendererNavigationBlock.js';
import { initRendEditSectVars, initRendEditSect } from './components/rendererEditorSection.js';
import { initRendDirsSectVars, initRendDirsSect } from './components/rendererDirectoriesSection.js';
import { initRendStgsSectVars, initRendStgsSect } from './components/rendererSettingsSection.js';

// on DOM load, initialize all components
window.addEventListener('DOMContentLoaded', initRend);

/**
 * Initializes the renderer process
 */
function initRend() {
    // initialize the renderer variables
    initVars();
    
    // initialize the renderer components
    init();

    // on request, finish initializing the renderer components
    window['procAPI'].reqFinishInit(finishInit);
}

/**
 * Initializes all the variables
 */
function initVars() {
    // initialize all the variables
    initRendGenVars();
    initRendNavBlockVars();
    initRendEditSectVars();
    initRendDirsSectVars();
    initRendStgsSectVars();
}

/**
 * Initializes the general components and title bar
 */
function init() {
    // initialize and indicate to the user the general components are being loaded
    setInitStatLabelText('Loading...');
    initRendGen();
}

/**
 * Initializes the settings section, navigation block, directories section, and editor section after the settings are read
 */
async function finishInit() {
    // initialize and indicate to the user the settings are being loaded
    setInitStatLabelText('Loading Settings...');
    await initRendStgsSect();

    // initialize the navigation block
    initRendNavBlock();

    // initialize and indicate to the user that the directories are being loaded
    setInitStatLabelText('Loading Files...');
    await initRendDirsSect();
    
    // initialize the editor section
    initRendEditSect();

    // request a call to setAutoRecState in the main process
    await window['stgsAPI'].reqSetAutoRecState();

    // allow window dragging
    setTitleBarStyle('webkitAppRegion', 'drag');

    // hide the initialization overlay
    setInitOvrlState(STATE.INACTIVE);
}