/**
 * Module for initializing the title bar for the renderer process
 * 
 * @module rendererTitleBar
 * @requires rendererVariables
 * @requires rendererGeneral
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, NAV_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, PLAYBACK_RATE_MAPPING, 
    TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_MIN_ZOOM, 
    MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, dirsBarIcon, stgsBarBtn, stgsBarIcon, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, recBarIcon, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwTemplate, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    volBarBtn, volBarIcon, volSldrCtr, volSldr, volSldrWidth, volOvrl, volThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, viewBarIcon, crtBarBtn, crtBarIcon, clipTglBtn, clipTglIcon, 
    mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
    mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolSldr, spkVolSldrWidth, spkVolOvrl, spkVolThumb, micStgFld, micVolSldr, micVolSldrWidth, micVolOvrl, micVolThumb, 
    boxes, data, flags, state, 
    initRendVars 
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';

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
    minBarBtn.addEventListener('click', window.windowAPI.minWindow);

    // on click, maximize the window
    maxBarBtn.addEventListener('click', window.windowAPI.maxWindow);

    // on click, save the cached volume data and close the window
    closeBarBtn.addEventListener('click', async () => {
        await Promise.all([atmpAsyncFunc(() => window.stgsAPI.setStg('volume', data['stgs']['volume'])), atmpAsyncFunc(() => window.stgsAPI.setStg('volumeMuted', data['stgs']['volumeMuted']))]);

        window.windowAPI.closeWindow();
    });
}