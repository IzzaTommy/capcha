import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineMarker, timelineSlider, timelineState,  
    allSettingPill, saveLocationSettingPill, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';

import { getClickPercentage, setSVG, setTicks, getReadableTime, setVolumeSVG, setVideoState, setBoxWidths, setGalleryGap } from './shared.js';

export { initnavBlock }

// handles navigation bar button event listeners
function initnavBlock() {
    loadnavBlockEL();

    loadnavBlock();
}

function loadnavBlockEL() {
    // change the SVGs on hover, change active content on click
    directoryBtn.addEventListener('mouseenter', () => setSVG(directorySVG, 'folder-solid'));
    directoryBtn.addEventListener('mouseleave', () => setSVG(directorySVG, 'folder'));
    directoryBtn.addEventListener('click', () => {
        settingsContainer1.classList.remove('active');
        editorContainer1.classList.remove('active');
        directoryContainer1.classList.add('active');

        videoPlayer.pause();
    });

    // change the SVGs on hover, change active content on click
    settingsBtn.addEventListener('mouseenter', () => setSVG(settingsSVG, 'settings-solid'));
    settingsBtn.addEventListener('mouseleave', () => setSVG(settingsSVG, 'settings'));
    settingsBtn.addEventListener('click', () => {
        directoryContainer1.classList.remove('active');
        editorContainer1.classList.remove('active');
        settingsContainer1.classList.add('active');

        videoPlayer.pause();
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
            settingsCache['navBarActive'] = await window.settingsAPI.setSetting('navBarActive', true);
        }
        else {
            setSVG(navToggleSVG, 'arrow-forward-ios');
            settingsCache['navBarActive'] = await window.settingsAPI.setSetting('navBarActive', false);
        }

        setBoxWidths();
    });
}

function loadnavBlock() {
    if (settingsCache['navBarActive'] === true) {
        navBar.classList.toggle('active');
        setSVG(navToggleSVG, 'arrow-back-ios');
    }
}