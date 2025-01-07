/**
 * Module for initializing the settings section
 * 
 * @module rendSettingsSection
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendDirectoriesSection
 */
import {
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, PLAYBACK_RATE_MAPPING, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesRightBtn, clipsGallery, clipsLeftBtn, clipsRightBtn, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, clipLeftThumb, clipRightThumb, 
    clipBar, clipViewBtn, clipCreateBtn, clipToggleBtn, clipToggleIcon, 
    mostSettingFields, clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, capturesDisplaySettingField, 
    speakerSettingField, speakerVolumeSlider, speakerVolumeSliderWidth, speakerVolumeOverlay, speakerVolumeThumb, microphoneSettingField, microphoneVolumeSlider, microphoneVolumeSliderWidth, microphoneVolumeOverlay, microphoneVolumeThumb, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { initRendDirectoriesSection, loadCapturesGallery, updateCapturesGallery, toggleCapturesGalleryBtn, getReadableAge, loadClipsGallery, updateClipsGallery, toggleClipsGalleryBtn } from './rendDirectoriesSection.js';
import { initRendEditorSection, setVideoPlayerState, getPointerEventLoc, getPointerEventPct, getTruncDecimal, getReadableDuration, updateSeekSlider, updateVolumeSlider, updatePlaybackRateSlider, updateTimelineSlider } from './rendEditorSection.js';

/**
 * @exports initRendSettingsSection
 */
export { initRendSettingsSection, updateSpeakerVolumeSlider, updateMicrophoneVolumeSlider, setSpeakerVolumeSlider, setMicrophoneVolumeSlider }

/**
 * Initializes the settings section
 */
async function initRendSettingsSection() {
    initSettingContainerEL();
    await initSettingContainer();
}

/**
 * Initializes the setting container event listeners
 */
function initSettingContainerEL() {
    // iterate through each setting field
    for (const settingField of mostSettingFields) {
        // on change, validate the setting, save it, and set the saved value
        settingField.addEventListener('change', async () => {
            settingField.value = data['settings'][settingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingField.name, settingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        });
    }

    // iterate through each setting field
    for (const settingFields of [clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields]) {
        // on change, validate the setting, save it, and set the saved value
        settingFields[0].addEventListener('change', async () => {
            settingFields[0].value = settingFields[1].value = data['settings'][settingFields[0].name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingFields[0].name, settingFields[0].value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        });

        // on change, validate the setting, save it, and set the saved value
        settingFields[1].addEventListener('change', async () => {
            settingFields[1].value = settingFields[0].value = data['settings'][settingFields[1].name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingFields[1].name, settingFields[1].value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        });
    }

    // iterate through each setting toggle switch
    for (const settingToggleSwitch of mostSettingToggleSwitches) {
        // get the setting toggle field and icon
        let settingToggleField = settingToggleSwitch.querySelector('.setting-toggle-field');
        let settingToggleIcon = settingToggleSwitch.querySelector('.setting-toggle-icon > use');

        // on change, validate the setting, save it, and set the saved value
        settingToggleField.addEventListener('change', async () => {
            settingToggleField.checked = data['settings'][settingToggleField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingToggleField.name, settingToggleField.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

            // set the icon based on if the setting toggle field is checked
            if (settingToggleField.checked) {
                setIcon(settingToggleIcon, 'check');
            }
            else {
                setIcon(settingToggleIcon, 'close');
            }
        });
    }

    // on change, select directory from dialog, save it, and set the saved value
    capturesPathSettingField.addEventListener('click', async () => {
        data['settings'][capturesPathSettingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(capturesPathSettingField.name, capturesPathSettingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        if (capturesPathSettingField.value !== data['settings'][capturesPathSettingField.name]) {
            capturesPathSettingField.value = data['settings'][capturesPathSettingField.name];
            await attemptAsyncFunction(() => loadCapturesGallery(false), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
            // await loadCapturesGallery(false);
        }
    });

    // on change, select directory from dialog, save it, and set the saved value
    clipsPathSettingField.addEventListener('click', async () => {
        data['settings'][clipsPathSettingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(clipsPathSettingField.name, clipsPathSettingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        if (clipsPathSettingField.value !== data['settings'][clipsPathSettingField.name]) {
            clipsPathSettingField.value = data['settings'][clipsPathSettingField.name];

            await attemptAsyncFunction(() => loadClipsGallery(false), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

            // await loadClipsGallery(false);
        }
    });

    // on change, validate the dark mode setting, save it, and set the saved value
    darkModeSettingToggleField.addEventListener('change', async () => {
        darkModeSettingToggleField.checked = data['settings'][darkModeSettingToggleField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(darkModeSettingToggleField.name, darkModeSettingToggleField.checked), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        // change the theme attribute, depending on if dark mode is enabled
        if (darkModeSettingToggleField.checked) {
            setIcon(darkModeSettingToggleIcon, 'check');
            html.dataset.theme = 'dark';
        }
        else {
            setIcon(darkModeSettingToggleIcon, 'close');
            html.dataset.theme = 'light';
        }
    });

    // on change, validate the setting, save it, and set the saved value
    capturesDisplaySettingField.addEventListener('change', async () => {
        capturesDisplaySettingField.value = data['settings'][capturesDisplaySettingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(capturesDisplaySettingField.name, capturesDisplaySettingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });

    // on change, validate the setting, save it, and set the saved value
    speakerSettingField.addEventListener('change', async () => {
        speakerSettingField.value = data['settings'][speakerSettingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(speakerSettingField.name, speakerSettingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });

    // on mouse down, set the speaker volume slider dragging flag
    speakerVolumeSlider.addEventListener('mousedown', () => { 
        flags['speakerVolumeSliderDragging'] = true; 
    });

    // on click, set the speaker volume
    speakerVolumeSlider.addEventListener('click', async (pointer) => {
        // update the speaker volume and settings cache
        data['settings']['speakerVolume'] = await attemptAsyncFunction(() => window.settingsAPI.setSetting('speakerVolume', Math.max(0, Math.min(getPointerEventPct(pointer, boxes['speakerVolumeSliderBox']), 1))), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        // set the speaker volume slider
        setSpeakerVolumeSlider();
    });

    // on change, validate the setting, save it, and set the saved value
    microphoneSettingField.addEventListener('change', async () => {
        microphoneSettingField.value = data['settings'][microphoneSettingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(microphoneSettingField.name, microphoneSettingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    });

    // on mouse down, set the microphone volume slider dragging flag
    microphoneVolumeSlider.addEventListener('mousedown', () => { 
        flags['microphoneVolumeSliderDragging'] = true; 
    });

    // on click, set the microphone volume
    microphoneVolumeSlider.addEventListener('click', async (pointer) => {
        // update the microphone volume and settings cache
        data['settings']['microphoneVolume'] = await attemptAsyncFunction(() => window.settingsAPI.setSetting('microphoneVolume', Math.max(0, Math.min(getPointerEventPct(pointer, boxes['microphoneVolumeSliderBox']), 1))), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);

        // set the microphone volume slider
        setMicrophoneVolumeSlider();
    });
}

/**
 * Initializes the setting container
 */
async function initSettingContainer() {
    let settingFieldOption;

    // get the settings
    data['settings'] = await attemptAsyncFunction(() => window.settingsAPI.getAllSettingsData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, true);
    data['devices'] = await attemptAsyncFunction(() => window.settingsAPI.getAllDevicesData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, true);
    data['displays'] = await attemptAsyncFunction(() => window.settingsAPI.getAllDisplaysData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, true);

    // iterate through each setting field
    for (const settingField of mostSettingFields) {
        // load each settings initial value from stored settings
        settingField.value = data['settings'][settingField.name];
    }

    // iterate through each setting field
    for (const settingFields of [clipsFormatSettingFields, clipsWidthSettingFields, clipsHeightSettingFields]) {
        // load each settings initial value from stored settings
        settingFields[0].value = settingFields[1].value = data['settings'][settingFields[0].name];
    }

    // iterate through each setting toggle switch
    for (const settingToggleSwitch of mostSettingToggleSwitches) {
        // get the setting toggle field and icon
        let settingToggleField = settingToggleSwitch.querySelector('.setting-toggle-field');
        let settingToggleIcon = settingToggleSwitch.querySelector('.setting-toggle-icon > use');

        // load each settings initial value from stored settings
        settingToggleField.checked = data['settings'][settingToggleField.name];

        // set the icon based on if the setting toggle field is checked
        if (settingToggleField.checked) {
            setIcon(settingToggleIcon, 'check');
        }
        else {
            setIcon(settingToggleIcon, 'close');
        }
    }

    // load the initial value from stored setting
    darkModeSettingToggleField.checked = data['settings'][darkModeSettingToggleField.name];

    // change the theme attribute, depending on if dark mode is enabled
    if (darkModeSettingToggleField.checked) {
        setIcon(darkModeSettingToggleIcon, 'check');
        html.dataset.theme = 'dark';
    }
    else {
        setIcon(darkModeSettingToggleIcon, 'close');
        html.dataset.theme = 'light';
    }

    // load the initial value from stored setting
    capturesPathSettingField.value = data['settings'][capturesPathSettingField.name];
    clipsPathSettingField.value = data['settings'][clipsPathSettingField.name];


    for (const [key, value] of Object.entries(data['displays'])) {
        settingFieldOption = document.createElement('option');

        settingFieldOption.value = key;
        settingFieldOption.text = key + ` (${value['sizeX']} x ${value['sizeY']}) @ (${value['posX']}, ${value['posY']})`;

        capturesDisplaySettingField.appendChild(settingFieldOption);
    }
    
    capturesDisplaySettingField.value = data['settings'][capturesDisplaySettingField.name];


    for (const [key, _] of Object.entries(data['devices']['outputs'])) {
        settingFieldOption = document.createElement('option');

        settingFieldOption.value = key;
        settingFieldOption.text = key;

        speakerSettingField.appendChild(settingFieldOption);
    }
    
    speakerSettingField.value = data['settings'][speakerSettingField.name];

    // set the speaker volume slider
    setSpeakerVolumeSlider();

    for (const [key, _] of Object.entries(data['devices']['inputs'])) {
        settingFieldOption = document.createElement('option');

        settingFieldOption.value = key;
        settingFieldOption.text = key;

        microphoneSettingField.appendChild(settingFieldOption);
    }
    
    microphoneSettingField.value = data['settings'][microphoneSettingField.name];

    // set the microphone volume slider
    setMicrophoneVolumeSlider();
}

/**
 * Sets the speaker volume slider thumb and overlay
 */
function setSpeakerVolumeSlider() { 
    // set the speaker volume thumb and overlay (trailing bar)
    setSpeakerVolumeThumb(data['settings']['speakerVolume'] * speakerVolumeSliderWidth);
    setSpeakerVolumeOverlay(data['settings']['speakerVolume'] * 100);
}

/**
 * Sets the speaker volume slider overlay
 * 
 * @param {number} thumbLocation - The location of the speaker volume thumb
 */
function setSpeakerVolumeOverlay(thumbLocation) {
    speakerVolumeOverlay.style.background = `linear-gradient(to right, var(--stoverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the speaker volume slider thumb
 * 
 * @param {number} thumbLocation - The location of the speaker volume thumb
 */
function setSpeakerVolumeThumb(thumbLocation) {
    speakerVolumeThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the speaker volume slider
 */
function updateSpeakerVolumeSlider() {
    // get the new speaker volume slider bounding box
    boxes['speakerVolumeSliderBox'] = speakerVolumeSlider.getBoundingClientRect();
}

/**
 * Sets the microphone volume slider thumb and overlay
 */
function setMicrophoneVolumeSlider() { 
    // set the microphone volume thumb and overlay (trailing bar)
    setMicrophoneVolumeThumb(data['settings']['microphoneVolume'] * microphoneVolumeSliderWidth);
    setMicrophoneVolumeOverlay(data['settings']['microphoneVolume'] * 100);
}

/**
 * Sets the microphone volume slider overlay
 * 
 * @param {number} thumbLocation - The location of the microphone volume thumb
 */
function setMicrophoneVolumeOverlay(thumbLocation) {
    microphoneVolumeOverlay.style.background = `linear-gradient(to right, var(--stoverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the microphone volume slider thumb
 * 
 * @param {number} thumbLocation - The location of the microphone volume thumb
 */
function setMicrophoneVolumeThumb(thumbLocation) {
    microphoneVolumeThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the microphone volume slider
 */
function updateMicrophoneVolumeSlider() {
    // get the new microphone volume slider bounding box
    boxes['microphoneVolumeSliderBox'] = microphoneVolumeSlider.getBoundingClientRect();
}