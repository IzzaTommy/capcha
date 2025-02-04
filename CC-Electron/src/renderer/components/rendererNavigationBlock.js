/**
 * Module for initializing the navigation block for the renderer process
 * 
 * @module rendererNavigationBlock
 * @requires rendererVariables
 * @requires rendererGeneral
 * @requires rendererDirectoriesSection
 * @requires rendererEditorSection
 * @requires rendererSettingsSection
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
import { initRendDirsSect, loadGall, updateGall } from './rendererDirectoriesSection.js';
import { initRendEditSect, setVideoPlayerState, setSeekSldr, setSeekTrack, setSeekOvrl, setSeekThumb, updateSeekSldr, setVolSldr, setVolOvrl, setVolThumb, updateVolSldr, setPlbkRateSldr, setPlbkRateThumb, updatePlbkRateSldr, setTmlnSldr, setTmlnOvrl, setTmlnThumb, updateTmlnSldr, setClipLeftThumb, setClipRightThumb, syncSeekTmlnSldrs } from './rendererEditorSection.js';
import { initRendStgsSect, setSpkVolSldr, setSpkVolOvrl, setSpkVolThumb, updateSpkVolSldr, setMicVolSldr, setMicVolOvrl, setMicVolThumb, updateMicVolSldr } from './rendererSettingsSection.js';

/**
 * @exports initRendNavBlock, togRecBarBtn
 */
export { initRendNavBlock, togRecBarBtn };

/**
 * Initializes the navigation block
 */
function initRendNavBlock() {
    initNavBarBtnEL();

    initNavTogBtnEL();
    initNavTogBtn();
}

/**
 * Initializes the navigation button event listeners
 */
function initNavBarBtnEL() {
    // on click, change the active content section to the directories section
    dirsBarBtn.addEventListener('click', () => setActiveSect('directories'));

    // on click, change the active content section to the settings section
    stgsBarBtn.addEventListener('click', () => setActiveSect('settings'));

    // on click, toggle the recording
    recBarBtn.addEventListener('click', async () => await atmpAsyncFunc(() => togRecBarBtn(false, true, 'MANUAL')));  // boolean1 isAutoStart, boolean2 isManualStop

    // on click, reallow auto recording if it is enabled
    autoRecResLabel.addEventListener('click', () => {
        autoRecResLabel.classList.remove('active');

        flags['isManualStop'] = false;
     });
}

/**
 * Initializes the nav toggle button event listener
 */
function initNavTogBtnEL() {
    // on click, change the nav bar state
    navTglBtn.addEventListener('click', async () => {
        // toggle the nav bar
        navBar.classList.toggle('active');

        // hide the auto recording resume label before the nav bar transition begins
        autoRecResLabel.classList.remove('active');

        // change the toggle icon and save the setting, depending on if the nav bar is active
        if (navBar.classList.contains('active')) {
            setIcon(navTglIcon, 'arrow-back-ios');
            data['stgs']['navigationBarActive'] = await atmpAsyncFunc(() => window.stgsAPI.setStg('navigationBarActive', true));  // boolean1 value
        }
        else {
            setIcon(navTglIcon, 'arrow-forward-ios');
            data['stgs']['navigationBarActive'] = await atmpAsyncFunc(() => window.stgsAPI.setStg('navigationBarActive', false));  // boolean1 value
        }
        
        // update all width dependent elements after the nav bar transition finishes
        atmpAsyncFunc(() => new Promise(resolve => setTimeout(() => { 
            updateGall(true);  // boolean1 isCaptures
            updateGall(false);

            updateSeekSldr();
            updatePlbkRateSldr();
            updateVolSldr();
            updateTmlnSldr();

            updateSpkVolSldr();
            updateMicVolSldr();

            // not width dependent, but transition dependent, show after the nav bar finishes transition
            autoRecResLabel.classList.add('active');

            resolve();
        }, NAV_BAR_TIMEOUT)));
    });
}

/**
 * Initializes the nav toggle button
 */
async function initNavTogBtn() {
    // toggle the nav bar and change the icon, depending on setting
    if (data['stgs']['navigationBarActive'] === true) {
        navBar.classList.add('active');
        setIcon(navTglIcon, 'arrow-back-ios');
    }

    // update all width dependent elements after the nav bar transition finishes
    await atmpAsyncFunc(() => new Promise(resolve => setTimeout(() => { 
        updateGall(true);  // boolean1 isCaps
        updateGall(false);  // boolean1 isCaps

        updateSeekSldr();
        updateVolSldr();
        updatePlbkRateSldr();
        updateTmlnSldr();
        
        updateSpkVolSldr();
        updateMicVolSldr();

        resolve();
    }, NAV_BAR_TIMEOUT)));
}

/**
 * Toggles the recording on or off
 * 
 * @param {boolean} isAutoStart - if function is called by the main process by the auto recording process
 * @param {boolean} isManualStop - if function is called by record button click by the user
 */
async function togRecBarBtn(isAutoStart, isManualStop, recordingGame) {
    // check if recording is in progress
    if (flags['isRec']) {
        // check if it was a (manual start / manual stop) or (auto start / auto stop) or (auto start / manual stop)
        if ((!flags['isAutoStart'] && isManualStop) || (flags['isAutoStart'] && !isManualStop) || (flags['isAutoStart'] && isManualStop)) {
            // stop recording
            if (await atmpAsyncFunc(() => window.webSocketAPI.stopRecord())) {
                // hide the record button and the recording label container
                recBarBtn.classList.remove('active');
                curRecLabelCtr.classList.remove('active');

                // check if auto record is on and the recording was manually stopped
                if (isManualStop && data['stgs']['autoRec']) {
                    // show to let the user reenable auto recording
                    autoRecResLabel.classList.add('active');
                }

                // clear the recording time label interval
                clearInterval(state['recTimeIntv']);

                // set the manual stop and recording flags
                flags['isManualStop'] = isManualStop;
                flags['isRec'] = false;

                // reload the captures gallery for the new video
                await atmpAsyncFunc(() => loadGall(true, false));
            }
        }
    }
    else {
        // check if it was an (auto start / with no manual stop) or if it was a (manual start)
        if ((isAutoStart && !flags['isManualStop']) || !isAutoStart) {
            if (await atmpAsyncFunc(() => window.webSocketAPI.startRecord(recordingGame))) {
                // show the record button and the recording label container
                recBarBtn.classList.add('active');
                curRecLabelCtr.classList.add('active');

                // set the recording game
                curRecGameLabel.textContent = recordingGame;

                // set auto start and recording flags
                flags['isAutoStart'] = isAutoStart;
                flags['isRec'] = true;

                // restart the recording time and set the recording time label interval to update the timer
                state['recTime'] = 0;
                curRecTimeLabel.textContent = getRdblRecDur(state['recTime']);
                
                state['recTimeIntv'] = setInterval(() => {
                    state['recTime']++;
                    curRecTimeLabel.textContent = getRdblRecDur(state['recTime']);
                }, MSECONDS_IN_SECOND);
            }
        }
    }
}