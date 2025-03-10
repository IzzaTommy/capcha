/**
 * Module for initializing general components for the renderer process
 * 
 * @module rendererGeneral
 * @requires rendererNavigationBlock
 * @requires rendererDirectoriesSection
 * @requires rendererEditorSection
 * @requires rendererSettingsSection
 */
import { setDirsBarBtnState, setStgsBarBtnState, setRecBarBtnState } from './rendererNavigationBlock.js';
import { setVideosGallBox, addVideo, delVideo, rsvConfProm, rejConfProm } from './rendererDirectoriesSection.js';
import { getIsVideoLoaded, setIsVideoLoaded, setVideoPlrSrc, setVideoPlrState, setSeekSldrBox, setVideoVolSldrBox, setPlbkRateSldrBox, setTmlnSldrBox, setClipBarState } from './rendererEditorSection.js';
import { setStgVolSldrBox } from './rendererSettingsSection.js';

// general constants
// state and section enumerations
export const STATE = {
    TOGGLE: 1, 
    ACTIVE: 2, 
    INACTIVE: 3, 
    PLAY: 4, 
    PAUSE: 5, 
    STANDBY: 6, 
    ADDING: 7, 
    ADDING_DIRECTORY: 8, 
    CREATING: 9, 
    RENAMING: 10,  
    CONFIRM: 11, 
    RENAME: 12, 
    DELETE: 13
};
export const SECTION = {
    DIRECTORIES: 1, 
    EDITOR: 2, 
    SETTINGS: 3
};

// timeout, padding function, decimal places for truncation
const CONTENT_STATUS_LABEL_TIMEOUT = 5000;
const TIME_PAD = (time) => time.toString().padStart(2, '0');
const DECIMAL_TRUNC = 6;

// time sizings
export const MSECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;

// general variables
let initOvrl, initStatLabel, 
confOvrl, confCtr, confLabel, confLoadIcon, confFldCtr, confNameFld, confFormatFld, confDesc, confCancelBtn, confConfBtn, confRenBtn, confDelBtn, 
contStatLabel, 
dirsSect, editSect, stgsSect;

// general timeout variable
let contStatLabelTmoId;

/**
 * Initializes the general variables
 */
export function initRendGenVars() {
    // initialization overlay and status label
    initOvrl = document.getElementById('overlay-initialization');
    initStatLabel = document.getElementById('status-label-initialization');

    // confirmation overlay, label, field container, cancel, and option button
    confOvrl = document.getElementById('overlay-confirmation');
    confCtr = document.getElementById('ctr-confirmation');
    confLabel = document.getElementById('label-confirmation');
    confLoadIcon = document.getElementById('loading-icon-confirmation');
    confFldCtr = document.getElementById('field-ctr-confirmation');
    confNameFld = document.getElementById('name-field-confirmation');
    confFormatFld = document.getElementById('format-field-confirmation');
    confDesc = document.getElementById('description-confirmation');
    confCancelBtn = document.getElementById('cancel-btn-confirmation');
    confConfBtn = document.getElementById('confirm-btn-confirmation');
    confRenBtn = document.getElementById('rename-btn-confirmation');
    confDelBtn = document.getElementById('delete-btn-confirmation');

    // content status label
    contStatLabel = document.getElementById('status-label-content');

    // directories, editor, and settings section
    dirsSect = document.getElementById('section-directories');
    editSect = document.getElementById('section-editor');
    stgsSect = document.getElementById('section-settings');

    // content status label timeout
    contStatLabelTmoId = -1;
}

/**
 * Initializes the general components
 */
export function initRendGen() {
    // initialize the general event listeners
    initGenEL();
    
    // initialize the inter-process communication listeners to the main process
    initGenIPC();
}

/**
 * Initializes general event listeners
 */
function initGenEL() {
    // on resize, update all size/location dependent elements
    window.addEventListener('resize', () => {
        // update the captures and clips galleries
        setVideosGallBox(true);  // boolean1 isCaps
        setVideosGallBox(false);  // boolean1 isCaps

        // update the seek, video volume, playback rate, and timeline sliders
        setSeekSldrBox();
        setVideoVolSldrBox();
        setPlbkRateSldrBox();
        setTmlnSldrBox();
        
        // update the speaker and microphone volume sliders
        setStgVolSldrBox(true);  // boolean1 isSpk
        setStgVolSldrBox(false);  // boolean1 isSpk
    });

    // on click, set the confirmation overlay state to inactive and reject the confirmation promise
    confOvrl.addEventListener('mousedown', () => {
        if (confCancelBtn.classList.contains('active')) {
            setConfOvrlState(STATE.INACTIVE);

            rejConfProm();
        }
    });

    // on click, prevent the click event from propagating to the confirmation overlay
    confCtr.addEventListener('mousedown', (ptr) => {
        ptr.stopPropagation();
    });

    // on click, set the confirmation overlay state to inactive and reject the confirmation promise
    confCancelBtn.addEventListener('click', () => {
        setConfOvrlState(STATE.INACTIVE);

        rejConfProm();
    });

    // on click, set the confirmation overlay state to inactive and resolve the confirmation promise
    confConfBtn.addEventListener('click', () => {
        setConfOvrlState(STATE.INACTIVE);

        rsvConfProm();
    });

    // on click, set the confirmation overlay state to inactive and resolve the confirmation promise
    confRenBtn.addEventListener('click', () => {
        setConfOvrlState(STATE.INACTIVE);

        rsvConfProm();
    });

    // on click, set the confirmation overlay state to inactive and resolve the confirmation promise
    confDelBtn.addEventListener('click', () => {
        setConfOvrlState(STATE.INACTIVE);

        rsvConfProm();
    });
}

/**
 * Initializes the inter-process communication callbacks
 */
function initGenIPC() {
    // on request, sets the initialization status label text
    window['genAPI'].reqSetInitStatLabelText((text) => setInitStatLabelText(text));

    // on request, toggle the record button (initiated from the main auto recording process)
    window['stgsAPI'].reqSetRecBarBtnState(async (recProgName) => await setRecBarBtnState(true, false, recProgName));  // boolean1 isAutoStart, boolean2 isManualStop

    // on request, add a video to the captures or clips gallery
    window['stgsAPI'].reqAddVideo((video, isCaps) => addVideo(video, isCaps));

    // on request, delete a video from the captures or clips gallery
    window['stgsAPI'].reqDelVideo((videoFullName, isCaps) => delVideo(videoFullName, isCaps));
}

/**
 * Sets the initialization overlay state
 * 
 * @param {number} state - The new state of the initialization overlay
 */
export function setInitOvrlState(state) {
    state === STATE.ACTIVE ? initOvrl.classList.add('active') : initOvrl.classList.remove('active');
}

/**
 * Sets the initialization status label text
 * 
 * @param {string} text - The new text of the label
 */
export function setInitStatLabelText(text) {
    initStatLabel.textContent = text;
}

/**
 * Sets the confirmation overlay state
 * 
 * @param {number} state - The new state of the confirmation overlay
 */
export function setConfOvrlState(state) {
    state === STATE.ACTIVE ? confOvrl.classList.add('active') : confOvrl.classList.remove('active');
}

/**
 * Sets the confirmation container state
 * 
 * @param {number} state - The new state of the confirmation container
 */
export function setConfCtrState(state, videoName, videoExt) {
    switch (state) {
        case STATE.ADDING:
            // change the confirmation label text
            confLabel.textContent = 'Adding Video';

            // show the confirmation loading icon
            confLoadIcon.classList.add('active');

            // hide the confirmation field container
            confFldCtr.classList.remove('active');

            // hide the confirmation description
            confDesc.classList.remove('active');

            // hide every button
            confCancelBtn.classList.remove('active');
            confConfBtn.classList.remove('active');
            confRenBtn.classList.remove('active');
            confDelBtn.classList.remove('active');

            break;

        case STATE.ADDING_DIRECTORY:
            // change the confirmation label text
            confLabel.textContent = 'Adding All Videos';

            // show the confirmation loading icon
            confLoadIcon.classList.add('active');

            // hide the confirmation field container
            confFldCtr.classList.remove('active');

            // hide the confirmation description
            confDesc.classList.remove('active');

            // hide every button
            confCancelBtn.classList.remove('active');
            confConfBtn.classList.remove('active');
            confRenBtn.classList.remove('active');
            confDelBtn.classList.remove('active');

            break;

        case STATE.CREATING:
            // change the confirmation label text
            confLabel.textContent = 'Creating Clip';

            // show the confirmation loading icon
            confLoadIcon.classList.add('active');

            // hide the confirmation field container
            confFldCtr.classList.remove('active');

            // hide the confirmation description
            confDesc.classList.remove('active');

            // hide every button
            confCancelBtn.classList.remove('active');
            confConfBtn.classList.remove('active');
            confRenBtn.classList.remove('active');
            confDelBtn.classList.remove('active');

            break;

        case STATE.RENAMING:
            // change the confirmation label text
            confLabel.textContent = 'Renaming Video';

            // show the confirmation loading icon
            confLoadIcon.classList.add('active');

            // hide the confirmation field container
            confFldCtr.classList.remove('active');

            // hide the confirmation description
            confDesc.classList.remove('active');

            // hide every button
            confCancelBtn.classList.remove('active');
            confConfBtn.classList.remove('active');
            confRenBtn.classList.remove('active');
            confDelBtn.classList.remove('active');

            break;

        case STATE.CONFIRM:
            // change the confirmation label text
            confLabel.textContent = 'Confirm';

            // hide the confirmation loading icon
            confLoadIcon.classList.remove('active');

            // hide the confirmation field container
            confFldCtr.classList.remove('active');

            // hide the confirmation description
            confDesc.classList.remove('active');

            // show the correct confirmation button
            confCancelBtn.classList.add('active');
            confConfBtn.classList.add('active');
            confRenBtn.classList.remove('active');
            confDelBtn.classList.remove('active');

            break;

        case STATE.RENAME:
            // change the confirmation label text
            confLabel.textContent = 'Rename Video';

            // hide the confirmation loading icon
            confLoadIcon.classList.remove('active');

            // show the confirmation field container
            confFldCtr.classList.add('active');

            // set the confirmation name and format labels to the video name and extension respectively
            confNameFld.value = videoName;
            confFormatFld.value = `.${videoExt}`

            // show the confirmation description
            confDesc.textContent = 'Unallowed characters will be ommitted.';
            confDesc.classList.add('active');

            // show the correct confirmation button
            confCancelBtn.classList.add('active');
            confConfBtn.classList.remove('active');
            confRenBtn.classList.add('active');
            confDelBtn.classList.remove('active');

            break;

        case STATE.DELETE:
            // change the confirmation label text
            confLabel.textContent = 'Delete Video';

            // hide the confirmation loading icon
            confLoadIcon.classList.remove('active');

            // hide the confirmation field container
            confFldCtr.classList.remove('active');

            // hide the confirmation description
            confDesc.classList.remove('active');

            // show the correct confirmation button
            confCancelBtn.classList.add('active');
            confConfBtn.classList.remove('active');
            confRenBtn.classList.remove('active');
            confDelBtn.classList.add('active');

            break;
    }
}

/**
 * Gets the confirmation name field value
 * 
 * @returns {string} - The value of the confirmation name field
 */
export function getConfNameFldValue() {
    return confNameFld.value;
}

/**
 * Gets the confirmation format field value
 * 
 * @returns {string} - The value of the confirmation format field
 */
export function getConfFormatFldValue() {
    return confFormatFld.value;
}

/**
 * Sets the content status label text for runtime status messages
 * 
 * @param {string} text - The new text of the label
 */
export function setContStatLabelText(text) {
    // clear any existing timeout
    if (contStatLabelTmoId) {
        clearTimeout(contStatLabelTmoId);
    }

    // set the label text and show the label
    contStatLabel.textContent = text;
    contStatLabel.classList.add('active');

    // start a new timeout to hide the label after a certain amount of time
    contStatLabelTmoId = setTimeout(() => contStatLabel.classList.remove('active'), CONTENT_STATUS_LABEL_TIMEOUT);
}

/**
 * Sets the section state
 * 
 * @param {number} sect - The section to set active (directories, editor, or settings)
 */
export function setSectState(sect) {
    switch (sect) {
        case SECTION.DIRECTORIES:
            // unload the editor video
            if (getIsVideoLoaded()) {
                setIsVideoLoaded(false);  // boolean1 value
                
                // unset the video player src to ensure the file isn't open (for deletion/renaming)
                setVideoPlrSrc('');

                // standby will pause the video but hide the play pause icon overlay
                setVideoPlrState(STATE.STANDBY);
            }

            // hide the clip bar and thumbs
            setClipBarState(STATE.INACTIVE);

            // change the active content section to the directories section
            dirsSect.classList.add('active');
            editSect.classList.remove('active');
            stgsSect.classList.remove('active');

            // highlight the directories bar button on the navigation bar
            setDirsBarBtnState(STATE.ACTIVE);
            setStgsBarBtnState(STATE.INACTIVE);

            break;

        case SECTION.EDITOR:
            // change the active content section to the editor section
            dirsSect.classList.remove('active');
            editSect.classList.add('active');
            stgsSect.classList.remove('active');

            // remove highlights the bar buttons on the navigation bar
            setDirsBarBtnState(STATE.INACTIVE);
            setStgsBarBtnState(STATE.INACTIVE);

            break;

        case SECTION.SETTINGS:
            // unload the editor video
            if (getIsVideoLoaded()) {
                setIsVideoLoaded(false);  // boolean1 value

                // unset the video player src to ensure the file isn't open (for deletion/renaming)
                setVideoPlrSrc('');

                // standby will pause the video but hide the play pause icon overlay
                setVideoPlrState(STATE.STANDBY);
            }

            // hide the clip bar and thumbs
            setClipBarState(STATE.INACTIVE);

            // change the active content section to the settings section
            dirsSect.classList.remove('active');
            editSect.classList.remove('active');
            stgsSect.classList.add('active');

            // highlight the settings bar button on the navigation bar
            setDirsBarBtnState(STATE.INACTIVE);
            setStgsBarBtnState(STATE.ACTIVE);

            break;
    }
}

/**
 * Sets the icon (SVG) of an element
 * 
 * @param {HTMLElement} icon - The icon element
 * @param {string} iconName - The new name of the icon
 */
export function setIcon(icon, iconName) {
    icon.setAttribute('href', `../assets/svg/${iconName}.svg#${iconName}`);
}

/**
 * Gets a modifiable object of an element's bounding client rectangle
 * This is needed because *.getBoundingClientRect() returns a read-only object.
 * 
 * @param {DOMRect} box - The element bounding box
 * @returns {Object} The modifiable element bounding box
 */
export function getModBox(box) {
    return { 'left': box['left'], 'right': box['right'], 'width': box['width'] };
}

/**
 * Gets the [days, hours, minutes, and seconds] of the time in seconds
 * 
 * @param {number} time - The time in seconds
 * @returns {number[]} The [days, hours, minutes, seconds] of the time
 */
function getParsedTime(time) {
    return [ Math.floor(time / SECONDS_IN_DAY), Math.floor(time % SECONDS_IN_DAY / SECONDS_IN_HOUR), Math.floor(time % SECONDS_IN_HOUR / SECONDS_IN_MINUTE), Math.floor(time % SECONDS_IN_MINUTE) ];
}

/**
 * Gets the recording duration in a readable format
 * 
 * @param {number} recDur - The duration in seconds
 * @returns {string} The readable recording duration (h:mm:ss or mm:ss)
 */
export function getRdblRecDur(recDur) {
    // gets the days, hours, minutes, and seconds of the time
    const parsedRecDur = getParsedTime(recDur);
    let rdblRecDur = '';

    // if the number of hours exceeds 9, append a string indicating max recording duration is exceeded
    if (parsedRecDur[0] > 0 || parsedRecDur[1] > 9) {
        rdblRecDur += '9:59:59+';
    }
    else {
        // append the hours if it exceeds 0
        if (parsedRecDur[1] > 0) {
            rdblRecDur += `${parsedRecDur[1]}:`;
        }

        // append the minutes, and pad with a 0 if it is less than 10 or if there are non-zero hours or days
        if (parsedRecDur[2] < 10) {
            if (parsedRecDur[0] > 0 || parsedRecDur[1] > 0) {
                rdblRecDur += `${TIME_PAD(parsedRecDur[2])}:`;
            }
            else {
                rdblRecDur += `${parsedRecDur[2]}:`;
            }
        }
        else {
            rdblRecDur += `${parsedRecDur[2]}:`;
        }

        // append the seconds, and pad with a 0 if it is less than 10
        rdblRecDur += TIME_PAD(parsedRecDur[3]);
    }

    return rdblRecDur;
}

/**
 * Gets the duration in a readable format
 * 
 * @param {number} dur - The duration in seconds
 * @returns {string} The readable duration (e.g. dd:hh:mm:ss, hh:mm:ss, or mm:ss)
 */
export function getRdblDur(dur) {
    // gets the days, hours, minutes, and seconds of the duration
    const parsedDur = getParsedTime(dur);
    let rdblDur = '';

    // if the number of days exceeds 99, append a string indicating max duration is exceeded
    if (parsedDur[0] > 99) {
        rdblDur += '99:23:59:59+';
    }
    else {
        // append the days if it exceeds 0
        if (parsedDur[0] > 0) {
            rdblDur += `${parsedDur[0]}:`;
        }

        // append the hours if it exceeds 0, and pad with a 0 if it is less than 10 or if there are non-zero days
        if (parsedDur[1] > 0) {
            if (parsedDur[0] > 0) {
                rdblDur += `${TIME_PAD(parsedDur[1])}:`;
            }
            else {
                rdblDur += `${parsedDur[1]}:`;
            }
        }
        else {
            if (parsedDur[0] > 0) {
                rdblDur += `${TIME_PAD(parsedDur[1])}:`;
            }
        }

        // append the minutes, and pad with a 0 if it is less than 10 or if there are non-zero hours or days
        if (parsedDur[2] < 10) {
            if (parsedDur[0] > 0 || parsedDur[1] > 0) {
                rdblDur += `${TIME_PAD(parsedDur[2])}:`;
            }
            else {
                rdblDur += `${parsedDur[2]}:`;
            }
        }
        else {
            rdblDur += `${parsedDur[2]}:`;
        }

        // append the seconds, and pad with a 0 if it is less than 10
        rdblDur += TIME_PAD(parsedDur[3]);
    }

    return rdblDur;
}

/**
 * Gets the age in a readable format
 * 
 * @param {number} age - The age in seconds
 * @returns {string} The readable age (e.g. '999d+ ago', '7d ago', '7h ago', '7m ago', 'Just Now)
 */
export function getRdblAge(age) {
    // gets the days, hours, minutes, and seconds of the age
    const parsedAge = getParsedTime(age);

    // return the age based on the largest non-zero time segment (days, hours, minutes)
    if (parsedAge[0] > 999) {
        return '999d+ ago';
    }
    else {
        if (parsedAge[0] > 0) {
            return `${parsedAge[0]}d ago`;
        }
        else {
            if (parsedAge[1] > 0) {
                return `${parsedAge[1]}h ago`;
            }
            else {
                if (parsedAge[2] > 0) {
                    return `${parsedAge[2]}m ago`;
                }
                else {
                    return `Just Now`;
                }
            }
        }
    }
}

/**
 * Truncates a decimal value by a specified number of digits
 * 
 * @param {number} value - The value to truncate
 * @param {number} places - The number of decimal digits to truncate to
 * @returns {number} The value truncated to the specified decimal places
 */
export function getTruncDec(value, places = DECIMAL_TRUNC) {
    return Math.trunc(value * Math.pow(10, places)) / Math.pow(10, places);
}

/**
 * Gets the pointer event location within the bounding box of the element
 * 
 * @param {MouseEvent} ptr - The event pointer
 * @param {DOMRect} box - The element bounding box
 * @returns {number} The location of the pointer event
 */
export function getPtrEventLoc(ptr, box) {
    return ptr.clientX - box.left;
}

/**
 * Gets the pointer event location percentage within the bounding box of the element
 * 
 * @param {MouseEvent} ptr - The mouse pointer
 * @param {DOMRect} box - The element bounding box
 * @returns {number} The location percentage of the pointer event
 */
export function getPtrEventPct(ptr, box) {
    return getPtrEventLoc(ptr, box) / box['width'];
}