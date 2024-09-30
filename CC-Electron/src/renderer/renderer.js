import { initVariables } from './components/variables.js';
import { initTitleBar } from './components/titleBar.js';
import { initNavPanel } from './components/navPanel.js';
import { initVideoContainer, initTimelineContainer } from './components/editorSection.js';
import { initSettingsContainer } from './components/settingsSection.js';
import { initCarouselContainer } from './components/directorySection.js';

// wait for DOM to finish loading
window.addEventListener('DOMContentLoaded', init);

async function init() {
    await initVariables();
    initTitleBar();
    initNavPanel();
    initVideoContainer();
    initTimelineContainer();
    initSettingsContainer();
    initCarouselContainer();
}