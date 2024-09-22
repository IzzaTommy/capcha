import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navExpander, navExpanderSVG, 
    directorySection, editorSection, settingsSection, 
    videoContainer, video, playbackInput, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeInput, timeSpan, durationSpan, speedInput, speedBtn, speedSpan, fullscreenBtn, fullscreenSVG, 
    timelineSVG, timelineInput, timelineState, 
    settingsInputSelect, saveLocationInput, capturesGallery, videoPreviewTemplate, 
    flags, 
    settingsCache, 
    videosData } from './variables.js';

import { getPercentage, swapSVG, drawTicks, getTimeText, setVolumeSVG, playPauseVideo } from './util.js';

export { initSettingsSection }

function initSettingsSection() {
    for (const setting of settingsInputSelect) {
        // load each settings initial value from stored settings
        setting.value = settingsCache[setting.name];

        // on change, validate the setting, save it, and set the saved value
        setting.addEventListener('change', async () => {
            settingsCache[setting.name] = await window.settingsAPI.setSetting(setting.name, setting.value);
            setting.value = settingsCache[setting.name];
        });
    }

    // load the initial value from stored settings
    saveLocationInput.value = settingsCache[saveLocationInput.name];

    // on change, select directory from dialog, save it, and set the saved value
    saveLocationInput.addEventListener('click', async () => {
        settingsCache[saveLocationInput.name] = await window.settingsAPI.setSetting(saveLocationInput.name, saveLocationInput.value);
        saveLocationInput.value = settingsCache[saveLocationInput.name];
    });
}