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
    CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, 
    PLAYBACK_CONTAINER_GROW_VALUE, PLAYBACK_CONTAINER_REDUCE_VALUE, PLAYBACK_CONTAINER_TIMEOUT, 
    VOLUME_MIN, VOLUME_MAX, VOLUME_GROW_VALUE, VOLUME_REDUCE_VALUE, VOLUME_MUTED, 
    PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_DEF, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_ZOOM_MIN, TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, CLIP_LENGTH_MIN, 
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
    videoPrvwTemplate, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    volBarBtn, volBarIcon, volSldrCtr, volSldr, volSldrWidth, volOvrl, volThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
    mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
    mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolSldr, spkVolSldrWidth, spkVolOvrl, spkVolThumb, micStgFld, micVolSldr, micVolSldrWidth, micVolOvrl, micVolThumb, 
    boxes, data, flags, states, 
    initRendVars 
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, getModBox, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
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
 * Initializes the navigation bar button event listeners
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
 * Initializes the navigation toggle button event listener
 */
function initNavTogBtnEL() {
    // on click, change the navigation bar state
    navTglBtn.addEventListener('click', async () => {
        // toggle the navigation bar
        navBar.classList.toggle('active');

        // hide the auto recording resume label before the navigation bar transition begins
        autoRecResLabel.classList.remove('active');

        // change the toggle icon and save the setting, depending on if the navigation bar is active
        if (navBar.classList.contains('active')) {
            setIcon(navTglIcon, 'arrow-back-ios');
            data['stgs']['navigationBarActive'] = await atmpAsyncFunc(() => window['stgsAPI'].setStg('navigationBarActive', true));  // boolean1 value
        }
        else {
            setIcon(navTglIcon, 'arrow-forward-ios');
            data['stgs']['navigationBarActive'] = await atmpAsyncFunc(() => window['stgsAPI'].setStg('navigationBarActive', false));  // boolean1 value
        }
        
        // update all width dependent elements after the navigation bar transition finishes
        atmpAsyncFunc(() => new Promise(resolve => setTimeout(() => { 
            updateGall(true);  // boolean1 isCaps
            updateGall(false);

            updateSeekSldr();
            updatePlbkRateSldr();
            updateVolSldr();
            updateTmlnSldr();

            updateSpkVolSldr();
            updateMicVolSldr();

            // not width dependent, but transition dependent, show after the navigation bar finishes transition
            autoRecResLabel.classList.add('active');

            resolve();
        }, NAVIGATION_BAR_TIMEOUT)));
    });
}

/**
 * Initializes the navigation toggle button
 */
async function initNavTogBtn() {
    // toggle the navigation bar and change the icon, depending on setting
    if (data['stgs']['navigationBarActive'] === true) {
        navBar.classList.add('active');
        setIcon(navTglIcon, 'arrow-back-ios');
    }

    // update all width dependent elements after the navigation bar transition finishes
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
    }, NAVIGATION_BAR_TIMEOUT)));
}

/**
 * Toggles the recording on or off
 * 
 * @param {boolean} isAutoStart - If function is called by the main process by the auto recording process
 * @param {boolean} isManualStop - If function is called by record button click by the user
 * @param {string} recGame - The game that is being recorded
 */
async function togRecBarBtn(isAutoStart, isManualStop, recGame) {
    // check if recording is in progress
    if (flags['isRec']) {
        // check if it was a (manual start / manual stop) or (auto start / auto stop) or (auto start / manual stop)
        if ((!flags['isAutoStart'] && isManualStop) || (flags['isAutoStart'] && !isManualStop) || (flags['isAutoStart'] && isManualStop)) {
            // stop recording
            if (await atmpAsyncFunc(() => window['webSocketAPI'].stopRecord())) {
                // hide the record button and the recording label container
                recBarBtn.classList.remove('active');
                curRecLabelCtr.classList.remove('active');

                // check if auto record is on and the recording was manually stopped
                if (isManualStop && data['stgs']['autoRec'])
                    // show to let the user reenable auto recording
                    autoRecResLabel.classList.add('active');

                // clear the recording time label interval
                clearInterval(states['recTimeIntv']);

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
            if (await atmpAsyncFunc(() => window['webSocketAPI'].startRecord(recGame))) {
                // show the record button and the recording label container
                recBarBtn.classList.add('active');
                curRecLabelCtr.classList.add('active');

                // set the recording game
                curRecGameLabel.textContent = recGame;

                // set auto start and recording flags
                flags['isAutoStart'] = isAutoStart;
                flags['isRec'] = true;

                // restart the recording time and set the recording time label interval to update the timer
                states['recTime'] = 0;
                curRecTimeLabel.textContent = getRdblRecDur(states['recTime']);
                
                states['recTimeIntv'] = setInterval(() => {
                    states['recTime']++;
                    curRecTimeLabel.textContent = getRdblRecDur(states['recTime']);
                }, MSECONDS_IN_SECOND);
            }
        }
    }
}