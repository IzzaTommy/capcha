/**
 * Module for initializing variables
 * 
 * @module rendVariables
 * @requires timelineState
 */
import { TimelineState } from './timelineState.js';

/**
 * @exports GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
 *  SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, PLAYBACK_RATE_MAPPING, 
 *  html, 
 *  initializationOverlay, initializationStatusLabel, 
 *  titleBar, minimizeBtn, maximizeBtn, closeBtn, 
 *  navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
 *  navToggleBtn, navToggleIcon, 
 *  generalStatusLabel, directoriesSection, editorSection, settingsSection, 
 *  videoContainer, videoPlayer, playPauseOverlayIcon, 
 *  playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
 *  mediaBar, playPauseBtn, playPauseIcon, 
 *  volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
 *  currentVideoTimeLabel, currentVideoDurationLabel, 
 *  playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
 *  fullscreenBtn, fullscreenIcon, 
 *  timelineSlider, timelineOverlay, timelineThumb, timeline, 
 *  mostSettingFields, mostSettingToggleFields, capturesPathSettingField, darkModeSettingToggleField, 
 *  capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
 *  flags, boxes, 
 *  data, state, 
 *  initRendVariables 
 */
export {
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, PLAYBACK_RATE_MAPPING, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, 
    mostSettingFields, mostSettingToggleFields, capturesPathSettingField, darkModeSettingToggleField, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
};

// timeline, time, mapping, and style constants
const GROW_FACTOR = 0.15;
const REDUCE_FACTOR = 0.1;
const MIN_TIMELINE_ZOOM = 30;
const MIN_GALLERY_GAP = 5;
const MSECONDS_IN_SECOND = 1000;
const SECONDS_IN_DAY = 86400;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;
const PLAYBACK_RATE_MAPPING = {
    '-2': 0.2, 
    '-1': 0.5, 
    '0': 0.7, 
    '1': 1, 
    '2': 2, 
    '3': 3, 
    '4': 4, 
    '0.7': 0,
    '0.5': -1, 
    '0.2': -2 
};
const style = getComputedStyle(document.documentElement);

// asynchronous function attempts and delay
const ATTEMPTS = 3;
const FAST_DELAY_IN_MSECONDS = 2000;
const SLOW_DELAY_IN_MSECONDS = 4000;

// document elements
let html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, 
    mostSettingFields, mostSettingToggleFields, capturesPathSettingField, darkModeSettingToggleField, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn 

// boolean flags, element boxes, settings/videos data, and state data
let flags, boxes, data, state;

/**
 * Initializes the variables
 */
function initRendVariables() {
    // html element
    html = document.querySelector('html');

    // initialization overlay elements
    initializationOverlay = document.getElementById('overlay-initialization');
    initializationStatusLabel = document.getElementById('status-label-initialization');

    // title bar elements
    titleBar = document.getElementById('bar-title');
    minimizeBtn = document.getElementById('btn-minimize');
    maximizeBtn = document.getElementById('btn-maximize');
    closeBtn = document.getElementById('btn-close');

    // nav block elements
    navBar = document.getElementById('bar-nav');

    directoriesBtn = document.getElementById('btn-directories');
    directoriesIcon = document.querySelector('#icon-directories > use');

    settingsBtn = document.getElementById('btn-settings');
    settingsIcon = document.querySelector('#icon-settings > use');

    currentRecordingLabelContainer = document.getElementById('label-ctr-current-recording');
    currentRecordingTimeLabel = document.getElementById('time-label-current-recording');
    currentRecordingGameLabel = document.getElementById('game-label-current-recording');

    recordBtn = document.getElementById('btn-record');
    recordIcon = document.querySelector('#icon-record > use');

    autoRecordResumeLabel = document.getElementById('resume-label-auto-record');

    navToggleBtn = document.getElementById('btn-nav-toggle');
    navToggleIcon = document.querySelector('#icon-nav-toggle > use');

    // content block elements
    generalStatusLabel = document.getElementById('status-label-general');

    directoriesSection = document.getElementById('section-directories');
    editorSection = document.getElementById('section-editor');
    settingsSection = document.getElementById('section-settings');

    // editor section elements
    videoContainer = document.getElementById('ctr-video');

    videoPlayer = document.getElementById('player-video');

    playPauseOverlayIcon = document.getElementById('overlay-icon-play-pause');

    playbackContainer = document.getElementById('ctr-playback');

    seekSlider = document.getElementById('slider-seek');
    seekTrack = document.getElementById('track-seek');
    seekOverlay = document.getElementById('overlay-seek');
    seekThumb = document.getElementById('thumb-seek');

    mediaBar = document.getElementById('bar-media');

    playPauseBtn = document.getElementById('btn-play-pause');
    playPauseIcon = playPauseBtn.querySelector('#icon-play-pause > use');

    volumeBtn = document.getElementById('btn-volume');
    volumeIcon = volumeBtn.querySelector('#icon-volume > use');
    volumeSlider = document.getElementById('slider-volume');
    volumeSliderWidth = parseInt(style.getPropertyValue('--vslider-width'));
    volumeOverlay = document.getElementById('overlay-volume');
    volumeThumb = document.getElementById('thumb-volume');

    currentVideoTimeLabel = document.getElementById('time-label-current-video');
    currentVideoDurationLabel = document.getElementById('duration-label-current-video');

    playbackRateSlider = document.getElementById('slider-playback-rate');
    playbackRateSliderWidth = parseInt(style.getPropertyValue('--prslider-width'));
    playbackRateThumb = document.getElementById('thumb-playback-rate');
    playbackRateBtn = document.getElementById('btn-playback-rate');
    playbackRateLabel = document.getElementById('label-playback-rate');

    fullscreenBtn = document.getElementById('btn-fullscreen');
    fullscreenIcon = fullscreenBtn.querySelector('#icon-fullscreen > use');

    timelineSlider = document.getElementById('slider-timeline');
    timelineOverlay = document.getElementById('overlay-timeline');
    timelineThumb = document.getElementById('thumb-timeline');

    // settings section elements
    mostSettingFields = document.querySelectorAll(`.setting-field:not([name='capturesPath'])`);
    mostSettingToggleFields = document.querySelectorAll(`.setting-toggle-field:not([name='darkMode'])`);
    capturesPathSettingField = document.querySelector(`.setting-field[name='capturesPath']`);
    darkModeSettingToggleField = document.querySelector(`.setting-toggle-field[name='darkMode']`);

    // directories section elements
    capturesGallery = document.getElementById('gallery-captures');
    videoPreviewTemplate = document.querySelector('template');
    videoPreviewWidth = parseInt(style.getPropertyValue('--vthumbnail-height')) * 16 / 9 + 2 * parseInt(style.getPropertyValue('--vpctr-padding'));
    capturesLeftBtn = document.getElementById('left-btn-captures');
    capturesRightBtn = document.getElementById('right-btn-captures');

    // boolean flags
    flags = {
        videoLoaded: false, 
        timelineSliderDragging: false, 
        seekSliderDragging: false,
        previouslyPaused: false, 
        recording: false, 
        manualStop: false, 
        autoStart: false, 
        volumeSliderDragging: false, 
        playbackRateSliderDragging: false, 
        updateVolumeSlider: false, 
        updatePlaybackRateSlider: false 
    };

    // element boxes
    boxes = {
        timelineSliderBox: timelineSlider.getBoundingClientRect(),
        seekSliderBox: seekSlider.getBoundingClientRect(),
        galleryBox: capturesGallery.getBoundingClientRect(), 
        volumeSliderBox: volumeSlider.getBoundingClientRect(), 
        playbackRateSliderBox: playbackRateSlider.getBoundingClientRect()
    };

    // settings and videos data
    data = {
        settings: null, 
        videos: null 
    };

    // animationID, recording time, and timer interval
    state = {
        animationID: null, 
        generalStatusTimeout: null, 
        playbackContainerTimeout: null, 
        recordingTime: null, 
        timerInterval: null, 
        timeline: new TimelineState() 
     };
}