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
 * Initializes all components
 */
async function initRend() {
    initRendVariables();
    initRendWindow();
    initRendTitleBar();

    window.windowAPI.reqFinishInitRend(async () => { 
        await initRendSettingsSection();
        initRendNavBlock();
        initRendDirectoriesSection();
        initRendEditorSection();

        initializationOverlay.classList.toggle('active');
    });
}