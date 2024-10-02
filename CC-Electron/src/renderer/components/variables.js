import { TimelineState } from './timelineState.js';
import { initCarouselContainer } from './directorySection.js';

export { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navExpander, navExpanderSVG, 
    directorySection, editorSection, settingsSection, 
    videoContainer, video, playbackInput, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeInput, timeSpan, durationSpan, speedInput, speedBtn, speedSpan, fullscreenBtn, fullscreenSVG, 
    timelineSVG, timelineInput, timelineState, 
    settingsInputSelect, saveLocationInput, capturesGallery, videoPreviewTemplate, 
    flags, boxes, 
    settingsCache, 
    videosData }

// ========== constants ========== */
const GROW_FACTOR = 0.15;
const REDUCE_FACTOR = 0.1;

/* ========== elements ========== */
let minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
navExpander, navExpanderSVG, 
directorySection, editorSection, settingsSection, 
videoContainer, video, playbackInput, 
playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeInput, timeSpan, durationSpan, speedInput, speedBtn, speedSpan, fullscreenBtn, fullscreenSVG, 
timelineSVG, timelineInput, timelineState, 
settingsInputSelect, saveLocationInput, capturesGallery, videoPreviewTemplate, 
flags, boxes, 
settingsCache, 
videosData;

export async function initVariables() {
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

    navExpander = document.querySelector('#btn-nav-toggle');
    navExpanderSVG = navExpander.querySelector('svg > use');

    /* ---------- content panel elements ---------- */
    directorySection = document.getElementById('ctr1-directory');
    editorSection = document.getElementById('ctr1-editor');
    settingsSection = document.getElementById('ctr1-settings');

    /* ---------- editor section elements ---------- */
    videoContainer = document.querySelector('#ctr-video');

    video = document.querySelector('#player-video');

    playbackInput = document.querySelector('#slider-playback');

    playPauseBtn = document.querySelector('#btn-play-pause');
    playPauseSVG = playPauseBtn.querySelector('svg > use');

    volumeBtn = document.querySelector('#btn-volume');
    volumeSVG = volumeBtn.querySelector('svg > use');
    volumeInput = document.querySelector('#slider-volume');

    timeSpan = document.querySelector('#label-current-time');
    durationSpan = document.querySelector('#label-total-time');

    speedInput = document.querySelector('#slider-speed');
    speedBtn = document.querySelector('#btn-speed');
    speedSpan = speedBtn.querySelector('#label-speed');

    fullscreenBtn = document.querySelector('#btn-fullscreen');
    fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    timelineSVG = document.querySelector('#marker-timeline');
    timelineInput = document.querySelector('#slider-timeline');

    timelineState = new TimelineState();

    /* ---------- settings section elements ---------- */
    settingsInputSelect = document.querySelectorAll(':not(#ctr-save-location).setting-ctr > div > input, .setting-ctr > div > select');
    saveLocationInput = document.querySelector('#ctr-save-location > div > input');

    /* ---------- directory section elements ---------- */
    capturesGallery = document.querySelector('#gallery-captures-directory');
    videoPreviewTemplate = document.getElementsByTagName('template')[0];

    /* ---------- boolean flags ---------- */
    flags = { videoMetaDataLoaded: false };

    /* ---------- element bounding client rectangles ---------- */
    boxes = { 
        timelineInputBox: timelineInput.getBoundingClientRect(),
        playbackInputBox: playbackInput.getBoundingClientRect(),
        galleryBox: capturesGallery.getBoundingClientRect()
     };

    [settingsCache, videosData] = await Promise.all([window.settingsAPI.getAllSettings(), window.filesAPI.getAllVideosData()]);
}

window.filesAPI.reqInitCarousel(async () => {
    videosData = await window.filesAPI.getAllVideosData();
    initCarouselContainer();
});