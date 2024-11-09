/**
 * Module for initializing all components
 * 
 * @module renderer
 * @requires rendVariables
 * @requires rendWindow
 * @requires rendTitleBar
 * @requires rendNavBlock
 * @requires rendSettingsSection
 * @requires rendEditorSection
 * @requires rendDirectoriesSection
 * 
 * 
 * 
 * 
 * 
 */
import { initRendVariables } from './components/rendVariables.js';
import { initRendWindow } from './components/rendWindow.js';
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

        // toggle the auto recording and the initialization overlay
        window.windowAPI.reqToggleAutoRecord();
        initializationOverlay.classList.remove('active');
    });
}

/**
 * Initializes the variables, window, and title bar
 */
function init() {
    initRendVariables();
    initRendWindow();
    initRendTitleBar();
}

/**
 * Initializes the settings section, nav block, directories section, and editor section
 */
async function finishInit() {
    await initRendSettingsSection();
    initRendNavBlock();
    initRendDirectoriesSection();
    initRendEditorSection();
}