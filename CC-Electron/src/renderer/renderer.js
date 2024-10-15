import { initVariables } from './components/variables.js';
import { initWindow } from './components/window.js';
import { initTitleBar } from './components/titleBar.js';
import { initNavBlock } from './components/navBlock.js';
import { initSettingsContainer } from './components/settingsContainer.js';
import { initEditorContainer } from './components/editorContainer.js';
import { initDirectoryContainer } from './components/directoryContainer.js';

// wait for DOM to finish loading
window.addEventListener('DOMContentLoaded', init);

// runs all initialization functions from all modules
async function init() {
    initVariables();
    await initSettingsContainer();
    initNavBlock();
    initDirectoryContainer();

    initWindow();
    initTitleBar();

    initEditorContainer();
}