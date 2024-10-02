import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navExpander, navExpanderSVG, 
    directorySection, editorSection, settingsSection, 
    videoContainer, video, playbackInput, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeInput, timeSpan, durationSpan, speedInput, speedBtn, speedSpan, fullscreenBtn, fullscreenSVG, 
    timelineSVG, timelineInput, timelineState,  
    settingsInputSelect, saveLocationInput, capturesGallery, videoPreviewTemplate, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';


import { getPercentage, swapSVG, drawTicks, getTimeText, setVolumeSVG, playPauseVideo } from './util.js';

export { initWindow }

function initWindow() {
    // resize timeline viewbox on window resize
window.addEventListener('resize', () => {
    boxes['timelineInputBox'] = timelineInput.getBoundingClientRect();
    boxes['playbackInputBox'] = playbackInput.getBoundingClientRect();
    boxes['galleryBox'] = capturesGallery.getBoundingClientRect();

    console.log(boxes['timelineInputBox'])
    console.log(boxes['playbackInputBox'])
    console.log(boxes['galleryBox'])

    timelineSVG.setAttribute('viewbox', `0 0 ${boxes['timelineInputBox'].width} 60`);

    if (flags['videoMetaDataLoaded']) {
        drawTicks();
    }



    const x = boxes['galleryBox'].width;
    const y = 275.98;
    const z = Math.floor(x / (y + 5));
    const i = (x - (z * y)) / (z - 1);

    capturesGallery.style.gap = `${i}px`;
});
}