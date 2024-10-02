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

export { getPercentage, swapSVG, drawTicks, getTimeText, setVolumeSVG, playPauseVideo }

// gets the click percentage in a bounding box
function getPercentage(pointer, box) {
    return (pointer.clientX - box.left) / box.width;
}

// swaps the SVG of an element
//set
function swapSVG(elementSVG, name) {
    elementSVG.setAttribute('href', `../assets/svg/${name}.svg#${name}`);
}

// draws the interval ticks on the timeline
//set
function drawTicks() {
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
    while (timelineSVG.firstElementChild)
    {
        timelineSVG.removeChild(timelineSVG.lastElementChild);
    }

    for (let i = 0; i < numTicks + 1; i++) {
        // calculate the location of each tick
        const x = (-(startTime % interval) + (interval * i)) / (endTime - startTime);

        // not necessary but just removes unseen lines
        if (x > -1) {
            // generate the tick line
            const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tickLine.setAttribute('x1', x * boxes['timelineInputBox'].width);
            tickLine.setAttribute('y1', 10);
            tickLine.setAttribute('x2', x * boxes['timelineInputBox'].width);
            tickLine.setAttribute('y2', 50);
            timelineSVG.appendChild(tickLine);

            // generate the time text
            const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tickText.setAttribute('x', x * boxes['timelineInputBox'].width + 5);
            tickText.setAttribute('y', 45);
            tickText.textContent = getTimeText(interval * (i + firstTick));
            timelineSVG.appendChild(tickText);
        }

        for (let j = 0; j < subIntervalFactor; j++)
        {
            // calculate the location of each sub tick
            const x2 = interval / ((endTime - startTime) * subIntervalFactor);

            // again check negative and if the sub tick will collide with a regular tick
            if (((x2 * j) + x) > -1 && ((x2 * j) % x) != 0) {
                // generate the sub tick line
                const subTickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                subTickLine.setAttribute('x1', (x + x2 * j) * boxes['timelineInputBox'].width);
                subTickLine.setAttribute('y1', 15);
                subTickLine.setAttribute('x2', (x + x2 * j) * boxes['timelineInputBox'].width);
                subTickLine.setAttribute('y2', 30);
                timelineSVG.appendChild(subTickLine);
            }
        }
    }
}

// gets the time text from the number of seconds
function getTimeText(time) {
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
    if (video.muted) {
        swapSVG(volumeSVG, 'volume-off');
    }
    else {
        if (video.volume > 0.6) {
            swapSVG(volumeSVG, 'volume-up');
        }
        else {
            if (video.volume > 0.1) {
                swapSVG(volumeSVG, 'volume-down');
            }
            else {
                swapSVG(volumeSVG, 'volume-mute');
            }
        }
    }
}

// play/pause the video and change to the right SVG
//set
function playPauseVideo() {
    if (video.paused || video.ended) {
        video.play();
        swapSVG(playPauseSVG, 'pause');
    }
    else {
        video.pause();
        swapSVG(playPauseSVG, 'play-arrow');
    }
}