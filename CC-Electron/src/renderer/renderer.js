/**
 * Module for initializing all components for the renderer process
 * 
 * @module renderer
 * @requires rendererGeneral
 * @requires rendererTitleBar
 * @requires rendererNavigationBlock
 * @requires rendererEditorSection
 * @requires rendererDirectoriesSection
 * @requires rendererSettingsSection
 */
import { STATE, initRendGenVars, initRendGen, setInitOvrlState, setInitStatLabelText } from './components/rendererGeneral.js';
import { initRendTitleBarVars, initRendTitleBar, setTitleBarStyle } from './components/rendererTitleBar.js';
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
    initRendGenVars();
    initRendTitleBarVars();
    initRendNavBlockVars();
    initRendEditSectVars();
    initRendDirsSectVars();
    initRendStgsSectVars();
}

/**
 * Initializes the general components and title bar
 */
function init() {
    initRendGen();
    initRendTitleBar();
}

/**
 * Initializes the settings section, navigation block, directories section, and editor section after the settings are read
 */
async function finishInit() {
    // indicate to the user the settings are being loaded
    setInitStatLabelText('Loading Settings...');
    await initRendStgsSect();

    initRendNavBlock();

    // indicate to the user the files are being loaded
    setInitStatLabelText('Loading Files...');
    await initRendDirsSect();
    
    initRendEditSect();

    // toggle auto recording
    window['stgsAPI'].reqTogAutoRec();

    // allow window dragging
    setTitleBarStyle('webkitAppRegion', 'drag');

    // hide the initialization overlay
    setInitOvrlState(STATE.INACTIVE);
}