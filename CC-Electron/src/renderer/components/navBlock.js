import { 
    GROW_FACTOR, REDUCE_FACTOR, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data 
} from './variables.js';

import { setSVG, getParsedTime, resizeAll } from './shared.js';

export { initNavBlock }

// handles navigation bar button event listeners
function initNavBlock() {
    initNavBlockEL();

    loadNavBlock();
}

function initNavBlockEL() {
    // change the SVGs on hover, change active content on click
    directoryBtn.addEventListener('mouseenter', () => setSVG(directorySVG, 'folder-solid'));
    directoryBtn.addEventListener('mouseleave', () => setSVG(directorySVG, 'folder'));
    directoryBtn.addEventListener('click', () => {
        settingsContainer1.classList.remove('active');
        editorContainer1.classList.remove('active');
        directoryContainer1.classList.add('active');

        flags['videoLoaded'] = false;
    });

    // change the SVGs on hover, change active content on click
    settingsBtn.addEventListener('mouseenter', () => setSVG(settingsSVG, 'settings-solid'));
    settingsBtn.addEventListener('mouseleave', () => setSVG(settingsSVG, 'settings'));
    settingsBtn.addEventListener('click', () => {
        directoryContainer1.classList.remove('active');
        editorContainer1.classList.remove('active');
        settingsContainer1.classList.add('active');

        flags['videoLoaded'] = false;
    });

    // change the SVGs on hover, change active content on click
    recordBtn.addEventListener('mouseenter', () => setSVG(recordSVG, 'record-solid'));
    recordBtn.addEventListener('mouseleave', () => setSVG(recordSVG, 'record'));
    recordBtn.addEventListener('click', () => {
        window.webSocketAPI.startRecord();
    });

    // change the SVG on click, set nav bar to active
    navToggleBtn.addEventListener('click', async () => {
        navBar.classList.toggle('active');

        if (navBar.classList.contains('active')) {
            setSVG(navToggleSVG, 'arrow-back-ios');
            data['settings']['navBarActive'] = await window.settingsAPI.setSetting('navBarActive', true);
        }
        else {
            setSVG(navToggleSVG, 'arrow-forward-ios');
            data['settings']['navBarActive'] = await window.settingsAPI.setSetting('navBarActive', false);
        }

        resizeAll();
    });
}

function loadNavBlock() {
    if (data['settings']['navBarActive'] === true) {
        navBar.classList.toggle('active');
        setSVG(navToggleSVG, 'arrow-back-ios');
    }

    resizeAll();
}