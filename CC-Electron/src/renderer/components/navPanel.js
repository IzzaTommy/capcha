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

export { initNavPanel }

// handles navigation bar button event listeners
function initNavPanel() {
    // change the SVGs on hover, change active content on click
    directoryBtn.addEventListener('mouseenter', () => swapSVG(directorySVG, 'folder-solid'));
    directoryBtn.addEventListener('mouseleave', () => swapSVG(directorySVG, 'folder'));
    directoryBtn.addEventListener('click', () => {
        settingsSection.classList.remove('active');
        editorSection.classList.remove('active');
        directorySection.classList.add('active');

        video.pause();
    });

    // change the SVGs on hover, change active content on click
    settingsBtn.addEventListener('mouseenter', () => swapSVG(settingsSVG, 'settings-solid'));
    settingsBtn.addEventListener('mouseleave', () => swapSVG(settingsSVG, 'settings'));
    settingsBtn.addEventListener('click', () => {
        directorySection.classList.remove('active');
        editorSection.classList.remove('active');
        settingsSection.classList.add('active');

        video.pause();
    });

    // // change the SVGs on hover, change active content on click
    // recordBtn.addEventListener('mouseenter', () => swapSVG(recordSVG, 'record-solid'));
    // recordBtn.addEventListener('mouseleave', () => swapSVG(recordSVG, 'record'));
    // recordBtn.addEventListener('click', () => {
    //     directorySection.classList.remove('active');
    //     settingsSection.classList.remove('active');
    //     editorSection.classList.add('active');
    // });

    if (settingsCache['navBarActive'] === true) {
        navBar.classList.toggle('active');
        swapSVG(navExpanderSVG, 'arrow-back-ios');
    }

    // change the SVG on click, set nav bar to active
    navExpander.addEventListener('click', async () => {
        navBar.classList.toggle('active');

        if (navBar.classList.contains('active')) {
            swapSVG(navExpanderSVG, 'arrow-back-ios');
            settingsCache['navBarActive'] = await window.settingsAPI.setSetting('navBarActive', true);
        }
        else {
            swapSVG(navExpanderSVG, 'arrow-forward-ios');
            settingsCache['navBarActive'] = await window.settingsAPI.setSetting('navBarActive', false);
        }

        timelineSVG.setAttribute('viewbox', `0 0 ${timelineSVG.getBoundingClientRect().width} 60`);

        if (flags['videoMetaDataLoaded']) {
            drawTicks();
        }
    });
}