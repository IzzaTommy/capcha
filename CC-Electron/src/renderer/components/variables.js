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
    flags, 
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
flags,
settingsCache,
videosData,
capturesCarouselState, clipsCarouselState;

export async function initVariables() {
    /* ========== elements ========== */
    /* ---------- title bar elements ---------- */
    minimizeBtn = document.querySelector('#minimize-trigger');
    maximizeBtn = document.querySelector('#maximize-trigger');
    closeBtn = document.querySelector('#close-trigger');

    /* ---------- nav panel elements ---------- */
    navBar = document.querySelector('#nav-bar');

    directoryBtn = document.querySelector('#directory-trigger');
    directorySVG = directoryBtn.querySelector('svg > use');

    settingsBtn = document.querySelector('#settings-trigger');
    settingsSVG = settingsBtn.querySelector('svg > use');

    recordBtn = document.querySelector('#record-trigger');
    recordSVG = recordBtn.querySelector('svg > use');

    navExpander = document.querySelector('#nav-expander');
    navExpanderSVG = navExpander.querySelector('svg > use');

    /* ---------- content panel elements ---------- */
    directorySection = document.getElementById('directory-section');
    editorSection = document.getElementById('editor-section');
    settingsSection = document.getElementById('settings-section');

    /* ---------- editor section elements ---------- */
    videoContainer = document.querySelector('#video-container');

    video = document.querySelector('#video-player');

    playbackInput = document.querySelector('#playback-slider');

    playPauseBtn = document.querySelector('#play-pause-control');
    playPauseSVG = playPauseBtn.querySelector('svg > use');

    volumeBtn = document.querySelector('#volume-control');
    volumeSVG = volumeBtn.querySelector('svg > use');
    volumeInput = document.querySelector('#volume-slider');

    timeSpan = document.querySelector('#current-time');
    durationSpan = document.querySelector('#total-time');

    speedInput = document.querySelector('#speed-slider');
    speedBtn = document.querySelector('#speed-control');
    speedSpan = speedBtn.querySelector('#current-speed');

    fullscreenBtn = document.querySelector('#fullscreen-control');
    fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    timelineSVG = document.querySelector('#timeline-marker');
    timelineInput = document.querySelector('#timeline-slider');

    timelineState = new TimelineState();

    /* ---------- settings section elements ---------- */
    settingsInputSelect = document.querySelectorAll(':not(#save-location-setting).setting > div > input, .setting > div > select');
    saveLocationInput = document.querySelector('#save-location-setting > div > input');

    /* ---------- directory section elements ---------- */
    capturesGallery = document.querySelector('#captures-carousel > .gallery');
    videoPreviewTemplate = document.getElementsByTagName('template')[0];

    /* ---------- boolean flags ---------- */
    flags = { videoMetaDataLoaded: false };

    [settingsCache, videosData] = await Promise.all([window.settingsAPI.getAllSettings(), window.filesAPI.getAllVideosData()]);
}

window.filesAPI.reqInitCarousel(async () => {
    videosData = await window.filesAPI.getAllVideosData();
    initCarouselContainer();
});