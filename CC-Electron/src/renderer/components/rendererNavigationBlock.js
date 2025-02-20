/**
 * Module for initializing the navigation block for the renderer process
 * 
 * @module rendererNavigationBlock
 * @requires rendererGeneral
 * @requires rendererDirectoriesSection
 * @requires rendererEditorSection
 * @requires rendererSettingsSection
 */
import { STATE, SECTION, MSECONDS_IN_SECOND, setSectState, setIcon, getRdblRecDur, atmpAsyncFunc } from './rendererGeneral.js';
import { setGallBox } from './rendererDirectoriesSection.js';
import { setSeekSldrBox, setVideoVolSldrBox, setPlbkRateSldrBox, setTmlnSldrBox } from './rendererEditorSection.js';
import { setVolSldrBox, getStg, setStg } from './rendererSettingsSection.js';

// navigation block constants
// program default name and navigation bar timeout
const PROGRAM_DEF = 'Manual';
const NAVIGATION_BAR_TIMEOUT = 500;

// navigation block variables
let navBar, 
dirsBarBtn, stgsBarBtn, 
curRecLabelCtr, curRecTimeLabel, curRecProgLabel, 
recBarBtn, 
autoRecResLabel, 
navTogBtn, navTogIcon;

// navigation block time, interval, recording flags
let curRecTime, curRecTimeIntvId, wasAutoStart, wasManualStop, isRec;

/**
 * Initializes the navigation block variables
 */
export function initRendNavBlockVars() {
    // navigation bar
    navBar = document.getElementById('bar-nav');

    // navigation bar buttons
    dirsBarBtn = document.getElementById('bar-btn-directories');
    stgsBarBtn = document.getElementById('bar-btn-settings');

    // current recording container, labels, time, and interval
    curRecLabelCtr = document.getElementById('label-ctr-current-recording');
    curRecTimeLabel = document.getElementById('time-label-current-recording');
    curRecProgLabel = document.getElementById('program-label-current-recording');

    // recording bar button
    recBarBtn = document.getElementById('bar-btn-record');

    // automatic recording resume label
    autoRecResLabel = document.getElementById('resume-label-auto-record');

    // navigation toggle button and icon
    navTogBtn = document.getElementById('toggle-btn-nav');
    navTogIcon = document.querySelector('#toggle-icon-nav > use');

    // current recording time, interval, and recording flags
    curRecTime = null;
    curRecTimeIntvId = null;
    wasAutoStart = false;
    wasManualStop = false;
    isRec = false
}

/**
 * Initializes the navigation block
 */
export function initRendNavBlock() {
    // initializes the navigation bar button event listeners
    initNavBarBtnEL();

    // initializes the navigation toggle button
    initNavTogBtnEL();
    initNavTogBtn();
}

/**
 * Initializes the navigation bar button event listeners
 */
function initNavBarBtnEL() {
    // on click, change the active section to the directories section
    dirsBarBtn.addEventListener('click', () => setSectState(SECTION.DIRECTORIES));

    // on click, change the active section to the settings section
    stgsBarBtn.addEventListener('click', () => setSectState(SECTION.SETTINGS));

    // on click, toggle recording
    recBarBtn.addEventListener('click', async () => await atmpAsyncFunc(() => togRecBarBtn(false, true)));  // boolean1 isAutoStart, boolean2 isManualStop

    // on click, hide the label and reallow auto recording if it is shown
    autoRecResLabel.addEventListener('click', () => {
        autoRecResLabel.classList.remove('active');
        wasManualStop = false;
     });
}

/**
 * Initializes the navigation toggle button event listener
 */
function initNavTogBtnEL() {
    // on click, change the navigation bar state
    navTogBtn.addEventListener('click', async () => {
        // toggle the navigation bar
        navBar.classList.toggle('active');

        // hide the auto recording resume label before the navigation bar transition begins
        autoRecResLabel.classList.remove('active');

        // change the toggle icon and save the setting, depending on if the navigation bar is active
        if (navBar.classList.contains('active')) {
            setIcon(navTogIcon, 'arrow-back-ios');
            setStg('navigationBarActive', await atmpAsyncFunc(() => window['stgsAPI'].setStg('navigationBarActive', true)));  // boolean1 value
        }
        else {
            setIcon(navTogIcon, 'arrow-forward-ios');
            setStg('navigationBarActive', await atmpAsyncFunc(() => window['stgsAPI'].setStg('navigationBarActive', false)));  // boolean1 value
        }
        
        // update all size/location dependent elements after the navigation bar transition finishes
        atmpAsyncFunc(() => new Promise(resolve => setTimeout(() => { 
            // update the captures and clips galleries
            setGallBox(true);  // boolean1 isCaps
            setGallBox(false);  // boolean1 isCaps

            // update the seek, video volume, playback rate, and timeline sliders
            setSeekSldrBox();
            setVideoVolSldrBox();
            setPlbkRateSldrBox();
            setTmlnSldrBox();
            
            // update the speaker and microphone volume sliders
            setVolSldrBox(true);  // boolean1 isSpk
            setVolSldrBox(false);  // boolean1 isSpk

            // check if auto recording is on and the recording was manually stopped
            if (wasManualStop && getStg('autoRecord')) {
                // show the label to let the user reenable auto recording
                // not width dependent, but transition dependent, show after the navigation bar finishes transition
                autoRecResLabel.classList.add('active');
            }

            resolve();
        }, NAVIGATION_BAR_TIMEOUT)));
    });
}

/**
 * Initializes the navigation toggle button
 */
async function initNavTogBtn() {
    // toggle the navigation bar and change the icon depending on setting
    if (getStg('navigationBarActive') === true) {
        navBar.classList.add('active');
        setIcon(navTogIcon, 'arrow-back-ios');
    }

    // update all size/location dependent elements after the navigation bar transition finishes
    await atmpAsyncFunc(() => new Promise(resolve => setTimeout(() => { 
        // update the captures and clips galleries
        setGallBox(true);  // boolean1 isCaps
        setGallBox(false);  // boolean1 isCaps

        // update the seek, video volume, playback rate, and timeline sliders
        setSeekSldrBox();
        setVideoVolSldrBox();
        setPlbkRateSldrBox();
        setTmlnSldrBox();
        
        // update the speaker and microphone volume sliders
        setVolSldrBox(true);  // boolean1 isSpk
        setVolSldrBox(false);  // boolean1 isSpk

        resolve();
    }, NAVIGATION_BAR_TIMEOUT)));
}

/**
 * Sets the directories bar button state
 * 
 * @param {number} state - The new state of the bar button
 */
export function setDirsBarBtnState(state) {
    state === STATE.ACTIVE ? dirsBarBtn.classList.add('active') : dirsBarBtn.classList.remove('active');
}

/**
 * Sets the settings bar button state
 * 
 * @param {number} state - The new state of the bar button
 */
export function setStgsBarBtnState(state) {
    state === STATE.ACTIVE ? stgsBarBtn.classList.add('active') : stgsBarBtn.classList.remove('active');
}

/**
 * Toggles the recording bar button
 * 
 * @param {boolean} isAutoStart - If function is called by the main process by the auto recording process
 * @param {boolean} isManualStop - If function is called by the user clicking the record button
 * @param {string} recProg - The program being recorded
 */
export async function togRecBarBtn(isAutoStart, isManualStop, recProg = PROGRAM_DEF) {
    // check if recording is in progress
    if (isRec) {
        // check if it was a (manual start / manual stop) or (auto start / auto stop) or (auto start / manual stop)
        if ((!wasAutoStart && isManualStop) || (wasAutoStart && !isManualStop) || (wasAutoStart && isManualStop)) {
            // send a request to OBS to stop recording
            if (await atmpAsyncFunc(() => window['webSocketAPI'].stopRecord())) {
                // hide the record bar button and the recording label container
                recBarBtn.classList.remove('active');
                curRecLabelCtr.classList.remove('active');

                // check if auto record is on and the recording was manually stopped
                if (isManualStop && getStg('autoRecord')) {
                    // show the label to let the user re-allow auto recording
                    autoRecResLabel.classList.add('active');
                }

                // clear the recording time label interval
                clearInterval(curRecTimeIntvId);

                // set the manual stop and recording flags
                wasManualStop = isManualStop;
                isRec = false;
            }
        }
    }
    else {
        // check if it was an (auto start / with no manual stop) or if it was a (manual start)
        if ((isAutoStart && !wasManualStop) || !isAutoStart) {
            // send a request to OBS to start recording
            if (await atmpAsyncFunc(() => window['webSocketAPI'].startRecord(recProg))) {
                // show the record bar button and the recording label container
                recBarBtn.classList.add('active');
                curRecLabelCtr.classList.add('active');

                // set the recording program
                curRecProgLabel.textContent = recProg;

                // reset the recording time
                curRecTime = 0;
                curRecTimeLabel.textContent = getRdblRecDur(curRecTime);
                
                // set the recording time label interval to update the timer
                curRecTimeIntvId = setInterval(() => {
                    curRecTime++;
                    curRecTimeLabel.textContent = getRdblRecDur(curRecTime);
                }, MSECONDS_IN_SECOND);

                // set auto start and recording flags
                wasAutoStart = isAutoStart;
                isRec = true;
            }
        }
    }
}