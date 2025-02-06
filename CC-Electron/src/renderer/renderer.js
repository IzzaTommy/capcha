/**
 * Module for initializing all components for the renderer process
 * 
 * @module renderer
 * @requires rendererVariables
 * @requires rendererGeneral
 * @requires rendererTitleBar
 * @requires rendererNavigationBlock
 * @requires rendererEditorSection
 * @requires rendererDirectoriesSection
 * @requires rendererSettingsSection
 */
import { initRendVars, titleBar, initOvrl } from './components/rendererVariables.js';
import { initRendGen, setInitStatLabel } from './components/rendererGeneral.js';
import { initRendTitleBar } from './components/rendererTitleBar.js';
import { initRendNavBlock } from './components/rendererNavigationBlock.js';
import { initRendEditSect } from './components/rendererEditorSection.js';
import { initRendDirsSect } from './components/rendererDirectoriesSection.js';
import { initRendStgsSect } from './components/rendererSettingsSection.js';

// on DOM load, initialize all components
window.addEventListener('DOMContentLoaded', initRend);

/**
 * Initializes the renderer process
 */
function initRend() {
    init();

    // on request, finish initialization
    window['procAPI'].reqFinishInit(finishInit);
}

/**
 * Initializes the variables, general components, and title bar
 */
function init() {
    initRendVars();
    initRendGen();
    initRendTitleBar();
}

/**
 * Initializes the settings section, navigation block, directories section, and editor section after the settings are read
 */
async function finishInit() {
    // indicate to the user the settings are being loaded
    setInitStatLabel('Loading Settings...');
    await initRendStgsSect();

    initRendNavBlock();

    // indicate to the user the files are being loaded
    setInitStatLabel('Loading Files...');
    await initRendDirsSect();
    
    initRendEditSect();

    // toggle the auto recording, allow window dragging, and remove the initialization overlay
    window['stgsAPI'].reqTogAutoRec();
    titleBar.style.webkitAppRegion = 'drag';
    initOvrl.classList.remove('active');
}