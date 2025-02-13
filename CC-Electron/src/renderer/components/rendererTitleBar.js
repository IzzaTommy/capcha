/**
 * Module for initializing the title bar for the renderer process
 * 
 * @module rendererTitleBar
 * @requires rendererVariables
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, DECIMAL_TRUNC, 
    NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, VIDEO_PREVIEW_AGE_LABEL_DELAY, 
    PLAYBACK_CONTAINER_GROW, PLAYBACK_CONTAINER_REDUCE, PLAYBACK_CONTAINER_TIMEOUT, 
    VIDEO_VOLUME_MIN, VIDEO_VOLUME_MAX, VIDEO_VOLUME_GROW, VIDEO_VOLUME_REDUCE, VIDEO_VOLUME_MUTED, 
    PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW, PLAYBACK_RATE_REDUCE, PLAYBACK_RATE_DEF, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_ZOOM_MIN, TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_OVERLAY_SUB_TICK_LINE_TOP, TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM, 
    TIMELINE_OVERLAY_TICK_LINE_TOP, TIMELINE_OVERLAY_TICK_LINE_BOTTOM, TIMELINE_OVERLAY_TICK_TEXT_TOP, TIMELINE_OVERLAY_TICK_TEXT_OFFSET, CLIP_LENGTH_MIN, 
    SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, SPEAKER_VOLUME_GROW, SPEAKER_VOLUME_REDUCE, 
    MICROPHONE_VOLUME_GROW, MICROPHONE_VOLUME_REDUCE, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, stgsBarBtn, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltFld, capsMetaFltFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltFld, clipsMetaFltFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwCtrTmpl, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    editGameLabel, videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrWidth, videoVolOvrl, videoVolThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
    mostTglSwtes, darkModeTglFld, darkModeTglIcon, 
    mostFlds, capsDirFld, capsLimitFld, capsDispFld, progsBoard, genStgTileTmpl, progsAddBtn, clipsDirFld, clipsLimitFld, clipsFrmFlds, clipsWidthFlds, clipsHeightFlds, 
    spkFld, spkVolSldrCtr, spkVolSldr, spkVolOvrl, spkVolThumb, micFld, micVolSldrCtr, micVolSldr, micVolOvrl, micVolThumb, 
    boxes, data, flags, states, 
    initRendVars 
} from './rendererVariables.js';

/**
 * @exports initRendTitleBar
 */
export { initRendTitleBar };

/**
 * Initializes the title bar
 */
function initRendTitleBar() {
    initTitleBarBtnEL();
}

/**
 * Initializes the title bar button event listeners
 */
function initTitleBarBtnEL() {
    // on click, minimize the window
    minBarBtn.addEventListener('click', window['genAPI'].minWindow);

    // on click, maximize the window
    maxBarBtn.addEventListener('click', window['genAPI'].maxWindow);

    // on click, save the cached video volume data and close the window
    closeBarBtn.addEventListener('click', window['genAPI'].closeWindow);
}