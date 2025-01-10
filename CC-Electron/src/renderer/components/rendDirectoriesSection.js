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
    videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesStatusLabel, capturesRightBtn, clipsGallery, clipsLeftBtn, clipsStatusLabel, clipsRightBtn, 
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
import { getReadableDuration } from './rendEditorSection.js';

/**
 * @exports initRendDirectoriesSection, loadCapturesGallery, updateCapturesGallery, toggleCapturesGalleryBtn, getReadableAge, loadClipsGallery, updateClipsGallery, toggleClipsGalleryBtn
 */
export { initRendDirectoriesSection, loadCapturesGallery, updateCapturesGallery, toggleCapturesGalleryBtn, getReadableAge, loadClipsGallery, updateClipsGallery, toggleClipsGalleryBtn }

/**
 * Initializes the directories section
 */
async function initRendDirectoriesSection() {
    initDirectoryGalleryEL();
    await attemptAsyncFunction(() => loadCapturesGallery(true), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    // await loadCapturesGallery(true);
    await attemptAsyncFunction(() => loadClipsGallery(true), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
    // await loadClipsGallery(true);
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
        capturesGallery.scrollBy({left: -boxes['capturesGalleryBox'].width, behavior: 'smooth'});
    });
    
    // on click, smoothly scroll the captures gallery right by approximately its width
    capturesRightBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: boxes['capturesGalleryBox'].width, behavior: 'smooth'});
    });

    // on scroll, toggle the clips gallery buttons
    capturesGallery.addEventListener('scroll', toggleCapturesGalleryBtn);

    // on scroll, scroll the clips gallery
    clipsGallery.addEventListener('wheel', (pointer) => {
        // prevent scrolling vertically on section container 1
        pointer.preventDefault();

        // scroll the clips gallery by approximately the video preview width
        if (pointer.deltaY < 0) {
            clipsGallery.scrollBy({left: -videoPreviewWidth});
        }
        else {
            clipsGallery.scrollBy({left: videoPreviewWidth});
        }
    });

    // on click, smoothly scroll the clips gallery left by approximately its width
    clipsLeftBtn.addEventListener('click', () => {
        clipsGallery.scrollBy({left: -boxes['clipsGalleryBox'].width, behavior: 'smooth'});
    });
    
    // on click, smoothly scroll the clips gallery right by approximately its width
    clipsRightBtn.addEventListener('click', () => {
        clipsGallery.scrollBy({left: boxes['clipsGalleryBox'].width, behavior: 'smooth'});
    });

    // on scroll, toggle the clips gallery buttons
    clipsGallery.addEventListener('scroll', toggleClipsGalleryBtn);
}

/**
 * Loads the captures gallery with video previews
 */
async function loadCapturesGallery(initialization) {
    // get the current date
    const currentDate = new Date();

    // remove every existing video preview from the captures gallery
    while (capturesGallery.children.length > 1)
    {
        capturesGallery.removeChild(capturesGallery.lastElementChild);
    }

    capturesStatusLabel.textContent = 'Loading...';
    capturesStatusLabel.classList.add('active');

    // get the videos
    data['captures'] = await attemptAsyncFunction(() => window.filesAPI.getAllCapturesData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, initialization);

    if (data['captures'].length === 0) {
        capturesStatusLabel.textContent = 'No Videos Found';
    }
    else {
        capturesStatusLabel.classList.remove('active');

        // for each video data
        for (const captureData of data['captures']) {
            // get a clone of the video preview template
            let videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);
            let videoPreviewContainer = videoPreviewClone.querySelector('.video-preview-ctr');
            let videoRenameBtn = videoPreviewClone.querySelector('.video-preview-rename-btn');
            let videoRenameIcon = videoPreviewClone.querySelector('.video-preview-rename-icon > use');
            let videoDeleteBtn = videoPreviewClone.querySelector('.video-preview-delete-btn');
            let videoDeleteIcon = videoPreviewClone.querySelector('.video-preview-delete-icon > use');

            // set the video source
            videoPreviewContainer.dataset.src = captureData['path'];
            // set the video thumbnail source
            videoPreviewClone.querySelector('.video-thumbnail-image').setAttribute('src', captureData['thumbnailPath']);
            // set the video duration
            videoPreviewClone.querySelector('.video-thumbnail-duration-label').textContent = getReadableDuration(captureData['duration']);
            // set the video game
            videoPreviewClone.querySelector('.video-preview-game-label').textContent = `${captureData['game']}`;
            // set the video age
            videoPreviewClone.querySelector('.video-preview-age-label').textContent = `${getReadableAge((currentDate - captureData['created']) / MSECONDS_IN_SECOND)}`;
            // set the video name with extension
            videoPreviewClone.querySelector('.video-preview-name-label').textContent = captureData['nameExt'];

            // on click, open the video in the editor section
            videoPreviewContainer.addEventListener('click', () => {
                // set the video player source
                videoPlayer.setAttribute('src', captureData['path']);

                // change the active content section to the editor section
                setActiveSection('editor');
            });

            // on mouse enter, change to the solid icon
            videoRenameBtn.addEventListener('mouseenter', () => setIcon(videoRenameIcon, 'edit-solid'));
            // on mouse leave, change to the regular icon
            videoRenameBtn.addEventListener('mouseleave', () => setIcon(videoRenameIcon, 'edit'));
            videoRenameBtn.addEventListener('click', () => {
            });

            // on mouse enter, change to the solid icon
            videoDeleteBtn.addEventListener('mouseenter', () => setIcon(videoDeleteIcon, 'delete-solid'));
            // on mouse leave, change to the regular icon
            videoDeleteBtn.addEventListener('mouseleave', () => setIcon(videoDeleteIcon, 'delete'));
            videoDeleteBtn.addEventListener('click', () => {
            });

            // append the video preview to the gallery
            capturesGallery.appendChild(videoPreviewClone);
        }
    }

    // on scroll, toggle the captures gallery buttons
    toggleCapturesGalleryBtn();
}

/**
 * updates the captures gallery
 */
function updateCapturesGallery() {
    let numVideoPreview;

    // get the new gallery bounding box
    boxes['capturesGalleryBox'] = capturesGallery.getBoundingClientRect();

    // calculate and set the gap between video previews based on the width
    numVideoPreview = Math.floor(boxes['capturesGalleryBox'].width / (videoPreviewWidth + MIN_GALLERY_GAP));
    capturesGallery.style.gap = `${(boxes['capturesGalleryBox'].width - (numVideoPreview * videoPreviewWidth)) / (numVideoPreview - 1)}px`;
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
    if (capturesGallery.scrollLeft < (capturesGallery.scrollWidth - Math.ceil(boxes['capturesGalleryBox'].width))) {
        capturesRightBtn.classList.add('active');
    }
    else {
        capturesRightBtn.classList.remove('active');
    }
}

/**
 * Loads the clips gallery with video previews
 */
async function loadClipsGallery(initialization) {
    // get the current date
    const currentDate = new Date();

    // remove every existing video preview from the clips gallery
    while (clipsGallery.children.length > 1)
    {
        clipsGallery.removeChild(clipsGallery.lastElementChild);
    }

    clipsStatusLabel.textContent = 'Loading...';
    clipsStatusLabel.classList.add('active');

    // get the videos
    data['clips'] = await attemptAsyncFunction(() => window.filesAPI.getAllClipsData(), ATTEMPTS, FAST_DELAY_IN_MSECONDS, initialization);

    if (data['clips'].length === 0) {
        clipsStatusLabel.textContent = 'No Videos Found';
    }
    else {
        clipsStatusLabel.classList.remove('active');

        // for each video data
        for (const clipData of data['clips']) {
            // get a clone of the video preview template
            let videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);
            let videoPreviewContainer = videoPreviewClone.querySelector('.video-preview-ctr');
            let videoRenameBtn = videoPreviewClone.querySelector('.video-preview-rename-btn');
            let videoRenameIcon = videoPreviewClone.querySelector('.video-preview-rename-icon > use');
            let videoDeleteBtn = videoPreviewClone.querySelector('.video-preview-delete-btn');
            let videoDeleteIcon = videoPreviewClone.querySelector('.video-preview-delete-icon > use');

            // set the video source
            videoPreviewContainer.dataset.src = clipData['path'];
            // set the video thumbnail source
            videoPreviewClone.querySelector('.video-thumbnail-image').setAttribute('src', clipData['thumbnailPath']);
            // set the video duration
            videoPreviewClone.querySelector('.video-thumbnail-duration-label').textContent = getReadableDuration(clipData['duration']);
            // set the video game
            videoPreviewClone.querySelector('.video-preview-game-label').textContent = `${clipData['game']}`;
            // set the video age
            videoPreviewClone.querySelector('.video-preview-age-label').textContent = `${getReadableAge((currentDate - clipData['created']) / MSECONDS_IN_SECOND)}`;
            // set the video name with extension
            videoPreviewClone.querySelector('.video-preview-name-label').textContent = clipData['nameExt'];

            // on click, open the video in the editor section
            videoPreviewContainer.addEventListener('click', () => {
                // set the video player source
                videoPlayer.setAttribute('src', clipData['path']);

                // change the active content section to the editor section
                setActiveSection('editor');
            });

            // on mouse enter, change to the solid icon
            videoRenameBtn.addEventListener('mouseenter', () => setIcon(videoRenameIcon, 'edit-solid'));
            // on mouse leave, change to the regular icon
            videoRenameBtn.addEventListener('mouseleave', () => setIcon(videoRenameIcon, 'edit'));
            videoRenameBtn.addEventListener('click', () => {
            });

            // on mouse enter, change to the solid icon
            videoDeleteBtn.addEventListener('mouseenter', () => setIcon(videoDeleteIcon, 'delete-solid'));
            // on mouse leave, change to the regular icon
            videoDeleteBtn.addEventListener('mouseleave', () => setIcon(videoDeleteIcon, 'delete'));
            videoDeleteBtn.addEventListener('click', () => {
            });

            // append the video preview to the gallery
            clipsGallery.appendChild(videoPreviewClone);
        }
    }

    // on scroll, toggle the clips gallery buttons
    toggleClipsGalleryBtn();
}

/**
 * updates the clips gallery
 */
function updateClipsGallery() {
    let numVideoPreview;

    // get the new gallery bounding box
    boxes['clipsGalleryBox'] = clipsGallery.getBoundingClientRect();

    // calculate and set the gap between video previews based on the width
    numVideoPreview = Math.floor(boxes['clipsGalleryBox'].width / (videoPreviewWidth + MIN_GALLERY_GAP));
    clipsGallery.style.gap = `${(boxes['clipsGalleryBox'].width - (numVideoPreview * videoPreviewWidth)) / (numVideoPreview - 1)}px`;
}

/**
 * Toggles the clips gallery button on or off (visually)
 */
function toggleClipsGalleryBtn() {
    // if there is more to scroll left, enable the button
    if (clipsGallery.scrollLeft > 0) {
        clipsLeftBtn.classList.add('active');
    }
    else {
        clipsLeftBtn.classList.remove('active');
    }
    
    // if there is more to scroll right, enable the button
    if (clipsGallery.scrollLeft < (clipsGallery.scrollWidth - Math.ceil(boxes['clipsGalleryBox'].width))) {
        clipsRightBtn.classList.add('active');
    }
    else {
        clipsRightBtn.classList.remove('active');
    }
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