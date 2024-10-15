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

import { setAllThumbs, setTicks, resizePlaybackSlider, resizeTimelineSlider } from './editorContainer.js';
import { resizeGallery } from './directoryContainer.js';

export { setSVG, getParsedTime, resizeAll };

// sets the SVG of an element
function setSVG(elementSVG, name) {
    elementSVG.setAttribute('href', `../assets/svg/${name}.svg#${name}`);
}

// gets the days, hours, minutes, and seconds of a given number of seconds
function getParsedTime(time) {    
    return [Math.floor(time / 86400), Math.floor(time % 86400 / 3600), Math.floor(time % 3600 / 60), Math.floor(time % 60)];
}

// resizes the gallery, playback slider, and timeline slider
function resizeAll() {
    resizeGallery();
    resizePlaybackSlider();
    resizeTimelineSlider();
}