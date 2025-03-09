/**
 * Module for initializing the settings section for the renderer process
 * 
 * @module rendererSettingsSection
 * @requires rendererGeneral
 * @requires rendererDirectoriesSection
 */
import { STATE, setConfOvrlState, setConfCtrState, setContStatLabelText, setIcon, getModBox, getPtrEventPct } from './rendererGeneral.js';
import { setVideosTotalLabel3Text, addAllVideos } from './rendererDirectoriesSection.js';

// settings section constants
// speaker and microphone volume min, max, grow, and reduce
const SPEAKER_VOLUME_MIN = 0;
const SPEAKER_VOLUME_MAX = 1;
export const SPEAKER_VOLUME_GROW = 0.05;
export const SPEAKER_VOLUME_REDUCE = 0.05
const MICROPHONE_VOLUME_MIN = 0;
const MICROPHONE_VOLUME_MAX = 1;
export const MICROPHONE_VOLUME_GROW = 0.05;
export const MICROPHONE_VOLUME_REDUCE = 0.05;

// settings section variables
let html, 
mostTogSwtes, darkModeTogFld, darkModeTogIcon, 
mostFlds, 
capsDirFld, capsLimitFld, capsDispFld, 
progsBoard, genStgTileTmpl, progsAddBtn, 
clipsDirFld, clipsLimitFld, 
clipsFrmFlds, clipsWidthFlds, clipsHeightFlds, 
spkFld, spkVolSldrCtr, spkVolSldr, spkVolOvrl, spkVolThumb, 
micFld, micVolSldrCtr, micVolSldr, micVolOvrl, micVolThumb;

// settings section boxes and flags
let spkVolSldrBox, micVolSldrBox, isSpkVolSldrCtrHover, isSpkVolSldrDrag, isMicVolSldrCtrHover, isMicVolSldrDrag;

// settings section settings, displays, and devices
let stgs, disps, devs;

/**
 * Initializes the settings section variables
 */
export function initRendStgsSectVars() {
    // html
    html = document.querySelector('html');

    // toggle switches, dark mode toggle field and icon
    mostTogSwtes = document.querySelectorAll(`.general-setting-toggle-switch:not(:has(> .general-setting-toggle-field[name='darkMode']))`);
    darkModeTogFld = document.querySelector(`.general-setting-toggle-field[name='darkMode']`);
    darkModeTogIcon = document.querySelector(`.general-setting-toggle-field[name='darkMode'] + .general-setting-toggle-icon > use`);

    // fields
    mostFlds = document.querySelectorAll(`.general-setting-field:not([name='capturesDirectory']):not([name='capturesLimit']):not([name='capturesDisplay']):not([name='clipsDirectory']):not([name='clipsLimit']):not([name='clipsFormat']):not([name='clipsWidth']):not([name='clipsHeight']):not([name='speaker']):not([name='microphone'])`);

    // captures directory, limit, and display field
    capsDirFld = document.querySelector(`.general-setting-field[name='capturesDirectory']`);
    capsLimitFld = document.querySelector(`.general-setting-field[name='capturesLimit']`);
    capsDispFld = document.querySelector(`.general-setting-field[name='capturesDisplay']`);

    // programs board, general setting tile template, and programs add button
    progsBoard = document.getElementById('board-programs');
    genStgTileTmpl = document.getElementById('template-general-setting-tile');
    progsAddBtn = document.getElementById('add-btn-programs');

    // clips directory and limit field
    clipsDirFld = document.querySelector(`.general-setting-field[name='clipsDirectory']`);
    clipsLimitFld = document.querySelector(`[name='clipsLimit']`);

    // clips format, width, and height fields
    clipsFrmFlds = document.querySelectorAll(`[name='clipsFormat']`);
    clipsWidthFlds = document.querySelectorAll(`[name='clipsWidth']`);
    clipsHeightFlds = document.querySelectorAll(`[name='clipsHeight']`);

    // speaker field and volume slider
    spkFld = document.querySelector(`.general-setting-field[name='speaker']`);
    spkVolSldrCtr = document.getElementById('slider-ctr-speaker-volume');
    spkVolSldr = document.getElementById('slider-speaker-volume');
    spkVolOvrl = document.getElementById('overlay-speaker-volume');
    spkVolThumb = document.getElementById('thumb-speaker-volume');

    // microphone field and volume slider
    micFld = document.querySelector(`.general-setting-field[name='microphone']`);
    micVolSldrCtr = document.getElementById('slider-ctr-microphone-volume');
    micVolSldr = document.getElementById('slider-microphone-volume');
    micVolOvrl = document.getElementById('overlay-microphone-volume');
    micVolThumb = document.getElementById('thumb-microphone-volume');

    // speaker and microphone volume slider boxes and flags
    spkVolSldrBox = getModBox(spkVolSldr.getBoundingClientRect());
    micVolSldrBox = getModBox(micVolSldr.getBoundingClientRect());
    isSpkVolSldrCtrHover = false;
    isSpkVolSldrDrag = false;
    isMicVolSldrCtrHover = false;
    isMicVolSldrDrag = false;

    // settings, displays, and devices
    stgs = {};
    disps = {};
    devs = {};
}

/**
 * Initializes the settings section
 */
export async function initRendStgsSect() {
    // initialize the setting container event listeners
    initStgCtrEL();

    // initialize the setting container
    await initStgCtr();
}

/**
 * Initializes the setting container event listeners
 */
function initStgCtrEL() {
    // iterate through each toggle switch
    for (const togSwt of mostTogSwtes) {
        // get the general setting toggle field and icon
        const genStgTogFld = togSwt.querySelector('.general-setting-toggle-field');
        const genStgTogIcon = togSwt.querySelector('.general-setting-toggle-icon > use');

        // on change, set the setting, update the settings cache, and update the field value
        genStgTogFld.addEventListener('change', async () => {
            // try to update the setting
            try {
                genStgTogFld.checked = stgs[genStgTogFld.name] = await window['stgsAPI'].setStg(genStgTogFld.name, genStgTogFld.checked);

                // set the icon based on if the setting toggle field is checked
                genStgTogFld.checked ? setIcon(genStgTogIcon, 'check') : setIcon(genStgTogIcon, 'close');
            }
            catch (_) {
                // notify the user that the setting could not be changed
                setContStatLabelText('Failed to change the setting!');

                // revert the change
                genStgTogFld.checked = stgs[genStgTogFld.name];
            }
        });
    }

    // on change, set the setting, update the settings cache, and update the field value
    darkModeTogFld.addEventListener('change', async () => {
        // try to update the setting
        try {
            darkModeTogFld.checked = stgs['darkMode'] = await window['stgsAPI'].setStg('darkMode', darkModeTogFld.checked);

            // change the theme attribute, depending on if dark mode is enabled
            if (darkModeTogFld.checked) {
                setIcon(darkModeTogIcon, 'check');
                html.dataset.theme = 'dark';
            }
            else {
                setIcon(darkModeTogIcon, 'close');
                html.dataset.theme = 'light';
            }
        }
        catch (_) {
            // notify the user that dark mode could not be toggled
            setContStatLabelText('Failed to toggle dark mode!');

            // revert the change
            darkModeTogFld.checked = stgs['darkMode'];
        }
    });

    // iterate through each field
    for (const fld of [...mostFlds, capsDispFld, spkFld, micFld]) {
        // on change, set the setting, update the settings cache, and update the field value
        fld.addEventListener('change', async () => { 
            // try to update the setting
            try {
                fld.value = stgs[fld.name] = await window['stgsAPI'].setStg(fld.name, fld.value);
            }
            catch (_) {
                // notify the user that the setting could not be changed
                setContStatLabelText('Failed to change the setting!');

                // revert the change
                fld.value = stgs[fld.name];
            }
        });
    }

    // iterate through each directory field
    for (const [index, dirFld] of [capsDirFld, clipsDirFld].entries()) {
        // get the captures or clips variable
        const isCaps = index === 0;

        // on click, set the setting, update the settings cache, update the field value, and reload the gallery
        dirFld.addEventListener('click', async () => {
            // try to update the setting
            try {
                const dir = await window['stgsAPI'].setStg(dirFld.name, '');

                // if the directory is not the old value, set the new value and load the new gallery
                if (dir !== dirFld.value) {
                    dirFld.value = stgs[dirFld.name] = dir;

                    // set the confirmation container state to adding
                    setConfCtrState(STATE.ADDING_DIRECTORY);
                    
                    // set the confirmation overlay state to active
                    setConfOvrlState(STATE.ACTIVE);

                    await addAllVideos(isCaps, false);  // boolean1 isCaps, boolean2 isInit

                    // set the confirmation overlay state to inactive
                    setConfOvrlState(STATE.INACTIVE);
                }
            }
            catch (_) {
                // notify the user that the directory could not be changed
                setContStatLabelText('Failed to change the directory!');
            }
        });
    }

    // iterate through each limit field
    for (const [index, limitFld] of [capsLimitFld, clipsLimitFld].entries()) {
        // get the captures or clips variable
        const isCaps = index === 0;

        // on change, set the setting, update the settings cache, update the field value, and update the total label
        limitFld.addEventListener('change', async () => {
            // try to update the setting
            try {
                limitFld.value = stgs[limitFld.name] = await window['stgsAPI'].setStg(limitFld.name, limitFld.value);
                setVideosTotalLabel3Text(`/${stgs[limitFld.name]} GB`, isCaps);
            }
            catch (_) {
                // notify the user that the directory limit could not be changed
                setContStatLabelText('Failed to change the directory limit!');

                // revert the change
                limitFld.value = stgs[limitFld.name];
            }
        });
    }

    // on click, add a new program to the programs list
    progsAddBtn.addEventListener('click', async () => {
        //try to update the programs list
        try {
            // get the user selected program
            const prog = await window['stgsAPI'].setStg('programs', null);

            // if the name is not null (the user did not cancel and it is a new program)
            if (prog !== null) {
                // get the name and program info
                const progName = Object.keys(prog)[0];
                const progInfo = Object.values(prog)[0];

                // update the programs list and insert the program into the board
                stgs['programs'][progName] = progInfo;
                addGenStgTile(progName, progInfo);
            }
        }
        catch (_) {
            // notify the user that the list of programs could not be changed
            setContStatLabelText('Failed to change the list of programs!');
        }
    });

    // iterate through each clips field (for settings present in the settings section and clip bar)
    for (const flds of [clipsFrmFlds, clipsWidthFlds, clipsHeightFlds]) {
        // on change, set the setting, update the settings cache, and update the field value
        flds[0].addEventListener('change', async () => { 
            // try to update the setting
            try {
                flds[0].value = flds[1].value = stgs[flds[0].name] = await window['stgsAPI'].setStg(flds[0].name, flds[0].value);
            }
            catch (_) {
                // notify the user that the clip setting could not be changed
                setContStatLabelText('Failed to change the clip setting!');

                // revert the change
                flds[0].value = stgs[flds[0].name];
            }
        });

        // on change, set the setting, update the settings cache, and update the field value
        flds[1].addEventListener('change', async () => { 
            // try to update the setting
            try {
                flds[1].value = flds[0].value = stgs[flds[1].name] = await window['stgsAPI'].setStg(flds[1].name, flds[1].value);
            }
            catch (_) {
                // notify the user that the clip setting could not be changed
                setContStatLabelText('Failed to change the clip setting!');

                // revert the change
                flds[1].value = stgs[flds[1].name];
            }
        });
    }

    // iterate through each volume slider container
    for (const [index, volSldrCtr] of [spkVolSldrCtr, micVolSldrCtr].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const growValue = isSpk ? SPEAKER_VOLUME_GROW : MICROPHONE_VOLUME_GROW;
        const redValue = isSpk ? SPEAKER_VOLUME_REDUCE : MICROPHONE_VOLUME_REDUCE;
        const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

        // on mouseenter, enable the hover flag
        volSldrCtr.addEventListener('mouseenter', () => isSpk ? isSpkVolSldrCtrHover = true : isMicVolSldrCtrHover = true);

        // on wheel, increase or decrease the volume
        volSldrCtr.addEventListener('wheel', (ptr) => {
            // prevent the default scrolling on the container
            ptr.preventDefault();

            // if scrolling 'up', increase the volume
            if (ptr.deltaY < 0) {
                // set the volume
                pseudoSetStgVol(stgs[stgStr] + growValue, isSpk);
                setStgVol(isSpk);

                // set the volume slider
                setStgVolSldr(isSpk);
            }
            // else, decrease the speaker volume
            else {
                // set the volume
                pseudoSetStgVol(stgs[stgStr] - redValue, isSpk);
                setStgVol(isSpk);

                // set the volume slider
                setStgVolSldr(isSpk);
            }
        });

        // on mouseleave, disable the hover flag
        volSldrCtr.addEventListener('mouseleave', () => isSpk ? isSpkVolSldrCtrHover = false : isMicVolSldrCtrHover = false);
    }

    // iterate through each setting slider
    for (const [index, volSldr] of [spkVolSldr, micVolSldr].entries()) {
        // get the speaker or microphone variable
        const isSpk = index === 0;

        // on mousedown, enable the dragging boolean and set the volume based on the pointer location
        volSldr.addEventListener('mousedown', (ptr) => {
            // get the speaker or microphone variable
            const volSldrBox = isSpk ? spkVolSldrBox : micVolSldrBox;

            // set the volume
            pseudoSetStgVol(getPtrEventPct(ptr, volSldrBox), isSpk);

            // set the volume slider and dragging boolean
            setStgVolSldr(isSpk);
            isSpk ? isSpkVolSldrDrag = true : isMicVolSldrDrag = true;
        });
    }
}

/**
 * Initializes the setting container
 */
async function initStgCtr() {
    // try to get the settings, displays, and the devices (speakers, microphones, webcams)
    stgs = await window['stgsAPI'].getAllStgs();
    disps = await window['stgsAPI'].getAllDisps();
    devs = await window['stgsAPI'].getAllDevs();

    // iterate through each toggle switch
    for (const togSwt of mostTogSwtes) {
        // get the general setting toggle field and icon
        const genStgTogFld = togSwt.querySelector('.general-setting-toggle-field');
        const genStgTogIcon = togSwt.querySelector('.general-setting-toggle-icon > use');

        // load each initial setting value from stored settings
        genStgTogFld.checked = stgs[genStgTogFld.name];

        // set the icon based on if the toggle field is checked
        genStgTogFld.checked ? setIcon(genStgTogIcon, 'check') : setIcon(genStgTogIcon, 'close');
    }

    // load the initial setting value from stored settings
    darkModeTogFld.checked = stgs['darkMode'];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeTogFld.checked) {
        setIcon(darkModeTogIcon, 'check');
        html.dataset.theme = 'dark';
    }
    else {
        setIcon(darkModeTogIcon, 'close');
        html.dataset.theme = 'light';
    }

    // iterate through each field
    for (const fld of [...mostFlds, capsDirFld, clipsDirFld, ...clipsFrmFlds, ...clipsWidthFlds, ...clipsHeightFlds]) {
        // load each initial setting value from the stored settings
        fld.value = stgs[fld.name];
    }

    // iterate through each limit field
    for (const [index, limitFld] of [capsLimitFld, clipsLimitFld].entries()) {
        // get the captures or clips variable
        const isCaps = index === 0;

        // load each initial setting value from the stored settings and set the total label
        limitFld.value = stgs[limitFld.name];
        setVideosTotalLabel3Text(`/${stgs[limitFld.name]} GB`, isCaps);
    }

    // iterate through each display
    for (const [dispName, dispInfo] of Object.entries(disps)) {
        // create a new field option
        const fldOption = document.createElement('option');

        // assign the name of the display to the value and set the text to the name, size, and position
        fldOption.value = dispName;
        fldOption.text = `${dispName} (${dispInfo['sizeX']} x ${dispInfo['sizeY']}) @ (${dispInfo['posX']}, ${dispInfo['posY']})`;

        // append the child to the captures display field
        capsDispFld.appendChild(fldOption);
    }

    // load the initial setting value from the stored settings
    capsDispFld.value = stgs['capturesDisplay'];

    // iterate through each program
    for (const [progName, progInfo] of Object.entries(stgs['programs'])) {
        // insert the general setting tile for each program
        addGenStgTile(progName, progInfo);
    }

    // iterate through each device field
    for (const [index, fld] of [spkFld, micFld].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const devStr = isSpk ? 'outs' : 'inps';
        const stgStr = isSpk ? 'speaker' : 'microphone';

        // iterate through each device
        for (const [devName, _] of Object.entries(devs[devStr])) {
            // create a new field option
            const fldOption = document.createElement('option');

            // assign the name of the device to the value and text
            fldOption.value = devName;
            fldOption.text = devName;

            // append the child to the device field
            fld.appendChild(fldOption);
        }
        
        // load the initial setting value from the stored settings
        fld.value = stgs[stgStr];

        // set the volume slider
        setStgVolSldr(isSpk);
    }
}

/**
 * Inserts a general setting tile into the programs board
 * 
 * @param {String} progName - The name of the program
 * @param {Object} progInfo - The program information including the alternate name and icon data
 */
function addGenStgTile(progName, progInfo) {
    // get a clone of the general setting tile template
    const genStgTileClone = genStgTileTmpl.content.cloneNode(true);
    const genStgTile = genStgTileClone.querySelector('.general-setting-tile');
    const genStgProgIcon = genStgTileClone.querySelector('.general-setting-program-icon');

    // set the program icon data and alt
    genStgProgIcon.setAttribute('src', progInfo['dataURL']);
    genStgProgIcon.setAttribute('alt', `The icon for ${progName}`);

    // set the program label
    genStgTileClone.querySelector('.general-setting-program-label').textContent = `${progName}`;

    // on click, delete the program from the list
    genStgTileClone.querySelector('.general-setting-delete-btn').addEventListener('click', async () => { 
        // try to delete the program
        try {
            await window['stgsAPI'].delProg(progName);

            // delete the program from the programs list and remove the tile from the board
            delete stgs['programs'][progName];
            progsBoard.removeChild(genStgTile);
        }
        catch (_) {
            // notify the user that the program could not be deleted
            setContStatLabelText('Failed to delete the program!');
        }
    });

    // insert the tile before the add button
    progsBoard.insertBefore(genStgTile, progsAddBtn);
}

/**
 * Gets the speaker or microphone volume slider box
 * 
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 * @returns {Object} The modifiable volume slider bounding box
 */
export function getStgVolSldrBox(isSpk) {
    return isSpk ? spkVolSldrBox : micVolSldrBox;
}

/**
 * Gets the volume slider container hover flag
 * 
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 * @returns {boolean} The volume slider container hover flag
 */
export function getIsStgVolSldrCtrHover(isSpk) {
    return isSpk ? isSpkVolSldrCtrHover : isMicVolSldrCtrHover;
}

/**
 * Gets the volume slider dragging flag
 * 
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 * @returns {boolean} The volume slider dragging flag
 */
export function getIsStgVolSldrDrag(isSpk) {
    return isSpk ? isSpkVolSldrDrag : isMicVolSldrDrag;
}

/**
 * Sets the volume slider dragging flag
 * 
 * @param {boolean} value - The new value of the flag
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 */
export function setIsStgVolSldrDrag(value, isSpk) {
    isSpk ? isSpkVolSldrDrag = value : isMicVolSldrDrag = value;
}

/**
 * Sets the speaker or microphone volume in the setting cache ONLY
 * 
 * @param {number} value - The new volume
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 */
export function pseudoSetStgVol(value, isSpk) {
    // get the speaker or microphone variables
    const volMin = isSpk ? SPEAKER_VOLUME_MIN : MICROPHONE_VOLUME_MIN;
    const volMax = isSpk ? SPEAKER_VOLUME_MAX : MICROPHONE_VOLUME_MAX;
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    stgs[stgStr] = Math.max(volMin, Math.min(value, volMax));
}

/**
 * Sets the speaker or microphone volume in the main process settings
 * 
 * @param {boolean} isSpk - If the call is for the speaker or microphone 
 */
export async function setStgVol(isSpk) {
    // get the speaker or microphone variables
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    // try to update the setting volume
    try {
        await window['stgsAPI'].setStg(stgStr, stgs[stgStr]);
    }
    catch (_) {
        // notify the user that the setting volume could not be updated
        // unrevertable since the old value was deleted...
        setContStatLabelText('Failed to update the setting volume!');
    }
}

/**
 * Sets the speaker or microphone volume slider thumb and overlay
 * 
 * @param {boolean} isSpk - If the call is for the speaker or microphone 
 */
export function setStgVolSldr(isSpk) {
    // get the speaker or microphone variables
    const volSldrBox = isSpk ? spkVolSldrBox : micVolSldrBox;
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    // set the speaker volume thumb and overlay (trailing bar)
    setStgVolThumb(stgs[stgStr] * volSldrBox['width'], isSpk);
    setStgVolOvrl(stgs[stgStr] * 100, isSpk);
}

/**
 * Sets the speaker or microphone volume slider overlay
 * 
 * @param {number} thumbLoc - The location of the slider thumb
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 */
function setStgVolOvrl(thumbLoc, isSpk) {
    // get the speaker or microphone variables
    const volOvrl = isSpk ? spkVolOvrl : micVolOvrl;

    volOvrl.style.background = `linear-gradient(to right, var(--gstoverlay-lgradientcolor) ${thumbLoc}%, transparent ${thumbLoc}%`;
}

/**
 * Sets the speaker or microphone volume slider thumb
 * 
 * @param {number} thumbLoc - The location of the slider thumb
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 */
function setStgVolThumb(thumbLoc, isSpk) {
    // get the speaker or microphone variables
    const volThumb = isSpk ? spkVolThumb : micVolThumb;

    volThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the speaker or microphone volume slider
 * 
 * @param {boolean} isSpk - If the call is for the speaker or microphone
 */
export function setStgVolSldrBox(isSpk) {
    // get the new modifiable speaker volume slider bounding box
    isSpk ? spkVolSldrBox = getModBox(spkVolSldr.getBoundingClientRect()) : micVolSldrBox = getModBox(micVolSldr.getBoundingClientRect());
}

/**
 * Gets a setting value
 * 
 * @param {string} stg - The name of the setting
 * @param {boolean | number | string} The value of the setting
 */
export function getStg(stg) {
    return stgs[stg];
}

/**
 * Sets a setting value
 * 
 * @param {string} stg - The name of the setting
 * @param {boolean | number | string} value - The new value of the setting
 */
export function setStg(stg, value) {
    stgs[stg] = value;
}