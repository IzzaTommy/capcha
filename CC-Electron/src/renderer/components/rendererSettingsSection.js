/**
 * Module for initializing the settings section for the renderer process
 * 
 * @module rendererSettingsSection
 * @requires rendererVariables
 * @requires rendererSharedFunctions
 * @requires rendererDirectoriesSection
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, NAV_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, PLAYBACK_CONTAINER_TIMEOUT, PLAYBACK_GROW_VALUE, PLAYBACK_REDUCE_VALUE, 
    VOLUME_MIN, VOLUME_MAX, VOLUME_GROW_VALUE, VOLUME_REDUCE_VALUE, VOLUME_MUTED, 
    PLAYBACK_RATE_DEF, PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_MIN_ZOOM, CLIP_MIN_LENGTH, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
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
    mostStgFlds, capsPathStgFld, capsLimitStgFld, capsDispStgFld, clipsPathStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolSldr, spkVolSldrWidth, spkVolOvrl, spkVolThumb, micStgFld, micVolSldr, micVolSldrWidth, micVolOvrl, micVolThumb, 
    boxes, data, flags, state, 
    initRendVars 
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
import { initRendDirsSect, loadGall, updateGall } from './rendererDirectoriesSection.js';

/**
 * @exports initRendStgsSect, setSpkVolSldr, setSpkVolOvrl, setSpkVolThumb, updateSpkVolSldr, setMicVolSldr, setMicVolOvrl, setMicVolThumb, updateMicVolSldr
 */
export { initRendStgsSect, setSpkVolSldr, setSpkVolOvrl, setSpkVolThumb, updateSpkVolSldr, setMicVolSldr, setMicVolOvrl, setMicVolThumb, updateMicVolSldr }

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
            stgTglFld.checked = data['stgs'][stgTglFld.name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(stgTglFld.name, stgTglFld.checked));

            // set the icon based on if the setting toggle field is checked
            stgTglFld.checked ? setIcon(stgTglIcon, 'check') : setIcon(stgTglIcon, 'close');
        });
    }

    // on change, set the setting, update the setting cache, and update the setting field value
    darkModeStgTglFld.addEventListener('change', async () => {
        darkModeStgTglFld.checked = data['stgs']['darkMode'] = await atmpAsyncFunc(() => window.stgsAPI.setStg('darkMode', darkModeStgTglFld.checked));

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
        stgFld.addEventListener('change', async () => {
            stgFld.value = data['stgs'][stgFld.name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(stgFld.name, stgFld.value));
        });
    }

    // iterate through each path setting field
    for (const [index, pathStgFld] of [capsPathStgFld, clipsPathStgFld].entries()) {
        // get the captures or clips variable
        const isCaps = index === 0 ? true : false;

        // on click, set the setting, update the setting cache, update the setting field value, and reload the gallery
        pathStgFld.addEventListener('click', async () => {
            data['stgs'][pathStgFld.name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(pathStgFld.name, pathStgFld.value));

            if (pathStgFld.value !== data['stgs'][pathStgFld.name]) {
                pathStgFld.value = data['stgs'][pathStgFld.name];

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
            limitStgFld.value = data['stgs'][limitStgFld.name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(limitStgFld.name, limitStgFld.value));

            totalLabel3.textContent = `/${data['stgs'][limitStgFld.name]} GB`;
        });
    }

    // iterate through each clips setting field (for settings present in the settings section and clip bar)
    for (const stgFlds of [clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds]) {
        // on change, set the setting, update the setting cache, and update the setting field value
        stgFlds[0].addEventListener('change', async () => {
            stgFlds[0].value = stgFlds[1].value = data['stgs'][stgFlds[0].name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(stgFlds[0].name, stgFlds[0].value));
        });

        // on change, set the setting, update the setting cache, and update the setting field value
        stgFlds[1].addEventListener('change', async () => {
            stgFlds[1].value = stgFlds[0].value = data['stgs'][stgFlds[1].name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(stgFlds[1].name, stgFlds[1].value));
        });
    }

    // on mouse down, enable the dragging flag
    spkVolSldr.addEventListener('mousedown', () => flags['spkVolSldrDrag'] = true);

    // on click, set the speaker volume
    spkVolSldr.addEventListener('click', async (pointer) => {
        // update the speaker volume and settings cache
        data['stgs']['speakerVolume'] = await atmpAsyncFunc(() => window.stgsAPI.setStg('speakerVolume', Math.max(SPEAKER_VOLUME_MIN, Math.min(getPtrEventPct(pointer, boxes['spkVolSldrBox']), SPEAKER_VOLUME_MAX))));

        // set the speaker volume slider
        setSpkVolSldr();
    });

    // on mouse down, enable the dragging flag
    micVolSldr.addEventListener('mousedown', () => flags['micVolSldrDrag'] = true);

    // on click, set the microphone volume
    micVolSldr.addEventListener('click', async (pointer) => {
        // update the microphone volume and settings cache
        data['stgs']['microphoneVolume'] = await atmpAsyncFunc(() => window.stgsAPI.setStg('microphoneVolume', Math.max(MICROPHONE_VOLUME_MIN, Math.min(getPtrEventPct(pointer, boxes['micVolSldrBox']), MICROPHONE_VOLUME_MAX))));

        // set the microphone volume slider
        setMicVolSldr();
    });
}

/**
 * Initializes the setting container
 */
async function initStgCtr() {
    let stgFldOption;

    // get the settings, devices (speakers, microphones, webcams), and displays
    data['stgs'] = await atmpAsyncFunc(() => window.stgsAPI.getAllStgsData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 init
    data['devs'] = await atmpAsyncFunc(() => window.stgsAPI.getAllDevicesData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 init
    data['disps'] = await atmpAsyncFunc(() => window.stgsAPI.getAllDisplaysData(), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, true);  // boolean1 init

    // iterate through each stg tglgle swt
    for (const stgTglSwt of mostStgTglSwtes) {
        // get the stg tglgle fld and icon
        let stgTglFld = stgTglSwt.querySelector('.general-setting-toggle-field');
        let stgTglIcon = stgTglSwt.querySelector('.general-setting-toggle-icon > use');

        // load each stgs initial value from stored stgs
        stgTglFld.checked = data['stgs'][stgTglFld.name];

        // set the icon based on if the stg tglgle fld is checked
        if (stgTglFld.checked) {
            setIcon(stgTglIcon, 'check');
        }
        else {
            setIcon(stgTglIcon, 'close');
        }
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
    for (const stgFld of [...mostStgFlds, capsPathStgFld, clipsPathStgFld, ...clipsFrmStgFlds, ...clipsWidthStgFlds, ...clipsHeightStgFlds]) {
        // load each initial setting value from the stored settings
        stgFld.value = data['stgs'][stgFld.name];
    }

    // iterate through each display
    for (const [key, value] of Object.entries(data['disps'])) {
        // create a new setting field option
        stgFldOption = document.createElement('option');

        // assign the name of the display to the value, set the text to the name and size
        stgFldOption.value = key;
        stgFldOption.text = key + ` (${value['sizeX']} x ${value['sizeY']}) @ (${value['posX']}, ${value['posY']})`;

        // append the child to the captures display setting field
        capsDispStgFld.appendChild(stgFldOption);
    }

    // load the initial setting value from the stored setting
    capsDispStgFld.value = data['stgs'][capsDispStgFld.name];

    // iterate through each speaker
    for (const [key, _] of Object.entries(data['devs']['outputs'])) {
        // create a new setting field option
        stgFldOption = document.createElement('option');

        // assign the name of the speaker to the value and text
        stgFldOption.value = key;
        stgFldOption.text = key;

        // append the child to the speaker setting field
        spkStgFld.appendChild(stgFldOption);
    }
    
    // load the initial setting value from the stored setting
    spkStgFld.value = data['stgs'][spkStgFld.name];

    // set the speaker volume slider
    setSpkVolSldr();

    // iterate through each microphone
    for (const [key, _] of Object.entries(data['devs']['inputs'])) {
        // create a new setting field option
        stgFldOption = document.createElement('option');

        // assign the name of the microphone to the value and text
        stgFldOption.value = key;
        stgFldOption.text = key;

        // append the child to the microphone setting field
        micStgFld.appendChild(stgFldOption);
    }
    
    // load the initial setting value from the stored setting
    micStgFld.value = data['stgs'][micStgFld.name];

    // set the microphone volume slider
    setMicVolSldr();
}

/**
 * Sets the speaker volume slider thumb and overlay
 */
function setSpkVolSldr() { 
    // set the speaker volume thumb and overlay (trailing bar)
    setSpkVolThumb(data['stgs']['spkVol'] * spkVolSldrWidth);
    setSpkVolOvrl(data['stgs']['spkVol'] * 100);
}

/**
 * Sets the speaker volume slider overlay
 * 
 * @param {number} thumbLocation - The location of the speaker volume thumb
 */
function setSpkVolOvrl(thumbLocation) {
    spkVolOvrl.style.background = `linear-gradient(to right, var(--gstoverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the speaker volume slider thumb
 * 
 * @param {number} thumbLocation - The location of the speaker volume thumb
 */
function setSpkVolThumb(thumbLocation) {
    spkVolThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the speaker volume slider
 */
function updateSpkVolSldr() {
    // get the new speaker volume slider bounding box
    boxes['spkVolSldrBox'] = spkVolSldr.getBoundingClientRect();
}

/**
 * Sets the microphone volume slider thumb and overlay
 */
function setMicVolSldr() { 
    // set the microphone volume thumb and overlay (trailing bar)
    setMicVolThumb(data['stgs']['micVol'] * micVolSldrWidth);
    setMicVolOvrl(data['stgs']['micVol'] * 100);
}

/**
 * Sets the microphone volume slider overlay
 * 
 * @param {number} thumbLocation - The location of the microphone volume thumb
 */
function setMicVolOvrl(thumbLocation) {
    micVolOvrl.style.background = `linear-gradient(to right, var(--gstoverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the microphone volume slider thumb
 * 
 * @param {number} thumbLocation - The location of the microphone volume thumb
 */
function setMicVolThumb(thumbLocation) {
    micVolThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the microphone volume slider
 */
function updateMicVolSldr() {
    // get the new microphone volume slider bounding box
    boxes['micVolSldrBox'] = micVolSldr.getBoundingClientRect();
}