import { initVariables } from './components/variables.js';
import { initTitleBar } from './components/titleBar.js';
import { initNavPanel } from './components/navPanel.js';
import { initVideoContainer } from './components/videoContainer.js';
import { initTimelineContainer } from './components/timelineContainer.js';
import { initSettingsSection } from './components/settingsSection.js';
import { initCarousel } from './components/carousel.js';

// wait for DOM to finish loading
window.addEventListener('DOMContentLoaded', init);

async function init() {
    await initVariables();
    initTitleBar();
    initNavPanel();
    initVideoContainer();
    initTimelineContainer();
    initSettingsSection();
    initCarousel();
}