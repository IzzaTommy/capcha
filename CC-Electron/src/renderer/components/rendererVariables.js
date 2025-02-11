/**
 * Module for initializing the variables for the renderer process
 * 
 * @module rendererVariables
 * @requires timelineState
 */
import { TimelineState } from './timelineState.js';

/**
 * @exports CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, DECIMAL_TRUNC, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, SPEAKER_VOLUME_GROW, SPEAKER_VOLUME_REDUCE, 
 *  MICROPHONE_VOLUME_GROW, MICROPHONE_VOLUME_REDUCE, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
 *  NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, 
 *  PLAYBACK_CONTAINER_GROW, PLAYBACK_CONTAINER_REDUCE, PLAYBACK_CONTAINER_TIMEOUT, 
 *  VIDEO_VOLUME_MIN, VIDEO_VOLUME_MAX, VIDEO_VOLUME_GROW, VIDEO_VOLUME_REDUCE, VIDEO_VOLUME_MUTED, 
 *  PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW, PLAYBACK_RATE_REDUCE, PLAYBACK_RATE_DEF, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
 *  TIMELINE_ZOOM_MIN, TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_OVERLAY_SUB_TICK_LINE_TOP, TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM, 
 *  TIMELINE_OVERLAY_TICK_LINE_TOP, TIMELINE_OVERLAY_TICK_LINE_BOTTOM, TIMELINE_OVERLAY_TICK_TEXT_TOP, TIMELINE_OVERLAY_TICK_TEXT_OFFSET, CLIP_LENGTH_MIN, 
 *  MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
 *  ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
 *  html, 
 *  initOvrl, initStatLabel, 
 *  titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
 *  navBar, dirsBarBtn, stgsBarBtn, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, autoRecResLabel, 
 *  navTglBtn, navTglIcon, 
 *  contStatLabel, dirsSect, editSect, stgsSect, 
 *  capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
 *  clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
 *  videoPrvwTmpl, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
 *  editGameLabel, videoCtr, videoPlr, playPauseStatIcon, 
 *  plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
 *  mediaBar, playPauseBarBtn, playPauseBarIcon, 
 *  videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrWidth, videoVolOvrl, videoVolThumb, 
 *  curVideoTimeLabel, curVideoDurLabel, 
 *  plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
 *  fscBarBtn, fscBarIcon, 
 *  tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
 *  clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
 *  mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
 *  mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
 *  spkStgFld, spkVolStgSldrCtr, spkVolStgSldr, spkVolStgOvrl, spkVolStgThumb, micStgFld, micVolStgSldrCtr, micVolStgSldr, micVolStgOvrl, micVolStgThumb, 
 *  boxes, data, flags, states, 
 *  initRendVars 
 */
export {
    CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, DECIMAL_TRUNC, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, SPEAKER_VOLUME_GROW, SPEAKER_VOLUME_REDUCE, 
    MICROPHONE_VOLUME_GROW, MICROPHONE_VOLUME_REDUCE, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, 
    PLAYBACK_CONTAINER_GROW, PLAYBACK_CONTAINER_REDUCE, PLAYBACK_CONTAINER_TIMEOUT, 
    VIDEO_VOLUME_MIN, VIDEO_VOLUME_MAX, VIDEO_VOLUME_GROW, VIDEO_VOLUME_REDUCE, VIDEO_VOLUME_MUTED, 
    PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW, PLAYBACK_RATE_REDUCE, PLAYBACK_RATE_DEF, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_ZOOM_MIN, TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_OVERLAY_SUB_TICK_LINE_TOP, TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM, 
    TIMELINE_OVERLAY_TICK_LINE_TOP, TIMELINE_OVERLAY_TICK_LINE_BOTTOM, TIMELINE_OVERLAY_TICK_TEXT_TOP, TIMELINE_OVERLAY_TICK_TEXT_OFFSET, CLIP_LENGTH_MIN, 
    MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, stgsBarBtn, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwTmpl, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    editGameLabel, videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrWidth, videoVolOvrl, videoVolThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
    mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
    mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolStgSldrCtr, spkVolStgSldr, spkVolStgOvrl, spkVolStgThumb, micStgFld, micVolStgSldrCtr, micVolStgSldr, micVolStgOvrl, micVolStgThumb, 
    boxes, data, flags, states, 
    initRendVars 
};

// unexported
const STYLE = getComputedStyle(document.documentElement);

// timeout, padding function, decimal places for truncation
const CONTENT_STATUS_LABEL_TIMEOUT = 5000;
const TIME_PAD = (time) => time.toString().padStart(2, '0');
const DECIMAL_TRUNC = 6;

// speaker and microphone volume min max
const SPEAKER_VOLUME_MIN = 0;
const SPEAKER_VOLUME_MAX = 1;
const SPEAKER_VOLUME_GROW = 0.05;
const SPEAKER_VOLUME_REDUCE = 0.05
const MICROPHONE_VOLUME_MIN = 0;
const MICROPHONE_VOLUME_MAX = 1;
const MICROPHONE_VOLUME_GROW = 0.05;
const MICROPHONE_VOLUME_REDUCE = 0.05

// navigation bar timeout
const NAVIGATION_BAR_TIMEOUT = 500;

// gallery gap and sizing
const BYTES_IN_GIGABYTE = 1073741824;
const GALLERY_MIN_GAP = 5;

// grow reduce values and timeout
const PLAYBACK_CONTAINER_GROW = 5;
const PLAYBACK_CONTAINER_REDUCE = 5;
const PLAYBACK_CONTAINER_TIMEOUT = 3000;

// video volume min max, grow reduce values, and muted value
const VIDEO_VOLUME_MIN = 0;
const VIDEO_VOLUME_MAX = 1;
const VIDEO_VOLUME_GROW = 0.05;
const VIDEO_VOLUME_REDUCE = 0.05
const VIDEO_VOLUME_MUTED = 0.1;

// playback rate min max, grow reduce values, default, number of segments, mapping, offset in mapping
const PLAYBACK_RATE_MIN = -2;
const PLAYBACK_RATE_MAX = 4;
const PLAYBACK_RATE_GROW = 1;
const PLAYBACK_RATE_REDUCE = 1;
const PLAYBACK_RATE_DEF = 1;
const PLAYBACK_RATE_SEGMENTS = 6;
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
const PLAYBACK_RATE_MAPPING_OFFSET = 2;

// timeline zoom min, grow reduce factors
const TIMELINE_ZOOM_MIN = 30;
const TIMELINE_GROW_FACTOR = 0.15;
const TIMELINE_REDUCE_FACTOR = 0.1;
const TIMELINE_OVERLAY_SUB_TICK_LINE_TOP = 15;
const TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM = 30;
const TIMELINE_OVERLAY_TICK_LINE_TOP = 10;
const TIMELINE_OVERLAY_TICK_LINE_BOTTOM = 50;
const TIMELINE_OVERLAY_TICK_TEXT_TOP = 45;
const TIMELINE_OVERLAY_TICK_TEXT_OFFSET = 5;

// clip length min
const CLIP_LENGTH_MIN = 5;

// timings
const MSECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;

// asynchronous function attempts and delay
const ASYNC_ATTEMPTS = 3;
const ASYNC_DELAY_IN_MSECONDS = 3000;

// document elements
let html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, stgsBarBtn, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwTmpl, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    editGameLabel, videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrWidth, videoVolOvrl, videoVolThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
    mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
    mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolStgSldrCtr, spkVolStgSldr, spkVolStgOvrl, spkVolStgThumb, micStgFld, micVolStgSldrCtr, micVolStgSldr, micVolStgOvrl, micVolStgThumb, 
    boxes, data, flags, states

/**
 * Initializes the variables
 */
function initRendVars() {
    // html element
    html = document.querySelector('html');

    // initialization elements
    initOvrl = document.getElementById('overlay-initialization');
    initStatLabel = document.getElementById('status-label-initialization');

    // title bar elements
    titleBar = document.getElementById('bar-title');

    minBarBtn = document.getElementById('bar-btn-minimize');
    maxBarBtn = document.getElementById('bar-btn-maximize');
    closeBarBtn = document.getElementById('bar-btn-close');

    // navigation block elements
    navBar = document.getElementById('bar-nav');

    dirsBarBtn = document.getElementById('bar-btn-directories');

    stgsBarBtn = document.getElementById('bar-btn-settings');

    curRecLabelCtr = document.getElementById('label-ctr-current-recording');
    curRecTimeLabel = document.getElementById('time-label-current-recording');
    curRecGameLabel = document.getElementById('game-label-current-recording');

    recBarBtn = document.getElementById('bar-btn-record');

    autoRecResLabel = document.getElementById('resume-label-auto-record');

    navTglBtn = document.getElementById('toggle-btn-nav');
    navTglIcon = document.querySelector('#toggle-icon-nav > use');

    // content block elements
    contStatLabel = document.getElementById('status-label-content');

    dirsSect = document.getElementById('section-directories');
    editSect = document.getElementById('section-editor');
    stgsSect = document.getElementById('section-settings');

    // directories section elements
    capsNameLabel = document.getElementById('name-label-captures');

    capsDirLabel2 = document.getElementById('directory-label2-captures');
    capsUsageLabel3 = document.getElementById('usage-label3-captures');
    capsTotalLabel3 = document.getElementById('total-label3-captures');

    capsGameFltDirStgFld = document.querySelector(`.directory-setting-field[name='capturesGameFilter']`);
    capsMetaFltDirStgFld = document.querySelector(`.directory-setting-field[name='capturesMetaFilter']`);

    capsBarBtn = document.getElementById('bar-btn-captures');
    capsBarIcon = document.querySelector('#bar-icon-captures > use');

    clipsNameLabel = document.getElementById('name-label-clips');

    clipsDirLabel2 = document.getElementById('directory-label2-clips');
    clipsUsageLabel3 = document.getElementById('usage-label3-clips');
    clipsTotalLabel3 = document.getElementById('total-label3-clips');

    clipsGameFltDirStgFld = document.querySelector(`.directory-setting-field[name='clipsGameFilter']`);
    clipsMetaFltDirStgFld = document.querySelector(`.directory-setting-field[name='clipsMetaFilter']`);
    
    clipsBarBtn = document.getElementById('bar-btn-clips');
    clipsBarIcon = document.querySelector('#bar-icon-clips > use');

    videoPrvwTmpl = document.getElementById('template-video-preview');
    videoPrvwCtrWidth = parseInt(STYLE.getPropertyValue('--vtnimage-height')) * 16 / 9 + 2 * parseInt(STYLE.getPropertyValue('--vpctr-padding'));

    capsLeftBtn = document.getElementById('left-btn-captures');
    capsGall = document.getElementById('gallery-captures');
    capsStatLabel = document.getElementById('status-label-captures');
    capsRightBtn = document.getElementById('right-btn-captures');

    clipsLeftBtn = document.getElementById('left-btn-clips');
    clipsGall = document.getElementById('gallery-clips');
    clipsStatLabel = document.getElementById('status-label-clips');
    clipsRightBtn = document.getElementById('right-btn-clips');

    // editor section elements
    editGameLabel = document.getElementById('game-label-editor');

    videoCtr = document.getElementById('ctr-video');

    videoPlr = document.getElementById('player-video');
    playPauseStatIcon = document.getElementById('status-icon-play-pause');

    plbkCtr = document.getElementById('ctr-playback');

    seekSldr = document.getElementById('slider-seek');
    seekTrack = document.getElementById('track-seek');
    seekOvrl = document.getElementById('overlay-seek');
    seekThumb = document.getElementById('thumb-seek');

    mediaBar = document.getElementById('bar-media');

    playPauseBarBtn = document.getElementById('bar-btn-play-pause');
    playPauseBarIcon = playPauseBarBtn.querySelector('#bar-icon-play-pause > use');

    videoVolBarBtn = document.getElementById('bar-btn-video-volume');
    videoVolBarIcon = videoVolBarBtn.querySelector('#bar-icon-video-volume > use');

    videoVolSldrCtr = document.getElementById('slider-ctr-video-volume');
    videoVolSldr = document.getElementById('slider-video-volume');
    videoVolSldrWidth = parseInt(STYLE.getPropertyValue('--vvoslider-width'));
    videoVolOvrl = document.getElementById('overlay-video-volume');
    videoVolThumb = document.getElementById('thumb-video-volume');

    curVideoTimeLabel = document.getElementById('time-label-current-video');
    curVideoDurLabel = document.getElementById('duration-label-current-video');

    plbkRateSldrCtr = document.getElementById('slider-ctr-playback-rate');
    plbkRateSldr = document.getElementById('slider-playback-rate');
    plbkRateSldrWidth = parseInt(STYLE.getPropertyValue('--pbrtslider-width'));
    plbkRateThumb = document.getElementById('thumb-playback-rate');

    plbkRateBarBtn = document.getElementById('bar-btn-playback-rate');
    plbkRateValueLabel = document.getElementById('value-label-playback-rate');

    fscBarBtn = document.getElementById('bar-btn-fullscreen');
    fscBarIcon = fscBarBtn.querySelector('#bar-icon-fullscreen > use');

    tmlnSldr = document.getElementById('slider-timeline');
    tmlnOvrl = document.getElementById('overlay-timeline');
    tmlnThumb = document.getElementById('thumb-timeline');
    clipLeftThumb = document.getElementById('left-thumb-clip');
    clipRightThumb = document.getElementById('right-thumb-clip'); 

    clipBar = document.getElementById('bar-clip');

    viewBarBtn = document.getElementById('bar-btn-view');

    createBarBtn = document.getElementById('bar-btn-create');
    
    clipTglBtn = document.getElementById('toggle-btn-clip');
    clipTglIcon = document.querySelector('#toggle-icon-clip > use');

    // settings section elements
    mostStgTglSwtes = document.querySelectorAll(`.general-setting-toggle-switch:not(:has(> .general-setting-toggle-field[name='darkMode']))`);

    darkModeStgTglFld = document.querySelector(`.general-setting-toggle-field[name='darkMode']`);
    darkModeStgTglIcon = document.querySelector(`.general-setting-toggle-field[name='darkMode'] + .general-setting-toggle-icon > use`);

    mostStgFlds = document.querySelectorAll(`.general-setting-field:not([name='capturesDirectory']):not([name='capturesLimit']):not([name='capturesDisplay']):not([name='clipsDirectory']):not([name='clipsLimit']):not([name='clipsFormat']):not([name='clipsWidth']):not([name='clipsHeight']):not([name='speaker']):not([name='microphone'])`);

    capsDirStgFld = document.querySelector(`.general-setting-field[name='capturesDirectory']`);
    capsLimitStgFld = document.querySelector(`.general-setting-field[name='capturesLimit']`);
    capsDispStgFld = document.querySelector(`.general-setting-field[name='capturesDisplay']`);

    clipsDirStgFld = document.querySelector(`.general-setting-field[name='clipsDirectory']`);
    clipsLimitStgFld = document.querySelector(`[name='clipsLimit']`);

    clipsFrmStgFlds = document.querySelectorAll(`[name='clipsFormat']`);
    clipsWidthStgFlds = document.querySelectorAll(`[name='clipsWidth']`);
    clipsHeightStgFlds = document.querySelectorAll(`[name='clipsHeight']`);

    spkStgFld = document.querySelector(`.general-setting-field[name='speaker']`);

    spkVolStgSldrCtr = document.getElementById('setting-slider-ctr-speaker-volume');
    spkVolStgSldr = document.getElementById('setting-slider-speaker-volume');
    spkVolStgOvrl = document.getElementById('setting-overlay-speaker-volume');
    spkVolStgThumb = document.getElementById('setting-thumb-speaker-volume');

    micStgFld = document.querySelector(`.general-setting-field[name='microphone']`);

    micVolStgSldrCtr = document.getElementById('setting-slider-ctr-microphone-volume');
    micVolStgSldr = document.getElementById('setting-slider-microphone-volume');
    micVolStgOvrl = document.getElementById('setting-overlay-microphone-volume');
    micVolStgThumb = document.getElementById('setting-thumb-microphone-volume');

    // element boxes
    boxes = {
        capsGallBox: capsGall.getBoundingClientRect(), 
        clipsGallBox: clipsGall.getBoundingClientRect(), 
        seekSldrBox: seekSldr.getBoundingClientRect(),
        videoVolSldrBox: videoVolSldr.getBoundingClientRect(), 
        plbkRateSldrBox: plbkRateSldr.getBoundingClientRect(), 
        tmlnSldrBox: tmlnSldr.getBoundingClientRect(), 
        spkVolStgSldrBox: spkVolStgSldr.getBoundingClientRect(), 
        micVolStgSldrBox: micVolStgSldr.getBoundingClientRect() 
    };

    // video/setting/display/device data
    data = {
        caps: null, 
        clips: null, 
        stgs: null, 
        disps: null, 
        devs: null
    };

    // boolean flags
    flags = {
        isRec: false, 
        isAutoStart: false, 
        isManualStop: false, 
        isVideoLoaded: false, 
        isVideoPlrHover: false, 
        isPrevPaused: false, 
        isPlbkCtrHover: false, 
        isSeekSldrDrag: false, 
        isVideoVolBarBtnHover: false, 
        isVideoVolSldrCtrHover: false, 
        isVideoVolSldrDrag: false, 
        isPlbkRateBarBtnHover: false, 
        isPlbkRateSldrCtrHover: false, 
        isPlbkRateSldrDrag: false, 
        isTmlnSldrDrag: false, 
        isClipLeftThumbDrag: false, 
        isClipRightThumbDrag: false, 
        isSpkVolStgSldrCtrHover: false, 
        isSpkVolStgSldrDrag: false, 
        isMicVolStgSldrCtrHover: false, 
        isMicVolStgSldrDrag: false 
    };

    // states data
    states = {
        recTime: null, 
        contStatLabelTmo: null, 
        videoFrameLen: null, 
        animID: null, 
        plbkCtrTmo: null, 
        recTimeIntv: null, 
        tmln: new TimelineState() 
    };
}