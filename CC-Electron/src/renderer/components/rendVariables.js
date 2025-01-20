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
 *  videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesStatusLabel, capturesRightBtn, clipsGallery, clipsLeftBtn, clipsStatusLabel, clipsRightBtn, 
 *  videoContainer, videoPlayer, playPauseOverlayIcon, 
 *  playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
 *  mediaBar, playPauseBtn, playPauseIcon, 
 *  volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
 *  currentVideoTimeLabel, currentVideoDurationLabel, 
 *  playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
 *  fullscreenBtn, fullscreenIcon, 
 *  timelineSlider, timelineOverlay, timelineThumb, timeline, clipLeftThumb, clipRightThumb, 
 *  mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, capturesDisplaySettingField, 
 *  speakerSettingField, speakerVolumeSlider, speakerVolumeSliderWidth, speakerVolumeOverlay, speakerVolumeThumb, microphoneSettingField, microphoneVolumeSlider, microphoneVolumeSliderWidth, microphoneVolumeOverlay, microphoneVolumeThumb, 
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
    videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesStatusLabel, capturesRightBtn, clipsGallery, clipsLeftBtn, clipsStatusLabel, clipsRightBtn, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, clipLeftThumb, clipRightThumb, 
    clipBar, clipViewBtn, clipViewIcon, clipCreateBtn, clipCreateIcon, clipToggleBtn, clipToggleIcon, 
    mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, capturesDisplaySettingField, 
    speakerSettingField, speakerVolumeSlider, speakerVolumeSliderWidth, speakerVolumeOverlay, speakerVolumeThumb, microphoneSettingField, microphoneVolumeSlider, microphoneVolumeSliderWidth, microphoneVolumeOverlay, microphoneVolumeThumb, 
    flags, boxes, 
    data, state, 
    initRendVariables 
};

// order of variables
// timeline, time, mapping, and style
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
    videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesStatusLabel, capturesRightBtn,  clipsGallery, clipsLeftBtn, clipsStatusLabel, clipsRightBtn, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, clipLeftThumb, clipRightThumb, 
    clipBar, clipViewBtn, clipViewIcon, clipCreateBtn, clipCreateIcon, clipToggleBtn, clipToggleIcon, 
    mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, capturesDisplaySettingField, 
    speakerSettingField, speakerVolumeSlider, speakerVolumeSliderWidth, speakerVolumeOverlay, speakerVolumeThumb, microphoneSettingField, microphoneVolumeSlider, microphoneVolumeSliderWidth, microphoneVolumeOverlay, microphoneVolumeThumb 

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
    minimizeBtn = document.getElementById('bar-btn-minimize');
    maximizeBtn = document.getElementById('bar-btn-maximize');
    closeBtn = document.getElementById('bar-btn-close');

    // nav block elements
    navBar = document.getElementById('bar-nav');

    directoriesBtn = document.getElementById('bar-btn-directories');
    directoriesIcon = document.querySelector('#bar-icon-directories > use');

    settingsBtn = document.getElementById('bar-btn-settings');
    settingsIcon = document.querySelector('#bar-icon-settings > use');

    currentRecordingLabelContainer = document.getElementById('label-ctr-current-recording');
    currentRecordingTimeLabel = document.getElementById('time-label-current-recording');
    currentRecordingGameLabel = document.getElementById('game-label-current-recording');

    recordBtn = document.getElementById('bar-btn-record');
    recordIcon = document.querySelector('#bar-icon-record > use');

    autoRecordResumeLabel = document.getElementById('resume-label-auto-record');

    navToggleBtn = document.getElementById('toggle-btn-nav');
    navToggleIcon = document.querySelector('#toggle-icon-nav > use');

    // content block elements
    generalStatusLabel = document.getElementById('status-label-content');

    directoriesSection = document.getElementById('section-directories');
    editorSection = document.getElementById('section-editor');
    settingsSection = document.getElementById('section-settings');

    // directories section elements
    videoPreviewTemplate = document.querySelector('template');
    videoPreviewWidth = parseInt(style.getPropertyValue('--vtnimage-height')) * 16 / 9 + 2 * parseInt(style.getPropertyValue('--vpctr-padding'));
    capturesGallery = document.getElementById('gallery-captures');
    capturesLeftBtn = document.getElementById('left-btn-captures');
    capturesStatusLabel = document.getElementById('status-label-captures');
    capturesRightBtn = document.getElementById('right-btn-captures');
    clipsGallery = document.getElementById('gallery-clips');
    clipsLeftBtn = document.getElementById('left-btn-clips');
    clipsStatusLabel = document.getElementById('status-label-clips');
    clipsRightBtn = document.getElementById('right-btn-clips');

    // editor section elements
    videoContainer = document.getElementById('ctr-video');

    videoPlayer = document.getElementById('player-video');

    /////////////////////////////
    playPauseOverlayIcon = document.getElementById('status-icon-play-pause');

    playbackContainer = document.getElementById('ctr-playback');

    seekSlider = document.getElementById('slider-seek');
    seekTrack = document.getElementById('track-seek');
    seekOverlay = document.getElementById('overlay-seek');
    seekThumb = document.getElementById('thumb-seek');

    mediaBar = document.getElementById('bar-media');

    playPauseBtn = document.getElementById('bar-btn-play-pause');
    playPauseIcon = playPauseBtn.querySelector('#bar-icon-play-pause > use');

    volumeBtn = document.getElementById('bar-btn-volume');
    volumeIcon = volumeBtn.querySelector('#bar-icon-volume > use');
    volumeSlider = document.getElementById('slider-volume');
    volumeSliderWidth = parseInt(style.getPropertyValue('--voslider-width'));
    volumeOverlay = document.getElementById('overlay-volume');
    volumeThumb = document.getElementById('thumb-volume');

    currentVideoTimeLabel = document.getElementById('time-label-current-video');
    currentVideoDurationLabel = document.getElementById('duration-label-current-video');

    playbackRateSlider = document.getElementById('slider-playback-rate');
    playbackRateSliderWidth = parseInt(style.getPropertyValue('--pbrtslider-width'));
    playbackRateThumb = document.getElementById('thumb-playback-rate');
    playbackRateBtn = document.getElementById('bar-btn-playback-rate');
    ///////////////////////////////////////////
    playbackRateLabel = document.getElementById('value-label-playback-rate');

    fullscreenBtn = document.getElementById('bar-btn-fullscreen');
    fullscreenIcon = fullscreenBtn.querySelector('#bar-icon-fullscreen > use');

    timelineSlider = document.getElementById('slider-timeline');
    timelineOverlay = document.getElementById('overlay-timeline');
    timelineThumb = document.getElementById('thumb-timeline');
    clipLeftThumb = document.getElementById('left-thumb-clip');
    clipRightThumb = document.getElementById('right-thumb-clip'); 

    clipBar = document.getElementById('bar-clip');
    ////////////////////////////////////////////
    clipViewBtn = document.getElementById('view-bar-btn-clip');
    clipViewIcon = document.querySelector('#view-bar-icon-clip > use');
    clipCreateBtn = document.getElementById('create-bar-btn-clip');
    clipCreateIcon = document.querySelector('#create-bar-icon-clip > use');
    
    clipToggleBtn = document.getElementById('toggle-btn-clip');
    clipToggleIcon = document.querySelector('#toggle-icon-clip > use');

    // settings section elements
    /////////////////////////////////////
    mostSettingFields = document.querySelectorAll(`.general-setting-field:not([name='capturesPath']):not([name='clipsPath']):not([name='clipsFormat']):not([name='clipsWidth']):not([name='clipsHeight']):not([name='capturesDisplay']):not([name='speaker']):not([name='microphone'])`);

    clipsFormatSettingFields = document.querySelectorAll(`[name='clipsFormat']`);
    clipsWidthSettingFields = document.querySelectorAll(`[name='clipsWidth']`);
    clipsHeightSettingFields = document.querySelectorAll(`[name='clipsHeight']`);

    mostSettingToggleSwitches = document.querySelectorAll(`.general-setting-toggle-switch:not(:has(> .general-setting-toggle-field[name='darkMode']))`);

    capturesPathSettingField = document.querySelector(`.general-setting-field[name='capturesPath']`);
    clipsPathSettingField = document.querySelector(`.general-setting-field[name='clipsPath']`);

    darkModeSettingToggleField = document.querySelector(`.general-setting-toggle-field[name='darkMode']`);
    darkModeSettingToggleIcon = document.querySelector(`.general-setting-toggle-field[name='darkMode'] + .general-setting-toggle-icon > use`);

    capturesDisplaySettingField = document.querySelector(`.general-setting-field[name='capturesDisplay']`);
//////////////////////////////////
    speakerSettingField = document.querySelector(`.general-setting-field[name='speaker']`);
    speakerVolumeSlider = document.getElementById('slider-speaker-volume');
    speakerVolumeSliderWidth = parseInt(style.getPropertyValue('--gstslider-width'));
    speakerVolumeOverlay = document.getElementById('overlay-speaker-volume');
    speakerVolumeThumb = document.getElementById('thumb-speaker-volume');
//////////////////////////////
    microphoneSettingField = document.querySelector(`.general-setting-field[name='microphone']`);
    microphoneVolumeSlider = document.getElementById('slider-microphone-volume');
    microphoneVolumeSliderWidth = parseInt(style.getPropertyValue('--gstslider-width'));
    microphoneVolumeOverlay = document.getElementById('overlay-microphone-volume');
    microphoneVolumeThumb = document.getElementById('thumb-microphone-volume');

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
        updatePlaybackRateSlider: false, 
        clipLeftThumbDragging: false, 
        clipRightThumbDragging: false, 
        speakerVolumeSliderDragging: false, 
        microphoneVolumeSliderDragging: false 
    };

    // element boxes
    boxes = {
        timelineSliderBox: timelineSlider.getBoundingClientRect(),
        seekSliderBox: seekSlider.getBoundingClientRect(),
        capturesGalleryBox: capturesGallery.getBoundingClientRect(), 
        clipsGalleryBox: clipsGallery.getBoundingClientRect(), 
        volumeSliderBox: volumeSlider.getBoundingClientRect(), 
        playbackRateSliderBox: playbackRateSlider.getBoundingClientRect(), 
        speakerVolumeSliderBox: speakerVolumeSlider.getBoundingClientRect(), 
        microphoneVolumeSliderBox: microphoneVolumeSlider.getBoundingClientRect() 
    };

    // settings and videos data
    data = {
        settings: null, 
        captures: null, 
        clips: null, 
        devices: null, 
        displays: null
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