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
    // let directoryContainer1 = document.getElementById('ctr1-directory');
    // let editorContainer1 = document.getElementById('ctr1-editor');
    // let settingsContainer1 = document.getElementById('ctr1-settings');

    // let directoryBtn = document.querySelector('#btn-directory');
    // let directorySVG = directoryBtn.querySelector('svg > use');

    // let settingsBtn = document.querySelector('#btn-settings');
    // let settingsSVG = settingsBtn.querySelector('svg > use');

    // let recordBtn = document.querySelector('#btn-record');
    // let recordSVG = recordBtn.querySelector('svg > use');

    // let darkModeSettingToggleSwitch = document.querySelector(`.setting-toggle-switch > input[name='darkMode']`);
    // let html = document.querySelector('html');

    // // change the SVGs on hover, change active content on click
    // directoryBtn.addEventListener('click', () => {
    //     settingsContainer1.classList.remove('active');
    //     editorContainer1.classList.remove('active');
    //     directoryContainer1.classList.add('active');
    // });

    // // change the SVGs on hover, change active content on click
    // settingsBtn.addEventListener('click', () => {
    //     directoryContainer1.classList.remove('active');
    //     editorContainer1.classList.remove('active');
    //     settingsContainer1.classList.add('active');
    // });

    // // change the SVGs on hover, change active content on click
    // recordBtn.addEventListener('click', () => {
    //     directoryContainer1.classList.remove('active');
    //     settingsContainer1.classList.remove('active');
    //     editorContainer1.classList.add('active');
    // });

    // darkModeSettingToggleSwitch.addEventListener('change', async () => {
    //     // set the dark mode based on the stored setting
    //     if (darkModeSettingToggleSwitch.checked) {
    //         html.dataset.theme = 'dark';
    //     }
    //     else {
    //         html.dataset.theme = 'light';
    //     }
    // });

    

    await initVariables();
    initViewport();
    initTitleBar();
    initnavBlock();
    initVideoContainer();
    initTimelineContainer();
    initSettingsContainer();
    initDirectoryContainer();
}