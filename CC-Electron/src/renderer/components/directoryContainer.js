import { 
    GROW_FACTOR, REDUCE_FACTOR, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, saveLocationSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data 
} from './variables.js';

import { setSVG, getParsedTime, resizeAll } from './shared.js';

export { initDirectoryContainer, loadGallery, resizeGallery }

// handles loading of the video galleries
function initDirectoryContainer() {
    initDirectoryEL();
    
    loadGallery();
}

function initDirectoryEL() {
    capturesLeftBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: -boxes['galleryBox'].width, behavior: 'smooth'});
    });
    
    capturesRightBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: boxes['galleryBox'].width, behavior: 'smooth'});
    });
}

async function loadGallery() {
    data['videos'] = await window.filesAPI.getAllVideosData();

    // get the current date
    const currentDate = new Date();

    // clear the captures gallery
    while (capturesGallery.firstElementChild)
    {
        capturesGallery.removeChild(capturesGallery.lastElementChild);
    }

    for (const videoData of data['videos']) {
        // make clone of the video preview template
        const videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);
        const headerText = getReadableAge((currentDate - videoData['created']) / 1000);

        // fill in video data to the template
        videoPreviewClone.querySelector('.video-preview-ctr').dataset.src = videoData['path'];
        videoPreviewClone.querySelector('img').setAttribute('src', videoData['thumbnailPath']);
        videoPreviewClone.querySelector('h4').textContent = headerText;
        videoPreviewClone.querySelector('p').textContent = videoData['nameExt'];

        // on click, open the video in the editor
        videoPreviewClone.querySelector('.video-preview-ctr').addEventListener('click', () => {
            videoPlayer.setAttribute('src', videoData['path']);

            directoryContainer1.classList.remove('active');
            settingsContainer1.classList.remove('active');
            editorContainer1.classList.add('active');

            flags['videoLoaded'] = false;
        });

        // add the video preview to the gallery
        capturesGallery.appendChild(videoPreviewClone);
    }
}


function resizeGallery() {
    let numVideoPreview;

    boxes['galleryBox'] = capturesGallery.getBoundingClientRect();

    numVideoPreview = Math.floor(boxes['galleryBox'].width / (videoPreviewWidth + 5));
    capturesGallery.style.gap = `${(boxes['galleryBox'].width - (numVideoPreview * videoPreviewWidth)) / (numVideoPreview - 1)}px`;
}

function getReadableAge(time) {
    const parsedTime = getParsedTime(time);

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

