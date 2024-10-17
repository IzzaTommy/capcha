/**
 * Module for initializing all components
 * 
 * @module renderer
 * @requires variables
 * @requires window
 * @requires titleBar
 * @requires navBlock
 * @requires settingsSection
 * @requires editorSection
 * @requires directoriesSection
 */
import { initVariables } from './components/variables.js';
import { initWindow } from './components/window.js';
import { initTitleBar } from './components/titleBar.js';
import { initNavBlock } from './components/navBlock.js';
import { initSettingsSection } from './components/settingsSection.js';
import { initEditorSection } from './components/editorSection.js';
import { initDirectoriesSection } from './components/directoriesSection.js';

// on DOM load, initialize all components
window.addEventListener('DOMContentLoaded', init);

/**
 * Initializes all components
 */
async function init() {
    initVariables();
    initWindow();
    initTitleBar();
    await initSettingsSection();
    initNavBlock();
    initDirectoriesSection();
    initEditorSection();
}