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

export { initCarouselContainer }

// handles loading of the video galleries
function initCarouselContainer() {
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
            video.setAttribute('src', videoData['path']);

            directorySection.classList.remove('active');
            settingsSection.classList.remove('active');
            editorSection.classList.add('active');

            flags['videoMetaDataLoaded'] = false;
        });

        // add the video preview to the gallery
        capturesGallery.appendChild(videoPreviewClone);
    }








    const x = boxes['galleryBox'].width;
    const y = 275.98;
    const z = Math.floor(x / (y + 5));
    const i = (x - (z * y)) / (z - 1);

    capturesGallery.style.gap = `${i}px`;
}



const leftJumper = document.querySelector('#btn-captures-directory-left');
const rightJumper = document.querySelector('#btn-captures-directory-right');

leftJumper.addEventListener('click', () => {
    capturesGallery.scrollBy({left: -boxes['galleryBox'].width, behavior: 'smooth'});
});

rightJumper.addEventListener('click', () => {
    capturesGallery.scrollBy({left: boxes['galleryBox'].width, behavior: 'smooth'});
});