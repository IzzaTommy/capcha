import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineMarker, timelineSlider, timelineState,  
    allSettingPill, saveLocationSettingPill, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';

import { getClickPercentage, setSVG, setTicks, getReadableTime, setVolumeSVG, setVideoState, setBoxWidths, setGalleryGap } from './shared.js';

export { initDirectoryContainer, loadGallery }

// handles loading of the video galleries
function initDirectoryContainer() {
    loadDirectoryEL();

    setGalleryGap();
    
    loadGallery();
}

function loadDirectoryEL() {
    capturesLeftBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: -boxes['galleryBox'].width, behavior: 'smooth'});
    });
    
    capturesRightBtn.addEventListener('click', () => {
        capturesGallery.scrollBy({left: boxes['galleryBox'].width, behavior: 'smooth'});
    });
}

function loadGallery() {
    // get the current date
    const currentDate = new Date();

    // clear the captures gallery
    while (capturesGallery.firstElementChild)
    {
        capturesGallery.removeChild(capturesGallery.lastElementChild);
    }

    for (const videoData of videosData) {
        // make clone of the video preview template
        const videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);
        let headerText;

        // calculate the age of the file relative to the current time
        const msDiff = currentDate - videoData['created'];
        const minDiff = Math.floor(msDiff / 60000);
        const hourDiff = Math.floor(minDiff / 60);
        const dayDiff = Math.floor(hourDiff / 24);

        if (dayDiff > 0) {
            headerText = `GAME - ${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
        }
        else {
            if (hourDiff > 0) {
                headerText = `GAME - ${hourDiff} hour${hourDiff > 1 ? 's' : ''} ago`;
            }
            else {
                headerText = `GAME - ${minDiff} minute${minDiff !== 1 ? 's' : ''} ago`;
            }
        }

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

            flags['videoMetaDataLoaded'] = false;
        });

        // add the video preview to the gallery
        capturesGallery.appendChild(videoPreviewClone);
    }
}