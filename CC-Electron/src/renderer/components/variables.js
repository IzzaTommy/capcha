/**
 * Module for initializing variables
 * 
 * @module variables
 * @requires timelineState
 */
import { TimelineState } from './timelineState.js';

/**
 * @exports GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
 *  SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
 *  html, 
 *  minimizeBtn, maximizeBtn, closeBtn, 
 *  navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, currentRecordingTimeLabel, recordBtn, recordSVG, 
 *  navToggleBtn, navToggleSVG, 
 *  directoriesSection, editorSection, settingsSection, 
 *  videoContainer, videoPlayer, playPauseStatusSVG, 
 *  playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
 *  playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
 *  timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
 *  allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
 *  capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
 *  flags, boxes, 
 *  data, stateData, 
 *  initVariables 
 */
export { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, currentRecordingTimeLabel, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusSVG, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, stateData, 
    initVariables 
};

// timeline constants and time constants
const GROW_FACTOR = 0.15;
const REDUCE_FACTOR = 0.1;
const MIN_TIMELINE_ZOOM = 30;
const MIN_GALLERY_GAP = 5;
const MSECONDS_IN_SECOND = 1000;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;

// document styles
const style = getComputedStyle(document.documentElement);

// document elements
let html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, currentRecordingTimeLabel, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusSVG, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn 

// timelineState object
let timelineState;

// boolean flags, element boxes, settings/videos data, and state data
let flags, boxes, data, stateData;

async function initVariables() {
    // html element
    html = document.querySelector('html');

    // title bar elements
    minimizeBtn = document.getElementById('btn-minimize');
    maximizeBtn = document.getElementById('btn-maximize');
    closeBtn = document.getElementById('btn-close');

    // nav block elements
    navBar = document.getElementById('bar-nav');

    directoriesBtn = document.getElementById('btn-directories');
    directoriesSVG = directoriesBtn.querySelector('svg > use');

    settingsBtn = document.getElementById('btn-settings');
    settingsSVG = settingsBtn.querySelector('svg > use');

    currentRecordingTimeLabel = document.getElementById('label-current-recording-time');

    recordBtn = document.getElementById('btn-record');
    recordSVG = recordBtn.querySelector('svg > use');

    navToggleBtn = document.getElementById('btn-nav-toggle');
    navToggleSVG = navToggleBtn.querySelector('svg > use');

    // content block elements
    directoriesSection = document.getElementById('section-directories');
    editorSection = document.getElementById('section-editor');
    settingsSection = document.getElementById('section-settings');

    // editor section elements
    videoContainer = document.getElementById('ctr-video');

    videoPlayer = document.getElementById('player-video');

    playPauseStatusSVG = document.getElementById('status-play-pause');

    playbackContainer = document.getElementById('ctr-playback');

    playbackSlider = document.getElementById('slider-playback');
    playbackTrack = document.getElementById('track-playback');
    playbackThumb = document.getElementById('thumb-playback');

    playPauseBtn = document.getElementById('btn-play-pause');
    playPauseSVG = playPauseBtn.querySelector('svg > use');

    volumeBtn = document.getElementById('btn-volume');
    volumeSVG = volumeBtn.querySelector('svg > use');
    volumeSlider = document.getElementById('slider-volume');

    currentVideoTimeLabel = document.getElementById('label-current-video-time');
    totalVideoTimeLabel = document.getElementById('label-total-video-time');

    speedSlider = document.getElementById('slider-speed');
    speedBtn = document.getElementById('btn-speed');
    speedLabel = document.getElementById('label-current-speed');

    fullscreenBtn = document.getElementById('btn-fullscreen');
    fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    timelineSlider = document.getElementById('slider-timeline');
    timelineOverlay = document.getElementById('overlay-timeline');
    timelineTrack = document.getElementById('track-timeline');
    timelineThumb = document.getElementById('thumb-timeline');

    // settings section elements
    allSettingPill = document.querySelectorAll(`.setting-pill > input:not([name='saveLocation']), .setting-pill > select`);
    allSettingToggleSwitch = document.querySelectorAll(`.setting-toggle-switch > input:not([name='darkMode'])`);
    saveLocationSettingPill = document.querySelector(`.setting-pill > input[name='saveLocation']`);
    darkModeSettingToggleSwitch = document.querySelector(`.setting-toggle-switch > input[name='darkMode']`);

    // directories section elements
    capturesGallery = document.getElementById('gallery-captures');
    videoPreviewTemplate = document.querySelector('template');
    videoPreviewWidth = parseInt(style.getPropertyValue('--vtn-height')) * 16 / 9 + 2 * parseInt(style.getPropertyValue('--vpctr-padding'));
    capturesLeftBtn = document.getElementById('btn-captures-left');
    capturesRightBtn = document.getElementById('btn-captures-right');

    // timelineState object
    timelineState = new TimelineState();

    // boolean flags
    flags = { 
        videoLoaded: false, 
        timelineSliderDragging: false, 
        playbackSliderDragging: false,
        previouslyPaused: false, 
        recording: false
    };

    // element boxes
    boxes = { 
        timelineSliderBox: timelineSlider.getBoundingClientRect(),
        playbackSliderBox: playbackSlider.getBoundingClientRect(),
        galleryBox: capturesGallery.getBoundingClientRect() 
    };

    // settings and videos data
    data = {};

    stateData = {};
}