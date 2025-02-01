/**
 * Module for initializing general components for the renderer process
 * 
 * @module rendererGeneral
 * @requires rendererVariables
 * @requires rendererNavigationBlock
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
    capsNameLabel, capsPathLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsPathLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwTemplate, videoPrvwCtrWidth, capsGall, capsLeftBtn, capsStatLabel, capsRightBtn, clipsGall, clipsLeftBtn, clipsStatLabel, clipsRightBtn, 
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
    mostStgFlds, capsPathStgFld, capsLimitStgFld, capsDispStgFld, clipsPathStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolSldr, spkVolSldrWidth, spkVolOvrl, spkVolThumb, micStgFld, micVolSldr, micVolSldrWidth, micVolOvrl, micVolThumb, 
    boxes, data, flags, state, 
    initRendVars 
} from './rendererVariables.js';
import { initRendNavBlock, togRecBarBtn } from './rendererNavigationBlock.js';
import { initRendDirsSect, loadGall, updateGall } from './rendererDirectoriesSection.js';
import { initRendEditSect, setVideoPlayerState, setSeekSldr, setSeekTrack, setSeekOvrl, setSeekThumb, updateSeekSldr, setVolSldr, setVolOvrl, setVolThumb, updateVolSldr, setPlbkRateSldr, setPlbkRateThumb, updatePlbkRateSldr, setTmlnSldr, setTmlnOvrl, setTmlnThumb, updateTmlnSldr, setClipLeftThumb, setClipRightThumb, syncSeekTmlnSldrs } from './rendererEditorSection.js';
import { initRendStgsSect, setSpkVolSldr, setSpkVolOvrl, setSpkVolThumb, updateSpkVolSldr, setMicVolSldr, setMicVolOvrl, setMicVolThumb, updateMicVolSldr } from './rendererSettingsSection.js';

/**
 * @exports initRendGen, setInitStatLabel, setContStatLabel, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc
 */
export { initRendGen, setInitStatLabel, setContStatLabel, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc };

/**
 * Initializes general components
 */
function initRendGen() {
    initGenEL();
    initGenIPC();
}

/**
 * Initializes general event listeners
 */
function initGenEL() {
    // on resize, update all width/location dependent elements
    window.addEventListener('resize', () => {
        updateGall(true);  // boolean1 isCaps
        updateGall(false);  // boolean1 isCaps

        updateSeekSldr();
        updateVolSldr();
        updatePlbkRateSldr();
        updateTmlnSldr();
        
        updateSpkVolSldr();
        updateMicVolSldr();
    });
}

/**
 * Initializes the inter-process communication callbacks
 */
function initGenIPC() {
    // on request, toggle the record button (initiated from the main auto recording process)
    window.webSocketAPI.reqTogRecBarBtn(async (recGame) => {
        await atmpAsyncFunc(() => togRecBarBtn(true, false, recGame));  // boolean1 isAutoStart, boolean2 isManualStop
    });
}

/**
 * Sets the initialization status label text
 * 
 * @param {string} msg - The new label text
 */
function setInitStatLabel(msg) {
    initStatLabel.textContent = msg;
}

/**
 * Sets the general status label text for runtime status messages
 * 
 * @param {string} msg - The new label text
 */
function setContStatLabel(msg) {
    // clear any existing timeout
    if (state['contStatLabelTmo']) {
        clearTimeout(state['contStatLabelTmo']);
    }

    // set the label text and show the label
    contStatLabel.textContent = msg;
    contStatLabel.classList.add('active');

    // start a new timeout to hide the label after 5 seconds
    state['contStatLabelTmo'] = setTimeout(() => contStatLabel.classList.remove('active'), CONTENT_STATUS_LABEL_TIMEOUT);
}

/**
 * Sets the active content section
 * 
 * @param {string} sect - The section to set active (directories, editor, or settings)
 */
function setActiveSect(sect) {
    switch (sect) {
        case 'directories':
            // unload the editor video
            if (flags['videoLoaded']) {
                flags['videoLoaded'] = false;
                
                // standby will pause the video but hide the play pause icon overlay
                setVideoPlayerState('standby');
            }

            // hide the clip bar and thumbs
            clipBar.classList.remove('active');
            setIcon(clipTglIcon, 'arrow-forward-ios');
            clipLeftThumb.classList.remove('active');
            clipRightThumb.classList.remove('active');
            
            // change the active content section to the directories section
            dirsSect.classList.add('active');
            editSect.classList.remove('active');
            stgsSect.classList.remove('active');

            // highlight the directories bar button on the navigation bar
            dirsBarBtn.classList.add('active');
            stgsBarBtn.classList.remove('active');

            break;

        case 'editor':
            // change the active content section to the editor section
            dirsSect.classList.remove('active');
            editSect.classList.add('active');
            stgsSect.classList.remove('active');

            // remove highlights the bar buttons on the navigation bar
            dirsBarBtn.classList.remove('active');
            stgsBarBtn.classList.remove('active');

            break;

        case 'settings':
            // unload the editor video
            if (flags['videoLoaded']) {
                flags['videoLoaded'] = false;

                // standby will pause the video but hide the play pause icon overlay
                setVideoPlayerState('standby');
            }

            // hide the clip bar and thumbs
            clipBar.classList.remove('active');
            setIcon(clipTglIcon, 'arrow-forward-ios');
            clipLeftThumb.classList.remove('active');
            clipRightThumb.classList.remove('active');

            // change the active content section to the settings section
            dirsSect.classList.remove('active');
            editSect.classList.remove('active');
            stgsSect.classList.add('active');

            // highlight the settings bar button on the navigation bar
            dirsBarBtn.classList.remove('active');
            stgsBarBtn.classList.add('active');

            break;
    }
}

/**
 * Sets the icon (SVG) of an element
 * 
 * @param {HTMLElement} icon - The icon element
 * @param {string} name - The name of the new SVG
 */
function setIcon(icon, name) {
    icon.setAttribute('href', `../assets/svg/${name}.svg#${name}`);
}

/**
 * Gets the [days, hours, minutes, and seconds] of the time
 * 
 * @param {number} time - The time in seconds
 * @returns {number[]} The [days, hours, minutes, seconds] of the time
 */
function getParsedTime(time) {
    return [Math.floor(time / SECONDS_IN_DAY), Math.floor(time % SECONDS_IN_DAY / SECONDS_IN_HOUR), Math.floor(time % SECONDS_IN_HOUR / SECONDS_IN_MINUTE), Math.floor(time % SECONDS_IN_MINUTE)];
}

/**
 * Gets the age in a readable format
 * 
 * @param {number} time - The age in seconds
 * @returns {string} The readable age
 */
function getRdblAge(time) {
    // gets the days, hours, minutes, and seconds of the time
    const parsedTime = getParsedTime(time);

    // return the age based on the largest non-zero time segment (days, hours, minutes)
    if (parsedTime[0] > 999) {
        return '999d+ ago';
    }
    else {
        if (parsedTime[0] > 0) {
            return `${parsedTime[0]}d ago`;
        }
        else {
            if (parsedTime[1] > 0) {
                return `${parsedTime[1]}h ago`;
            }
            else {
                if (parsedTime[2] > 0) {
                    return `${parsedTime[2]}m ago`;
                }
                else {
                    return `Just Now`;
                }
            }
        }
    }
}

/**
 * Gets the time duration in a readable format
 * 
 * @param {number} time - The duration in seconds
 * @returns {string} The readable duration (dd:hh:mm:ss, hh:mm:ss, or mm:ss)
 */
function getRdblDur(time) {
    // gets the days, hours, minutes, and seconds of the time
    const parsedTime = getParsedTime(time);
    let rdblDur = '';

    // if the number of days exceeds 99, return a string indicating max time
    if (parsedTime[0] > 99) {
        rdblDur += '99:99:99:99+';
    }
    else {
        // append the days if it exceeds 0
        if (parsedTime[0] > 0) {
            rdblDur += `${parsedTime[0]}:`
        }

        // append the hours if it exceeds 0, and pad with a 0 if it is less than 10 or if there are non-zero days
        if (parsedTime[1] > 0) {
            if (parsedTime[1] < 10) {
                if (parsedTime[0] > 0) {
                    rdblDur += `0${parsedTime[1]}:`
                }
                else {
                    rdblDur += `${parsedTime[1]}:`
                }
            }
            else {
                rdblDur += `${parsedTime[1]}:`
            }
        }
        else {
            if (parsedTime[0] > 0) {
                rdblDur += `0${parsedTime[1]}:`
            }
        }

        // append the minutes, and pad with a 0 if it is less than 10 or if there are non-zero hours or days
        if (parsedTime[2] < 10) {
            if (parsedTime[1] > 0 || parsedTime[0] > 0) {
                rdblDur += `0${parsedTime[2]}:`
            }
            else {
                rdblDur += `${parsedTime[2]}:`
            }
        }
        else {
            rdblDur += `${parsedTime[2]}:`
        }

        // append the seconds, and pad with a 0 if it is less than 10
        if (parsedTime[3] < 10) {
            rdblDur += `0${parsedTime[3]}`
        }
        else {
            rdblDur += `${parsedTime[3]}`
        }
    }

    return rdblDur;
}

/**
 * Gets the recording time duration in a readable format
 * 
 * @param {number} time - The duration in seconds
 * @returns {string} The readable recording duration (hh:mm:ss or mm:ss)
 */
function getRdblRecDur(time) {
    // gets the days, hours, minutes, and seconds of the time
    const parsedTime = getParsedTime(time);
    let rdblRecDur = '';

    // if the time exceeds 9 hours, return a string indicating max time
    if (parsedTime[0] > 0 || parsedTime[1] > 9) {
        rdblRecDur += '9:99:99+';
    }
    else {
        // append the hours if it exceeds 0
        if (parsedTime[1] > 0) {
            rdblRecDur += `${parsedTime[1]}:`;
        }

        // append the minutes, and pad with a 0 if it is less than 10
        if (parsedTime[2] < 10) {
            if (parsedTime[1] > 0) {
                rdblRecDur += `0${parsedTime[2]}:`
            }
            else {
                rdblRecDur += `${parsedTime[2]}:`
            }
        }
        else {
            rdblRecDur += `${parsedTime[2]}:`
        }

        // append the seconds, and pad with a 0 if it is less than 10
        if (parsedTime[3] < 10) {
            rdblRecDur += `0${parsedTime[3]}`
        }
        else {
            rdblRecDur += `${parsedTime[3]}`
        }
    }

    return rdblRecDur;
}

/**
 * Gets the pointer event location within the bounding box of the element
 * 
 * @param {MouseEvent} ptr - The event pointer
 * @param {DOMRect} box - The element bounding box
 * @returns {number} The location of the pointer event
 */
function getPtrEventLoc(ptr, box) {
    return ptr.clientX - box.left;
}

/**
 * Gets the pointer event percentage within the bounding box of the element
 * 
 * @param {MouseEvent} ptr - The mouse pointer
 * @param {DOMRect} box - The element bounding box
 * @returns {number} The percentage of the pointer event
 */
function getPtrEventPct(ptr, box) {
    return getPtrEventLoc(ptr, box) / box.width;
}

/**
 * Truncates a decimal value by a specified number of digits
 * 
 * @param {number} value - The value to truncate
 * @param {number} places - The number of decimal digits to truncate to
 * @returns 
 */
function getTruncDec(value, places) {
    return Math.trunc(value * Math.pow(10, places)) / Math.pow(10, places);
}

/**
 * Attempts an asynchronous function multiple times with a delay between each
 * 
 * @param {Function} asyncFunc - The asynchronous function
 * @param {number} atmps - The number of attempts
 * @param {number} delay - The delay between attempts in milliseconds
 * @param {boolean} init - If the asynchronous function is run during initialization
 * @returns {Promise} The result of the attempts
 */
async function atmpAsyncFunc(asyncFunc, atmps = ASYNC_ATTEMPTS, delay = ASYNC_DELAY_IN_MSECONDS, init = false) {
    // repeat for the number of attempts
    for (let i = 1; i <= atmps; i++) {
        // try the asynchronous function
        try {
            return await asyncFunc();
        }
        catch (error) {
            // do another attempt after the delay
            if (i < atmps) {
                // set the right text label depending on if this is an initialization or runtime error
                init ? setInitStatLabel(`Attempt ${i} failed: ${error.message}`) : setContStatLabel(`Attempt ${i} failed: ${error.message}`);

                await new Promise(resolve => setTimeout(resolve, delay));
            }
            // throw an error if there are no more attempts remaining
            else {
                // set the right text label depending on if this is an initialization or runtime error
                init ? setInitStatLabel(`Program Failure: ${error.message}`) : setContStatLabel(`Program Failure: ${error.message}`);
            }
        }
    }
}