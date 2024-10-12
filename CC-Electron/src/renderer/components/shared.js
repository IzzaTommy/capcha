import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackSlider, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineTrack, timelineThumb, timelineState,  
    allSettingPill, saveLocationSettingPill, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';

export { getClickPercentage, setSVG, setTicks, getReadableTime, setVolumeSVG, setVideoState, setBoxWidths, setGalleryGap }

// gets the click percentage in a bounding box
function getClickPercentage(pointer, box) {
    return (pointer.clientX - box.left) / box.width;
}

// sets the SVG of an element
// SHARED BETWEEN SETVOLUMESVG, SETVIDEOSTATE, NAVBLOCK, AND 
function setSVG(elementSVG, name) {
    elementSVG.setAttribute('href', `../assets/svg/${name}.svg#${name}`);
}

// sets the interval ticks on the timeline
// SHARED BETWEEN SETBOXWIDTHS AND editorContainer1
function setTicks() {
    // get the current timeline state variables
    const startTime = timelineState.getStartTime();
    const endTime = timelineState.getEndTime();
    const interval = timelineState.getInterval();
    const subInterval = timelineState.getSubInterval();
    const subIntervalFactor = interval / subInterval;

    // get the expected number of ticks in the timeline
    const numTicks = ((endTime - (endTime % interval)) - (startTime - (startTime % interval))) / interval;

    // get the time of the first tick (e.g. 2:00, 5:00, etc.)
    const firstTick = (startTime - (startTime % interval)) / interval;

    // clear out the existing ticks in the SVG
    while (timelineTrack.firstElementChild)
    {
        timelineTrack.removeChild(timelineTrack.lastElementChild);
    }

    for (let i = 0; i < numTicks + 1; i++) {
        // calculate the location of each tick
        const x = (-(startTime % interval) + (interval * i)) / (endTime - startTime);

        // not necessary but just removes unseen lines
        if (x > -1) {
            // generate the tick line
            const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tickLine.setAttribute('x1', x * boxes['timelineTrackBox'].width);
            tickLine.setAttribute('y1', 10);
            tickLine.setAttribute('x2', x * boxes['timelineTrackBox'].width);
            tickLine.setAttribute('y2', 50);
            timelineTrack.appendChild(tickLine);

            // generate the time text
            const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tickText.setAttribute('x', x * boxes['timelineTrackBox'].width + 5);
            tickText.setAttribute('y', 45);
            tickText.textContent = getReadableTime(interval * (i + firstTick));
            timelineTrack.appendChild(tickText);
        }

        for (let j = 0; j < subIntervalFactor; j++)
        {
            // calculate the location of each sub tick
            const x2 = interval / ((endTime - startTime) * subIntervalFactor);

            // again check negative and if the sub tick will collide with a regular tick
            if (((x2 * j) + x) > -1 && ((x2 * j) % x) != 0) {
                // generate the sub tick line
                const subTickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                subTickLine.setAttribute('x1', (x + x2 * j) * boxes['timelineTrackBox'].width);
                subTickLine.setAttribute('y1', 15);
                subTickLine.setAttribute('x2', (x + x2 * j) * boxes['timelineTrackBox'].width);
                subTickLine.setAttribute('y2', 30);
                timelineTrack.appendChild(subTickLine);
            }
        }
    }
}

// gets the formatted time from the number of seconds
// SHARED BETWEEN SETTICKS AND editorContainer1
function getReadableTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
        return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    else {
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

// set the SVG based on volume
function setVolumeSVG() {
    if (videoPlayer.muted) {
        setSVG(volumeSVG, 'volume-off');
    }
    else {
        if (videoPlayer.volume > 0.6) {
            setSVG(volumeSVG, 'volume-up');
        }
        else {
            if (videoPlayer.volume > 0.1) {
                setSVG(volumeSVG, 'volume-down');
            }
            else {
                setSVG(volumeSVG, 'volume-mute');
            }
        }
    }
}

// play/pause the video and change to the right SVG
function setVideoState() {
    if (videoPlayer.paused || videoPlayer.ended) {
        videoPlayer.play();
        setSVG(playPauseSVG, 'pause');
    }
    else {
        videoPlayer.pause();
        setSVG(playPauseSVG, 'play-arrow');
    }
}

// update the content for boxes that are width dependent
// SHARED BETWEEN VIEWPORT, NAVBLOCK
function setBoxWidths() {
    // update the timeline, playback, and gallery boxes
    boxes['timelineTrackBox'] = timelineTrack.getBoundingClientRect();
    boxes['playbackSliderBox'] = playbackSlider.getBoundingClientRect();
    boxes['galleryBox'] = capturesGallery.getBoundingClientRect();

    // update the timeline marker viewbox
    timelineTrack.setAttribute('viewbox', `0 0 ${boxes['timelineTrackBox'].width} 60`);

    // reset the ticks on the timeline marker
    if (flags['videoMetaDataLoaded']) {
        setTicks();
    }

    setGalleryGap();
}

// update the gaps between video previews in the gallery
// SHARED BETWEEN SETBOXWIDTHS AND DIRECTORYSECTION
function setGalleryGap() {
    let numVideoPreview;

    numVideoPreview = Math.floor(boxes['galleryBox'].width / (videoPreviewWidth + 5));
    capturesGallery.style.gap = `${(boxes['galleryBox'].width - (numVideoPreview * videoPreviewWidth)) / (numVideoPreview - 1)}px`;
}