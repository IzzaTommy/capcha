import { initVariables } from './components/variables.js';
import { initViewport } from './components/viewport.js';
import { initTitleBar } from './components/titleBar.js';
import { initnavBlock } from './components/navBlock.js';
import { initVideoContainer, initTimelineContainer } from './components/editorContainer.js';
import { initSettingsContainer } from './components/settingsContainer.js';
import { initDirectoryContainer, loadGallery } from './components/directoryContainer.js';

// wait for DOM to finish loading
window.addEventListener('DOMContentLoaded', init);

async function init() {
    await initVariables();
    initViewport();
    initTitleBar();
    initnavBlock();
    initVideoContainer();
    initTimelineContainer();
    // initSettingsContainer();
    initDirectoryContainer();
}