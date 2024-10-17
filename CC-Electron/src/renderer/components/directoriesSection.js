/**
 * Module for initializing the directories section
 * 
 * @module directoriesSection
 * @requires variables
 * @requires shared
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, animationFrame 
} from './variables.js';
import { setSVG, getParsedTime, resizeAll, setActiveSection } from './shared.js';

/**
 * @exports initDirectoriesSectionm loadGallery, resizeGallery
 */
export { initDirectoriesSection, loadGallery, resizeGallery }

/**
 * Initializes the directories section and its components
 */
function initDirectoriesSection() {
    initDirectoryBtnEL();
    loadGallery();
}

/**
 * Initializes the directory button event listeners
 */
function initDirectoryBtnEL() {
    // on click, smoothly scroll the captures gallery left by approximately its width
    capturesLeftBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: -boxes['galleryBox'].width, behavior: 'smooth'});
    });
    
    // on click, smoothly scroll the captures gallery right by approximately its width
    capturesRightBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: boxes['galleryBox'].width, behavior: 'smooth'});
    });
}

/**
 * Loads the gallery with video previews
 */
async function loadGallery() {
    // the clone of the video preview template
    let videoPreviewClone;

    // get the current date
    const currentDate = new Date();

    // get the videos
    data['videos'] = await window.filesAPI.getAllVideosData();

    // remove every video preview from the captures gallery
    while (capturesGallery.firstElementChild)
    {
        capturesGallery.removeChild(capturesGallery.lastElementChild);
    }

    // for each video data
    for (const videoData of data['videos']) {
        // get a clone of the video preview template
        videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);

        // set the video source
        videoPreviewClone.querySelector('.video-preview-ctr').dataset.src = videoData['path'];
        // set the video thumbnail source
        videoPreviewClone.querySelector('img').setAttribute('src', videoData['thumbnailPath']);
        // set the video age
        videoPreviewClone.querySelector('h4').textContent = getReadableAge((currentDate - videoData['created']) / MSECONDS_IN_SECOND);
        // set the video name with extension
        videoPreviewClone.querySelector('p').textContent = videoData['nameExt'];

        // on click, open the video in the editor section
        videoPreviewClone.querySelector('.video-preview-ctr').addEventListener('click', () => {
            // set the video player source
            videoPlayer.setAttribute('src', videoData['path']);

            // change the active content section to the editor section
            setActiveSection('editor');
        });

        // append the video preview to the gallery
        capturesGallery.appendChild(videoPreviewClone);
    }
}

/**
 * Resizes the gallery
 */
function resizeGallery() {
    let numVideoPreview;

    // get the new gallery bounding box
    boxes['galleryBox'] = capturesGallery.getBoundingClientRect();

    // calculate and set the gap between video previews based on the width
    numVideoPreview = Math.floor(boxes['galleryBox'].width / (videoPreviewWidth + MIN_GALLERY_GAP));
    capturesGallery.style.gap = `${(boxes['galleryBox'].width - (numVideoPreview * videoPreviewWidth)) / (numVideoPreview - 1)}px`;
}

/**
 * Gets the age in a readable format
 * 
 * @param {number} time - The age in seconds
 * @returns {string} The readable age
 */
function getReadableAge(time) {
    // gets the days, hours, minutes, and seconds of the time
    const parsedTime = getParsedTime(time);

    // return the age based on the largest non-zero time segment (days, hours, minutes)
    if (parsedTime[0] > 0) {
        return `GAME - ${parsedTime[0]} day${parsedTime[0] > 1 ? 's' : ''} ago`;
    }
    else {
        if (parsedTime[1] > 0) {
            return `GAME - ${parsedTime[1]} hour${parsedTime[1] > 1 ? 's' : ''} ago`;
        }
        else {
            return `GAME - ${parsedTime[2]} minute${parsedTime[2] !== 1 ? 's' : ''} ago`;
        }
    }
}