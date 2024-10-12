import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineTrack, timelineThumb, timelineState,  
    allSettingPill, saveLocationSettingPill, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';

import { getClickPercentage, setSVG, setTicks, getReadableTime, setVolumeSVG, setVideoState, setBoxWidths, setGalleryGap } from './shared.js';

export { initViewport }

function initViewport() {
    loadViewportEL();
}

function loadViewportEL() {
    // resize timeline viewbox on window resize
    window.addEventListener('resize', setBoxWidths);
}