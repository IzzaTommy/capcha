/**
 * Module for initializing the settings section for the renderer process
 * 
 * @module rendererSettingsSection
 * @requires rendererVariables
 * @requires rendererSharedFunctions
 * @requires rendererDirectoriesSection
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, SPEAKER_VOLUME_GROW_VALUE, SPEAKER_VOLUME_REDUCE_VALUE, 
    MICROPHONE_VOLUME_GROW_VALUE, MICROPHONE_VOLUME_REDUCE_VALUE, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, 
    PLAYBACK_CONTAINER_GROW_VALUE, PLAYBACK_CONTAINER_REDUCE_VALUE, PLAYBACK_CONTAINER_TIMEOUT, 
    VIDEO_VOLUME_MIN, VIDEO_VOLUME_MAX, VIDEO_VOLUME_GROW_VALUE, VIDEO_VOLUME_REDUCE_VALUE, VIDEO_VOLUME_MUTED, 
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
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, getModBox, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
import { initRendDirsSect, loadGall, updateGall } from './rendererDirectoriesSection.js';

/**
 * @exports initRendStgsSect, pseudoSetVol, setVol, setVolStgSldr, setVolStgOvrl, setVolStgThumb, updateVolStgSldr
 */
export { initRendStgsSect, pseudoSetVol, setVol, setVolStgSldr, setVolStgOvrl, setVolStgThumb, updateVolStgSldr }

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
    for (const stgTglSwt of mostStgTglSwtes) {
        // get the setting toggle field and icon
        const stgTglFld = stgTglSwt.querySelector('.general-setting-toggle-field');
        const stgTglIcon = stgTglSwt.querySelector('.general-setting-toggle-icon > use');

        // on change, set the setting, update the setting cache, and update the setting field value
        stgTglFld.addEventListener('change', async () => {
            stgTglFld.checked = data['stgs'][stgTglFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(stgTglFld.name, stgTglFld.checked));

            // set the icon based on if the setting toggle field is checked
            stgTglFld.checked ? setIcon(stgTglIcon, 'check') : setIcon(stgTglIcon, 'close');
        });
    }

    // on change, set the setting, update the setting cache, and update the setting field value
    darkModeStgTglFld.addEventListener('change', async () => {
        darkModeStgTglFld.checked = data['stgs']['darkMode'] = await atmpAsyncFunc(() => window['stgsAPI'].setStg('darkMode', darkModeStgTglFld.checked));

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeStgTglFld.checked) {
            setIcon(darkModeStgTglIcon, 'check');
            html.dataset.theme = 'dark';
        }
        else {
            setIcon(darkModeStgTglIcon, 'close');
            html.dataset.theme = 'light';
        }
    });

    // iterate through each setting field
    for (const stgFld of [...mostStgFlds, capsDispStgFld, spkStgFld, micStgFld]) {
        // on change, set the setting, update the setting cache, and update the setting field value
        stgFld.addEventListener('change', async () => stgFld.value = data['stgs'][stgFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(stgFld.name, stgFld.value)));
    }

    // iterate through each directory setting field
    for (const [index, dirStgFld] of [capsDirStgFld, clipsDirStgFld].entries()) {
        // get the captures or clips variable
        const isCaps = index === 0;

        // on click, set the setting, update the setting cache, update the setting field value, and reload the gallery
        dirStgFld.addEventListener('click', async () => {
            data['stgs'][dirStgFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(dirStgFld.name, dirStgFld.value));

            if (dirStgFld.value !== data['stgs'][dirStgFld.name]) {
                dirStgFld.value = data['stgs'][dirStgFld.name];

                await atmpAsyncFunc(() => loadGall(isCaps, false));
            }
        });
    }

    // iterate through each limit setting field
    for (const [index, limitStgFld] of [capsLimitStgFld, clipsLimitStgFld].entries()) {
        // get the captures or clips variable
        const totalLabel3 = index === 0 ? capsTotalLabel3 : clipsTotalLabel3;

        // on change, set the setting, update the setting cache, update the setting field value, and update the total label
        limitStgFld.addEventListener('change', async () => {
            limitStgFld.value = data['stgs'][limitStgFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(limitStgFld.name, limitStgFld.value));

            totalLabel3.textContent = `/${data['stgs'][limitStgFld.name]} GB`;
        });
    }

    // iterate through each clips setting field (for settings present in the settings section and clip bar)
    for (const stgFlds of [clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds]) {
        // on change, set the setting, update the setting cache, and update the setting field value
        stgFlds[0].addEventListener('change', async () => stgFlds[0].value = stgFlds[1].value = data['stgs'][stgFlds[0].name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(stgFlds[0].name, stgFlds[0].value)));

        // on change, set the setting, update the setting cache, and update the setting field value
        stgFlds[1].addEventListener('change', async () => stgFlds[1].value = stgFlds[0].value = data['stgs'][stgFlds[1].name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(stgFlds[1].name, stgFlds[1].value)));
    }

    // iterate through each setting slider container
    for (const [index, volStgSldrCtr] of [spkVolStgSldrCtr, micVolStgSldrCtr].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const growValue = isSpk ? SPEAKER_VOLUME_GROW_VALUE : MICROPHONE_VOLUME_GROW_VALUE;
        const redValue = isSpk ? SPEAKER_VOLUME_REDUCE_VALUE : MICROPHONE_VOLUME_REDUCE_VALUE;
        const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';
        const hoverStr = isSpk ? 'isSpkVolStgSldrCtrHover' : 'isMicVolStgSldrCtrHover';

        // on mouseenter, enable the hover flag
        volStgSldrCtr.addEventListener('mouseenter', () => flags[hoverStr] = true);

        // on wheel, increase or decrease the volume
        volStgSldrCtr.addEventListener('wheel', (ptr) => {
            // prevent the default scrolling on the container
            ptr.preventDefault();

            // if scrolling 'up', increase the volume
            if (ptr.deltaY < 0) {
                // set the volume
                pseudoSetVol(data['stgs'][stgStr] + growValue, isSpk);
                setVol(isSpk);

                // set the volume slider
                setVolStgSldr(isSpk);
            }
            // else, decrease the speaker volume
            else {
                // set the volume
                pseudoSetVol(data['stgs'][stgStr] - redValue, isSpk);
                setVol(isSpk);

                // set the volume slider
                setVolStgSldr(isSpk);
            }
        });

        // on mouseleave, disable the hover flag
        volStgSldrCtr.addEventListener('mouseleave', () => flags[hoverStr] = false);
    }

    // iterate through each setting slider
    for (const [index, volStgSldr] of [spkVolStgSldr, micVolStgSldr].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const boxStr = isSpk ? 'spkVolStgSldrBox' : 'micVolStgSldrBox';
        const dragStr = isSpk ? 'isSpkVolStgSldrDrag' : 'isMicVolStgSldrDrag';

        // on mousedown, enable the dragging flag and set the volume based on the pointer location
        volStgSldr.addEventListener('mousedown', (ptr) => {
            // set the volume
            pseudoSetVol(getPtrEventPct(ptr, boxes[boxStr]), isSpk);

            // set the volume slider
            setVolStgSldr(isSpk);

            flags[dragStr] = true;
        });
    }
}

/**
 * Initializes the setting container
 */
async function initStgCtr() {
    let stgFldOption;

    // get the settings, devices (speakers, microphones, webcams), and displays
    data['stgs'] = await atmpAsyncFunc(() => window['stgsAPI'].getAllStgsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 isInit
    data['devs'] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDevsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 isInit
    data['disps'] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDispsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 isInit

    // iterate through each stg tglgle swt
    for (const stgTglSwt of mostStgTglSwtes) {
        // get the stg tglgle fld and icon
        let stgTglFld = stgTglSwt.querySelector('.general-setting-toggle-field');
        let stgTglIcon = stgTglSwt.querySelector('.general-setting-toggle-icon > use');

        // load each stgs initial value from stored stgs
        stgTglFld.checked = data['stgs'][stgTglFld.name];

        // set the icon based on if the stg tglgle fld is checked
        stgTglFld.checked ? setIcon(stgTglIcon, 'check') : setIcon(stgTglIcon, 'close');
    }

    // load the initial value from stored stg
    darkModeStgTglFld.checked = data['stgs']['darkMode'];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeStgTglFld.checked) {
        setIcon(darkModeStgTglIcon, 'check');
        html.dataset.theme = 'dark';
    }
    else {
        setIcon(darkModeStgTglIcon, 'close');
        html.dataset.theme = 'light';
    }

    // iterate through each setting field
    for (const stgFld of [...mostStgFlds, capsDirStgFld, clipsDirStgFld, ...clipsFrmStgFlds, ...clipsWidthStgFlds, ...clipsHeightStgFlds])
        // load each initial setting value from the stored settings
        stgFld.value = data['stgs'][stgFld.name];

    // iterate through each limit setting field
    for (const [index, limitStgFld] of [capsLimitStgFld, clipsLimitStgFld].entries()) {
        // get the captures or clips variable
        const totalLabel3 = index === 0 ? capsTotalLabel3 : clipsTotalLabel3;

        // load each initial setting value from the stored settings
        limitStgFld.value = data['stgs'][limitStgFld.name];
        totalLabel3.textContent = `/${data['stgs'][limitStgFld.name]} GB`;
    }

    // iterate through each display
    for (const [key, value] of Object.entries(data['disps'])) {
        // create a new setting field option
        stgFldOption = document.createElement('option');

        // assign the name of the display to the value, set the text to the name and size
        stgFldOption.value = key;
        stgFldOption.text = `${key} (${value['sizeX']} x ${value['sizeY']}) @ (${value['posX']}, ${value['posY']})`;

        // append the child to the captures display setting field
        capsDispStgFld.appendChild(stgFldOption);
    }

    // load the initial setting value from the stored setting
    capsDispStgFld.value = data['stgs']['capturesDisplay'];

    // iterate through each device setting field
    for (const [index, stgFld] of [spkStgFld, micStgFld].entries()) {
        // get the speaker or microphone variables
        const isSpk = index === 0;
        const devStr = isSpk ? 'outs' : 'inps';
        const stgStr = isSpk ? 'speaker' : 'microphone';

        // iterate through each device
        for (const [key, _] of Object.entries(data['devs'][devStr])) {
            // create a new setting field option
            stgFldOption = document.createElement('option');

            // assign the name of the device to the value and text
            stgFldOption.value = key;
            stgFldOption.text = key;

            // append the child to the device setting field
            stgFld.appendChild(stgFldOption);
        }
        
        // load the initial setting value from the stored setting
        stgFld.value = data['stgs'][stgStr];

        // set the volume slider
        setVolStgSldr(isSpk);
    }
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
function setVolStgSldr(isSpk) {
    // get the speaker or microphone variables
    const boxStr = isSpk ? 'spkVolStgSldrBox' : 'micVolStgSldrBox';
    const stgStr = isSpk ? 'speakerVolume' : 'microphoneVolume';

    // set the speaker volume thumb and overlay (trailing bar)
    setVolStgThumb(data['stgs'][stgStr] * boxes[boxStr]['width'], isSpk);
    setVolStgOvrl(data['stgs'][stgStr] * 100, isSpk);
}

/**
 * Sets the speaker or microphone volume slider overlay
 * 
 * @param {number} thumbLoc - The location of the slider thumb
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function setVolStgOvrl(thumbLoc, isSpk) {
    // get the speaker or microphone variables
    const volStgOvrl = isSpk ? spkVolStgOvrl : micVolStgOvrl;

    volStgOvrl.style.background = `linear-gradient(to right, var(--gstoverlay-lgradientcolor) ${thumbLoc}%, transparent ${thumbLoc}%`;
}

/**
 * Sets the speaker or microphone volume slider thumb
 * 
 * @param {number} thumbLoc - The location of the slider thumb
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function setVolStgThumb(thumbLoc, isSpk) {
    // get the speaker or microphone variables
    const volStgThumb = isSpk ? spkVolStgThumb : micVolStgThumb;

    volStgThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the speaker or microphone volume slider
 * 
 * @param {boolean} isSpk - If the call is for speaker or microphone
 */
function updateVolStgSldr(isSpk) {
    // get the speaker or microphone variables
    const volStgSldr = isSpk ? spkVolStgSldr : micVolStgSldr;
    const boxStr = isSpk ? 'spkVolStgSldrBox' : 'micVolStgSldrBox';

    // get the new speaker volume slider bounding box
    boxes[boxStr] = getModBox(volStgSldr.getBoundingClientRect());
}