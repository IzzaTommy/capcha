import { TimelineState } from './timelineState.js';
import { initDirectoryContainer, loadGallery } from './directoryContainer.js';

export { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackContainer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineMarker, timelineSlider, timelineState, 
    allSettingPill, saveLocationSettingPill, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData }

/* ========== constants ========== */
const GROW_FACTOR = 0.15;
const REDUCE_FACTOR = 0.1;

/* ========== style ==========*/
let style;

/* ========== elements ========== */
let minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
navToggleBtn, navToggleSVG, 
directoryContainer1, editorContainer1, settingsContainer1, 
videoContainer, videoPlayer, playbackContainer, playbackSlider, 
playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
timelineMarker, timelineSlider, timelineState, 
allSettingPill, saveLocationSettingPill, 
capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
flags, boxes, 
settingsCache, 
videosData;

export async function initVariables() {
    style = getComputedStyle(document.documentElement);

    /* ========== elements ========== */
    /* ---------- title bar elements ---------- */
    minimizeBtn = document.querySelector('#btn-minimize');
    maximizeBtn = document.querySelector('#btn-maximize');
    closeBtn = document.querySelector('#btn-close');

    /* ---------- nav panel elements ---------- */
    navBar = document.querySelector('#bar-nav');

    directoryBtn = document.querySelector('#btn-directory');
    directorySVG = directoryBtn.querySelector('svg > use');

    settingsBtn = document.querySelector('#btn-settings');
    settingsSVG = settingsBtn.querySelector('svg > use');

    recordBtn = document.querySelector('#btn-record');
    recordSVG = recordBtn.querySelector('svg > use');

    navToggleBtn = document.querySelector('#btn-nav-toggle');
    navToggleSVG = navToggleBtn.querySelector('svg > use');

    /* ---------- content panel elements ---------- */
    directoryContainer1 = document.getElementById('ctr1-directory');
    editorContainer1 = document.getElementById('ctr1-editor');
    settingsContainer1 = document.getElementById('ctr1-settings');

    /* ---------- editor section elements ---------- */
    videoContainer = document.querySelector('#ctr-video');

    videoPlayer = document.querySelector('#player-video');

    playbackContainer = document.querySelector('#ctr-playback');

    playbackSlider = document.querySelector('#slider-playback');

    playPauseBtn = document.querySelector('#btn-play-pause');
    playPauseSVG = playPauseBtn.querySelector('svg > use');

    volumeBtn = document.querySelector('#btn-volume');
    volumeSVG = volumeBtn.querySelector('svg > use');
    volumeSlider = document.querySelector('#slider-volume');

    currentTimeLabel = document.querySelector('#label-current-time');
    totalTimeLabel = document.querySelector('#label-total-time');

    speedSlider = document.querySelector('#slider-speed');
    speedBtn = document.querySelector('#btn-speed');
    speedLabel = speedBtn.querySelector('#label-current-speed');

    fullscreenBtn = document.querySelector('#btn-fullscreen');
    fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    timelineMarker = document.querySelector('#marker-timeline');
    timelineSlider = document.querySelector('#slider-timeline');

    timelineState = new TimelineState();

    /* ---------- settings section elements ---------- */
    allSettingPill = document.querySelectorAll(`.setting-pill > input:not([name='saveLocation']), .setting-pill > select`);
    saveLocationSettingPill = document.querySelector(`.setting-pill > input[name='saveLocation']`);

    /* ---------- directory section elements ---------- */
    capturesGallery = document.querySelector('#gallery-captures');
    videoPreviewTemplate = document.getElementsByTagName('template')[0];
    videoPreviewWidth = parseInt(style.getPropertyValue('--vtn-height')) * 16 / 9 + 2 * parseInt(style.getPropertyValue('--vpctr-padding'));
    capturesLeftBtn = document.querySelector('#btn-captures-left');
    capturesRightBtn = document.querySelector('#btn-captures-right');

    /* ---------- boolean flags ---------- */
    flags = { videoMetaDataLoaded: false };

    /* ---------- element bounding client rectangles ---------- */
    boxes = { 
        timelineSliderBox: timelineSlider.getBoundingClientRect(),
        playbackSliderBox: playbackSlider.getBoundingClientRect(),
        galleryBox: capturesGallery.getBoundingClientRect()
     };

    [settingsCache, videosData] = await Promise.all([window.settingsAPI.getAllSettings(), window.filesAPI.getAllVideosData()]);
}

window.filesAPI.reqInitDirectory(async () => {
    videosData = await window.filesAPI.getAllVideosData();
    loadGallery();
});