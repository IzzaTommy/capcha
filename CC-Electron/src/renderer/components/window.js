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

import { loadGallery } from './directoryContainer.js';

export { initWindow }

function initWindow() {
    initWindowEL();

    initWindowIPC();
}

function initWindowEL() {
    // on resize, resize all width dependent elements
    window.addEventListener('resize', () => {
        resizeAll();
    });
}

function initWindowIPC() {
    // 
    window.filesAPI.reqLoadGallery(() => { 
        loadGallery(); 
    });

    // send the video player volume when requested
    window.settingsAPI.reqVolumeSettings(() => {
        window.settingsAPI.setVolumeSettings({ 'volume': data['settings']['volume'], 'volumeMuted': data['settings']['volumeMuted'] });
    });
}