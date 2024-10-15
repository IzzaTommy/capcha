import { TimelineState } from './timelineState.js';

export { 
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
};

/* ========== constants ========== */
const GROW_FACTOR = 0.15;
const REDUCE_FACTOR = 0.1;

/* ========== style ==========*/
const style = getComputedStyle(document.documentElement);

/* ========== elements ========== */
let html, 
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

export async function initVariables() {
    /* ========== elements ========== */
    /* ---------- html element ---------- */
    html = document.querySelector('html');

    /* ---------- title bar elements ---------- */
    minimizeBtn = document.getElementById('btn-minimize');
    maximizeBtn = document.getElementById('btn-maximize');
    closeBtn = document.getElementById('btn-close');

    /* ---------- nav panel elements ---------- */
    navBar = document.getElementById('bar-nav');

    directoryBtn = document.getElementById('btn-directory');
    directorySVG = directoryBtn.querySelector('svg > use');

    settingsBtn = document.getElementById('btn-settings');
    settingsSVG = settingsBtn.querySelector('svg > use');

    recordBtn = document.getElementById('btn-record');
    recordSVG = recordBtn.querySelector('svg > use');

    navToggleBtn = document.getElementById('btn-nav-toggle');
    navToggleSVG = navToggleBtn.querySelector('svg > use');

    /* ---------- content panel elements ---------- */
    directoryContainer1 = document.getElementById('ctr1-directory');
    editorContainer1 = document.getElementById('ctr1-editor');
    settingsContainer1 = document.getElementById('ctr1-settings');

    /* ---------- editor section elements ---------- */
    videoContainer = document.getElementById('ctr-video');

    videoPlayer = document.getElementById('player-video');

    playbackContainer = document.getElementById('ctr-playback');

    playbackSlider = document.getElementById('slider-playback');
    playbackTrack = document.getElementById('track-playback');
    playbackThumb = document.getElementById('thumb-playback');

    playPauseBtn = document.getElementById('btn-play-pause');
    playPauseSVG = playPauseBtn.querySelector('svg > use');

    volumeBtn = document.getElementById('btn-volume');
    volumeSVG = volumeBtn.querySelector('svg > use');
    volumeSlider = document.getElementById('slider-volume');

    currentTimeLabel = document.getElementById('label-current-time');
    totalTimeLabel = document.getElementById('label-total-time');

    speedSlider = document.getElementById('slider-speed');
    speedBtn = document.getElementById('btn-speed');
    speedLabel = document.getElementById('label-current-speed');

    fullscreenBtn = document.getElementById('btn-fullscreen');
    fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    timelineSlider = document.getElementById('slider-timeline');
    timelineOverlay = document.getElementById('overlay-timeline');
    timelineTrack = document.getElementById('track-timeline');
    timelineThumb = document.getElementById('thumb-timeline');

    timelineState = new TimelineState();

    /* ---------- settings section elements ---------- */
    allSettingPill = document.querySelectorAll(`.setting-pill > input:not([name='saveLocation']), .setting-pill > select`);
    allSettingToggleSwitch = document.querySelectorAll(`.setting-toggle-switch > input:not([name='darkMode'])`);
    saveLocationSettingPill = document.querySelector(`.setting-pill > input[name='saveLocation']`);
    darkModeSettingToggleSwitch = document.querySelector(`.setting-toggle-switch > input[name='darkMode']`);

    /* ---------- directory section elements ---------- */
    capturesGallery = document.getElementById('gallery-captures');
    videoPreviewTemplate = document.querySelectorAll('template')[0];
    videoPreviewWidth = parseInt(style.getPropertyValue('--vtn-height')) * 16 / 9 + 2 * parseInt(style.getPropertyValue('--vpctr-padding'));
    capturesLeftBtn = document.getElementById('btn-captures-left');
    capturesRightBtn = document.getElementById('btn-captures-right');

    /* ---------- boolean flags ---------- */
    flags = { 
        videoLoaded: false, 
        timelineDragging: false, 
        playbackDragging: false 
    };

    /* ---------- element bounding client rectangles ---------- */
    boxes = { 
        timelineSliderBox: timelineSlider.getBoundingClientRect(),
        playbackSliderBox: playbackSlider.getBoundingClientRect(),
        galleryBox: capturesGallery.getBoundingClientRect() 
    };

    /* ---------- settings and video data---------- */
    data = {};
    // [data['settings'], data['videos']] = await Promise.all([window.settingsAPI.getAllSettings(), window.filesAPI.getAllVideosData()]);
}