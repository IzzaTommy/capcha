/**
 * Module for initializing all components
 * 
 * @module renderer
 * @requires rendVariables
 * @requires rendGeneral
 * @requires rendTitleBar
 * @requires rendNavBlock
 * @requires rendSettingsSection
 * @requires rendEditorSection
 * @requires rendDirectoriesSection
 * @requires rendVariables
 */
import { initRendVariables } from './components/rendVariables.js';
import { initRendGeneral, setInitializationStatusLabel } from './components/rendGeneral.js';
import { initRendTitleBar } from './components/rendTitleBar.js';
import { initRendNavBlock } from './components/rendNavBlock.js';
import { initRendSettingsSection } from './components/rendSettingsSection.js';
import { initRendEditorSection } from './components/rendEditorSection.js';
import { initRendDirectoriesSection } from './components/rendDirectoriesSection.js';

import { initializationOverlay } from './components/rendVariables.js';

// on DOM load, initialize all components
window.addEventListener('DOMContentLoaded', initRend);

/**
 * Initializes the renderer
 */
function initRend() {
    init();

    window.windowAPI.reqFinishInit(() => { 
        finishInit();
    });
}

/**
 * Initializes the variables, general components, and title bar
 */
function init() {
    initRendVariables();
    initRendGeneral();
    initRendTitleBar();
}

/**
 * Initializes the settings section, nav block, directories section, and editor section
 */
async function finishInit() {
    setInitializationStatusLabel('Loading Settings...');
    await initRendSettingsSection();

    initRendNavBlock();

    setInitializationStatusLabel('Loading Files...');
    await initRendDirectoriesSection();
    
    initRendEditorSection();

    // toggle the auto recording and the initialization overlay
    window.windowAPI.reqToggleAutoRecord();
    initializationOverlay.classList.remove('active');
}