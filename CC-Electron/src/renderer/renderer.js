/**
 * Module for initializing all components
 * 
 * @module renderer
 * @requires rendVariables
 * @requires rendGeneral
 * @requires rendTitleBar
 * @requires rendNavBlock
 * @requires rendEditorSection
 * @requires rendDirectoriesSection
 * @requires rendSettingsSection
 */
import { initRendVariables, titleBar, initializationOverlay } from './components/rendVariables.js';
import { initRendGeneral, setInitializationStatusLabel } from './components/rendGeneral.js';
import { initRendTitleBar } from './components/rendTitleBar.js';
import { initRendNavBlock } from './components/rendNavBlock.js';
import { getReadableDuration, initRendEditorSection } from './components/rendEditorSection.js';
import { initRendDirectoriesSection } from './components/rendDirectoriesSection.js';
import { initRendSettingsSection } from './components/rendSettingsSection.js';

// on DOM load, initialize all components
window.addEventListener('DOMContentLoaded', initRend);

// import { getReadableRecordingDuration } from './components/rendEditorSection.js';

/**
 * Initializes the renderer process
 */
function initRend() {
    init();

    window.windowAPI.reqFinishInit(() => {
        finishInit();
    });
}

/**
 * Initializes the variables, general components, and title bar (before the main settings)
 */
function init() {
    initRendVariables();
    initRendGeneral();
    initRendTitleBar();
}

/**
 * Initializes the settings section, nav block, directories section, and editor section (after the main settings)
 */
async function finishInit() {
    // set the text label to let the user know of the status
    setInitializationStatusLabel('Loading Settings...');
    await initRendSettingsSection();

    initRendNavBlock();

    setInitializationStatusLabel('Loading Files...');
    await initRendDirectoriesSection();
    
    initRendEditorSection();

    // toggle the auto recording and remove the initialization overlay
    window.windowAPI.reqToggleAutoRecord();
    titleBar.style.webkitAppRegion = 'drag';
    initializationOverlay.classList.remove('active');

    // console.log( getReadableRecordingDuration(800000000) );
    // console.log( getReadableRecordingDuration(8000000) );
    // console.log( getReadableRecordingDuration(4000000) );
    // console.log( getReadableRecordingDuration(87000) );
    // console.log( getReadableRecordingDuration(86400) );
    // console.log( getReadableRecordingDuration(37000) );
    // console.log( getReadableRecordingDuration(3700) );
    // console.log( getReadableRecordingDuration(3600) );
    // console.log( getReadableRecordingDuration(630) );
    // console.log( getReadableRecordingDuration(180) );
    // console.log( getReadableRecordingDuration(59) );
    // document.querySelector('.storage-ctr').addEventListener('click', () => {
    //     console.log('test');
    // })

    // document.querySelector('#view-bar-btn-clip').addEventListener('click', () => {
    //     console.log('test2');
    // })
}