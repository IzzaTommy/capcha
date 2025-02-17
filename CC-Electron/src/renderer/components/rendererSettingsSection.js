/**
 * Module for initializing the settings section for the renderer process
 * 
 * @module rendererSettingsSection
 * @requires rendererVariables
 * @requires rendererSharedFunctions
 * @requires rendererDirectoriesSection
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
import { initRendGen, setInitStatLabel, setContStatLabel, getModBox, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
import { initRendDirsSect, addAllVideos, addVideo, delAllVideos, delVideo, createAllVideoPrvwCtrs, createVideoPrvwCtr, addAllVideoPrvwCtrs, remAllVideoPrvwCtrs, setUsageLabel3, updateGameFltFld, updateGall } from './rendererDirectoriesSection.js';

/**
 * @exports initRendStgsSect, pseudoSetVol, setVol, setVolSldr, setVolOvrl, setVolThumb, updateVolSldr
 */
export { initRendStgsSect, pseudoSetVol, setVol, setVolSldr, setVolOvrl, setVolThumb, updateVolSldr }

/**
 * Initializes the settings section
 */
async function initRendStgsSect() {
    initStgCtrEL();
    await atmpAsyncFunc(() => initStgCtr());
}

/**
 * Initializes the setting container event listeners
 */
function initStgCtrEL() {
    // iterate through each setting toggle switch
    for (const tglSwt of mostTglSwtes) {
        // get the setting toggle field and icon
        const tglFld = tglSwt.querySelector('.general-setting-toggle-field');
        const tglIcon = tglSwt.querySelector('.general-setting-toggle-icon > use');

        // on change, set the setting, update the setting cache, and update the setting field value
        tglFld.addEventListener('change', async () => {
            tglFld.checked = data['stgs'][tglFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(tglFld.name, tglFld.checked));

            // set the icon based on if the setting toggle field is checked
            tglFld.checked ? setIcon(tglIcon, 'check') : setIcon(tglIcon, 'close');
        });
    }

    // on change, set the setting, update the setting cache, and update the setting field value
    darkModeTglFld.addEventListener('change', async () => {
        darkModeTglFld.checked = data['stgs']['darkMode'] = await atmpAsyncFunc(() => window['stgsAPI'].setStg('darkMode', darkModeTglFld.checked));

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeTglFld.checked) {
            setIcon(darkModeTglIcon, 'check');
            html.dataset.theme = 'dark';
        }
        else {
            setIcon(darkModeTglIcon, 'close');
            html.dataset.theme = 'light';
        }
    });

    // iterate through each setting field
    for (const fld of [...mostFlds, capsDispFld, spkFld, micFld]) {
        // on change, set the setting, update the setting cache, and update the setting field value
        fld.addEventListener('change', async () => fld.value = data['stgs'][fld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(fld.name, fld.value)));
    }

    // iterate through each directory setting field
    for (const [index, dirFld] of [capsDirFld, clipsDirFld].entries()) {
        // get the captures or clips variable
        const isCaps = index === 0;

        // on click, set the setting, update the setting cache, update the setting field value, and reload the gallery
        dirFld.addEventListener('click', async () => {
            const dir = await atmpAsyncFunc(() => window['stgsAPI'].setStg(dirFld.name, ''));

            // if the directory is not null, set the new value and load the new gallery
            if (dir !== null) {
                dirFld.value = data['stgs'][dirFld.name] = dir;

                await atmpAsyncFunc(() => addAllVideos(isCaps, false));  // boolean1 isCaps, boolean2 isInit
            }
        });
    }

    // iterate through each limit setting field
    for (const [index, limitFld] of [capsLimitFld, clipsLimitFld].entries()) {
        // get the captures or clips variable
        const totalLabel3 = index === 0 ? capsTotalLabel3 : clipsTotalLabel3;

        // on change, set the setting, update the setting cache, update the setting field value, and update the total label
        limitFld.addEventListener('change', async () => {
            limitFld.value = data['stgs'][limitFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(limitFld.name, limitFld.value));

            totalLabel3.textContent = `/${data['stgs'][limitFld.name]} GB`;
        });
    }

    // on click, add a new program to the programs list
    progsAddBtn.addEventListener('click', async () => {
        const prog = await atmpAsyncFunc(() => window['stgsAPI'].setStg('programs', null));

        // if the name is not null (the user did not cancel or it is a new program)
        if (prog !== null) {
            // get the name and program info
            const name = Object.keys(prog)[0];
            const progInfo = Object.values(prog)[0];

            // update the programs list and insert the program into the board
            data['stgs']['programs'][name] = progInfo;
            insertGenStgTile(name, progInfo);
        }
    });

    // iterate through each clips setting field (for settings present in the settings section and clip bar)
    for (const flds of [clipsFrmFlds, clipsWidthFlds, clipsHeightFlds]) {
        // on change, set the setting, update the setting cache, and update the setting field value
        flds[0].addEventListener('change', async () => flds[0].value = flds[1].value = data['stgs'][flds[0].name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(flds[0].name, flds[0].value)));

        // on change, set the setting, update the setting cache, and update the setting field value
        flds[1].addEventListener('change', async () => flds[1].value = flds[0].value = data['stgs'][flds[1].name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(flds[1].name, flds[1].value)));
    }

    // iterate through each setting slider container
    for (const [index, volSldrCtr] of [spkVolSldrCtr, micVolSldrCtr].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const growValue = isSpk ? SPEAKER_VOLUME_GROW : MICROPHONE_VOLUME_GROW;
        const redValue = isSpk ? SPEAKER_VOLUME_REDUCE : MICROPHONE_VOLUME_REDUCE;
        const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';
        const hoverStr = isSpk ? 'isSpkVolSldrCtrHover' : 'isMicVolSldrCtrHover';

        // on mouseenter, enable the hover flag
        volSldrCtr.addEventListener('mouseenter', () => flags[hoverStr] = true);

        // on wheel, increase or decrease the volume
        volSldrCtr.addEventListener('wheel', (ptr) => {
            // prevent the default scrolling on the container
            ptr.preventDefault();

            // if scrolling 'up', increase the volume
            if (ptr.deltaY < 0) {
                // set the volume
                pseudoSetVol(data['stgs'][stgStr] + growValue, isSpk);
                setVol(isSpk);

                // set the volume slider
                setVolSldr(isSpk);
            }
            // else, decrease the speaker volume
            else {
                // set the volume
                pseudoSetVol(data['stgs'][stgStr] - redValue, isSpk);
                setVol(isSpk);

                // set the volume slider
                setVolSldr(isSpk);
            }
        });

        // on mouseleave, disable the hover flag
        volSldrCtr.addEventListener('mouseleave', () => flags[hoverStr] = false);
    }

    // iterate through each setting slider
    for (const [index, volSldr] of [spkVolSldr, micVolSldr].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const boxStr = isSpk ? 'spkVolSldrBox' : 'micVolSldrBox';
        const dragStr = isSpk ? 'isSpkVolSldrDrag' : 'isMicVolSldrDrag';

        // on mousedown, enable the dragging flag and set the volume based on the pointer location
        volSldr.addEventListener('mousedown', (ptr) => {
            // set the volume
            pseudoSetVol(getPtrEventPct(ptr, boxes[boxStr]), isSpk);

            // set the volume slider
            setVolSldr(isSpk);

            flags[dragStr] = true;
        });
    }
}

/**
 * Initializes the setting container
 */
async function initStgCtr() {
    // get the settings, devices (speakers, microphones, webcams), displays, and the programs list for auto recording
    data['stgs'] = await atmpAsyncFunc(() => window['stgsAPI'].getAllStgsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 isInit
    data['disps'] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDispsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 isInit
    data['devs'] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDevsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 isInit

    // iterate through each stg tglgle swt
    for (const tglSwt of mostTglSwtes) {
        // get the stg tglgle fld and icon
        const tglFld = tglSwt.querySelector('.general-setting-toggle-field');
        const tglIcon = tglSwt.querySelector('.general-setting-toggle-icon > use');

        // load each stgs initial value from stored stgs
        tglFld.checked = data['stgs'][tglFld.name];

        // set the icon based on if the stg tglgle fld is checked
        tglFld.checked ? setIcon(tglIcon, 'check') : setIcon(tglIcon, 'close');
    }

    // load the initial value from stored stg
    darkModeTglFld.checked = data['stgs']['darkMode'];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeTglFld.checked) {
        setIcon(darkModeTglIcon, 'check');
        html.dataset.theme = 'dark';
    }
    else {
        setIcon(darkModeTglIcon, 'close');
        html.dataset.theme = 'light';
    }

    // iterate through each setting field
    for (const fld of [...mostFlds, capsDirFld, clipsDirFld, ...clipsFrmFlds, ...clipsWidthFlds, ...clipsHeightFlds]) {
        // load each initial setting value from the stored settings
        fld.value = data['stgs'][fld.name];
    }

    // iterate through each limit setting field
    for (const [index, limitFld] of [capsLimitFld, clipsLimitFld].entries()) {
        // get the captures or clips variable
        const totalLabel3 = index === 0 ? capsTotalLabel3 : clipsTotalLabel3;

        // load each initial setting value from the stored settings
        limitFld.value = data['stgs'][limitFld.name];
        totalLabel3.textContent = `/${data['stgs'][limitFld.name]} GB`;
    }

    // iterate through each display
    for (const [name, dispInfo] of Object.entries(data['disps'])) {
        // create a new setting field option
        const fldOption = document.createElement('option');

        // assign the name of the display to the value, set the text to the name and size
        fldOption.value = name;
        fldOption.text = `${name} (${dispInfo['sizeX']} x ${dispInfo['sizeY']}) @ (${dispInfo['posX']}, ${dispInfo['posY']})`;

        // append the child to the captures display setting field
        capsDispFld.appendChild(fldOption);
    }

    // load the initial setting value from the stored setting
    capsDispFld.value = data['stgs']['capturesDisplay'];

    // iterate through each program
    for (const [name, progInfo] of Object.entries(data['stgs']['programs'])) {
        // insert the general setting tile for programs
        insertGenStgTile(name, progInfo);
    }

    // iterate through each device setting field
    for (const [index, fld] of [spkFld, micFld].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const devStr = isSpk ? 'outs' : 'inps';
        const stgStr = isSpk ? 'speaker' : 'microphone';

        // iterate through each device
        for (const [name, _] of Object.entries(data['devs'][devStr])) {
            // create a new setting field option
            const fldOption = document.createElement('option');

            // assign the name of the device to the value and text
            fldOption.value = name;
            fldOption.text = name;

            // append the child to the device setting field
            fld.appendChild(fldOption);
        }
        
        // load the initial setting value from the stored setting
        fld.value = data['stgs'][stgStr];

        // set the volume slider
        setVolSldr(isSpk);
    }
}

/**
 * Inserts a general setting tile for the board of programs
 * 
 * @param {String} name - Full name of the program
 * @param {Object} progInfo - Program information including alternate name and icon path
 */
function insertGenStgTile(name, progInfo) {
    // get a clone of the general setting tile template
    const genStgTileClone = genStgTileTmpl.content.cloneNode(true);
    const genStgTile = genStgTileClone.querySelector('.general-setting-tile');
    const genStgProgIcon = genStgTileClone.querySelector('.general-setting-program-icon');

    // set the program icon source and alt
    genStgProgIcon.setAttribute('src', progInfo['iconPath']);
    genStgProgIcon.setAttribute('alt', `The icon for ${name}`);

    // set the program label
    genStgTileClone.querySelector('.general-setting-program-label').textContent = `${name}`;

    // on click, delete the program from the list
    genStgTileClone.querySelector('.general-setting-delete-btn').addEventListener('click', async () => { 
        // check if the operation was successful on the main process
        if (await atmpAsyncFunc(() => window['stgsAPI'].delProg(name))) {
            // delete the program from the programs list and remove the tile from the board
            delete data['stgs']['programs'][name];
            progsBoard.removeChild(genStgTile);
        }
    });

    // insert the tile before the add button
    progsBoard.insertBefore(genStgTile, progsAddBtn);
}

/**
 * Sets the speaker or microphone volume in the setting cache ONLY
 * 
 * @param {number} value - The new volume
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function pseudoSetVol(value, isSpk) {
    // get the speaker or microphone variables
    const volMin = isSpk ? SPEAKER_VOLUME_MIN : MICROPHONE_VOLUME_MIN;
    const volMax = isSpk ? SPEAKER_VOLUME_MAX : MICROPHONE_VOLUME_MAX;
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    data['stgs'][stgStr] = Math.max(volMin, Math.min(value, volMax));
}

/**
 * Sets the speaker or microphone volume in the main process setting
 * 
 * @param {boolean} isSpk - If the call is for speaker or microphone 
 */
async function setVol(isSpk) {
    // get the speaker or microphone variables
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    await atmpAsyncFunc(() => window['stgsAPI'].setStg(stgStr, data['stgs'][stgStr]));
}

/**
 * Sets the speaker or microphone volume slider thumb and overlay
 * 
 * @param {boolean} isSpk - If the call is for speaker or microphone 
 */
function setVolSldr(isSpk) {
    // get the speaker or microphone variables
    const boxStr = isSpk ? 'spkVolSldrBox' : 'micVolSldrBox';
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    // set the speaker volume thumb and overlay (trailing bar)
    setVolThumb(data['stgs'][stgStr] * boxes[boxStr]['width'], isSpk);
    setVolOvrl(data['stgs'][stgStr] * 100, isSpk);
}

/**
 * Sets the speaker or microphone volume slider overlay
 * 
 * @param {number} thumbLoc - The location of the slider thumb
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function setVolOvrl(thumbLoc, isSpk) {
    // get the speaker or microphone variables
    const volOvrl = isSpk ? spkVolOvrl : micVolOvrl;

    volOvrl.style.background = `linear-gradient(to right, var(--gstoverlay-lgradientcolor) ${thumbLoc}%, transparent ${thumbLoc}%`;
}

/**
 * Sets the speaker or microphone volume slider thumb
 * 
 * @param {number} thumbLoc - The location of the slider thumb
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function setVolThumb(thumbLoc, isSpk) {
    // get the speaker or microphone variables
    const volThumb = isSpk ? spkVolThumb : micVolThumb;

    volThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the speaker or microphone volume slider
 * 
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function updateVolSldr(isSpk) {
    // get the speaker or microphone variables
    const volSldr = isSpk ? spkVolSldr : micVolSldr;
    const boxStr = isSpk ? 'spkVolSldrBox' : 'micVolSldrBox';

    // get the new speaker volume slider bounding box
    boxes[boxStr] = getModBox(volSldr.getBoundingClientRect());
}