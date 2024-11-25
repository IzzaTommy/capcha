/**
 * Module for initializing the directories section
 * 
 * @module rendDirectoriesSection
 * @requires rendVariables
 * @requires rendSharedFunctions
 * @requires rendEditorSection
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
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, 
    mostSettingFields, mostSettingToggleSwitches, capturesPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';
import { getReadableDuration } from './rendEditorSection.js';

/**
 * @exports initRendDirectoriesSection, loadGallery, updateGallery, getReadableAge, toggleCapturesGalleryBtn
 */
export { initRendDirectoriesSection, loadGallery, updateGallery, getReadableAge, toggleCapturesGalleryBtn }

/**
 * Initializes the directories section
 */
async function initRendDirectoriesSection() {
    initDirectoryGalleryEL();
    await loadGallery(true);
}

/**
 * Initializes the directory gallery event listeners
 */
function initDirectoryGalleryEL() {

    // on scroll, scroll the captures gallery
    capturesGallery.addEventListener('wheel', (pointer) => {
        // prevent scrolling vertically on section container 1
        pointer.preventDefault();

        // scroll the captures gallery by approximately the video preview width
        if (pointer.deltaY < 0) {
            capturesGallery.scrollBy({left: -videoPreviewWidth});
        }
        else {
            capturesGallery.scrollBy({left: videoPreviewWidth});
        }
    });


    // on click, smoothly scroll the captures gallery left by approximately its width
    capturesLeftBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: -boxes['galleryBox'].width, behavior: 'smooth'});
    });
    
    // on click, smoothly scroll the captures gallery right by approximately its width
    capturesRightBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: boxes['galleryBox'].width, behavior: 'smooth'});
    });

    // on scroll, toggle the captures gallery buttons
    capturesGallery.addEventListener('scroll', toggleCapturesGalleryBtn);
}

/**
 * Loads the gallery with video previews
 */
async function loadGallery(initialization) {
    // the clone of the video preview template
    let videoPreviewClone;
    let videoPreviewContainer;

    // get the current date
    const currentDate = new Date();

    // get the videos
    data['videos'] = await attemptAsyncFunction(() => window.filesAPI.getAllVideosData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, initialization);

    // remove every existing video preview from the captures gallery
    while (capturesGallery.firstElementChild)
    {
        capturesGallery.removeChild(capturesGallery.lastElementChild);
    }

    // for each video data
    for (const videoData of data['videos']) {
        // get a clone of the video preview template
        videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);
        videoPreviewContainer = videoPreviewClone.querySelector('.video-preview-ctr');

        // set the video source
        videoPreviewContainer.dataset.src = videoData['path'];
        // set the video thumbnail source
        videoPreviewClone.querySelector('.video-thumbnail').setAttribute('src', videoData['thumbnailPath']);
        // set the video duration
        videoPreviewClone.querySelector('.video-duration-label').textContent = getReadableDuration(videoData['duration']);
        // set the video game
        videoPreviewClone.querySelector('.video-game-label').textContent = `${videoData['game']}`;
        // set the video age
        videoPreviewClone.querySelector('.video-age-label').textContent = `${getReadableAge((currentDate - videoData['created']) / MSECONDS_IN_SECOND)}`;
        // set the video name with extension
        videoPreviewClone.querySelector('.video-name-label').textContent = videoData['nameExt'];

        // on click, open the video in the editor section
        videoPreviewContainer.addEventListener('click', () => {
            // set the video player source
            videoPlayer.setAttribute('src', videoData['path']);

            // change the active content section to the editor section
            setActiveSection('editor');
        });

        // append the video preview to the gallery
        capturesGallery.appendChild(videoPreviewClone);
    }

    // on scroll, toggle the captures gallery buttons
    toggleCapturesGalleryBtn();
}

/**
 * updates the gallery
 */
function updateGallery() {
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
    if (parsedTime[0] > 999) {
        return '999d+ ago';
    }
    else {
        if (parsedTime[0] > 0) {
            return `${parsedTime[0]}d ago`;
        }
        else {
            if (parsedTime[1] > 0) {
                return `${parsedTime[1]}h ago`;
            }
            else {
                if (parsedTime[2] > 0) {
                    return `${parsedTime[2]}m ago`;
                }
                else {
                    return `Just Now`;
                }
            }
        }
    }
}

/**
 * Toggles the captures gallery button on or off (visually)
 */
function toggleCapturesGalleryBtn() {
    // if there is more to scroll left, enable the button
    if (capturesGallery.scrollLeft > 0) {
        capturesLeftBtn.classList.add('active');
    }
    else {
        capturesLeftBtn.classList.remove('active');
    }
    
    // if there is more to scroll right, enable the button
    if (capturesGallery.scrollLeft < (capturesGallery.scrollWidth - Math.ceil(boxes['galleryBox'].width))) {
        capturesRightBtn.classList.add('active');
    }
    else {
        capturesRightBtn.classList.remove('active');
    }
}