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

export { initEditorContainer, setAllThumbs, setTimelineOverlay, resizePlaybackSlider, resizeTimelineSlider}

function initEditorContainer() {
    initVideoContainer();
    initTimelineContainer();
}

function initVideoContainer() {
    loadVideoEL();
}

function initTimelineContainer() {
    loadTimelineEL();
}

let requestID;

function loadVideoEL() {
    /* ---------- video container event listeners ---------- */
    // changes SVGs, accounts for exiting fullscreen using ESC key
    videoContainer.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            setSVG(fullscreenSVG, 'fullscreen-exit');
            resizePlaybackSlider();
        }
        else {
            setSVG(fullscreenSVG, 'fullscreen');
            resizePlaybackSlider();
        }
    });








    /* ---------- video event listeners ---------- */
    //
    videoPlayer.addEventListener('play', () => {
        // allow default opacity behavior
        playbackContainer.style.opacity = "";

        // sync the slider thumbs to each frame change of the video
        requestID = requestAnimationFrame(syncThumbs);
    });

    //
    videoPlayer.addEventListener('pause', () => {
        // show the playback container
        playbackContainer.style.opacity = "1";

        // cancel the sync to prevent unnecessary computations
        cancelAnimationFrame(requestID);
    });

    // play/pause the video, update SVGs
    videoPlayer.addEventListener('click', () => setVideoPlayer());




    //
    videoPlayer.addEventListener('timeupdate', () => {
        if (flags['videoLoaded']) {
            // check if the video has reached the end, set it back the start, and play
            if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();
    
                //could also check for if the video is playing
                videoPlayer.pause();
                setSVG(playPauseSVG, 'play-arrow');
    
                setAllThumbs();
            }
    
            // update the video time text
            currentTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
        }
        else {
            videoPlayer.pause();
        }
    });


    // wait for the video meta data to load 
    videoPlayer.addEventListener('loadedmetadata', () => {
        // set the timeline state and draw the ticks
        timelineState.update(0, getTruncDecimal(videoPlayer.duration, 6));
        setTimelineOverlay();

        // set the default timer/duration
        currentTimeLabel.textContent = '0:00';
        totalTimeLabel.textContent = `/${getReadableDuration(videoPlayer.duration)}`;

        // indicate the video has loaded
        flags['videoLoaded'] = true;

        // auto play video
        setVideoPlayer();
    });

    /* ---------- playback bar event listeners ---------- */
    // change the video time based on the click location of the timeline
    playbackSlider.addEventListener('click', (pointer) => {
        // get the time based on click location of the playback slider
        const newTime = videoPlayer.duration * getPointerPct(pointer, boxes['playbackSliderBox']);

        // make sure clicks on the playback slider are within the timeline's start and end times
        videoPlayer.currentTime = (newTime < timelineState.getStartTime() || newTime >= timelineState.getEndTime()) ? timelineState.getStartTime() : newTime;

        // update the sliders
        setAllThumbs();
    });

    // create a hover highlight based on pointer location
    playbackSlider.addEventListener('mousemove', (pointer) => {
        const playbackSliderPct = getPointerPct(pointer, boxes['playbackSliderBox']) * 100;
        
        playbackTrack.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${playbackSliderPct}%, transparent ${playbackSliderPct}%)`;
    });

    // revert the hover hightlight
    playbackSlider.addEventListener('mouseleave', () => {
        playbackTrack.style.backgroundImage = 'none';
    });





    // play/pause the video, update SVGs
    playPauseBtn.addEventListener('click', () => setVideoPlayer());

    // update volume mute and SVG
    volumeBtn.addEventListener('click', () => {
        // unmute if the video is muted
        if (videoPlayer.muted) {
            videoPlayer.muted = false;
            
            // change volume to 0.1 if it was 0
            if (videoPlayer.volume === 0) {
                videoPlayer.volume = 0.1;
                data['settings']['volume'] = videoPlayer.volume;
            }
            
            // update the volume input slider to match volume
            volumeSlider.stepUp(videoPlayer.volume * 100);
        } 
        else {
            // mute the video
            videoPlayer.muted = true;
            
            // update the volume input slider to match volume
            volumeSlider.stepDown(videoPlayer.volume * 100);
        }

        // cache the mute status
        data['settings']['volumeMuted'] = videoPlayer.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // update based on volume slider input
    volumeSlider.addEventListener('input', () => {
        // mute video if volume is 0
        videoPlayer.muted = volumeSlider.value == 0;
        // set the video volume and cache volume data
        videoPlayer.volume = volumeSlider.value;
        data['settings']['volume'] = videoPlayer.volume;
        data['settings']['volumeMuted'] = videoPlayer.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // change playback speed/text based on speed slider input
    speedSlider.addEventListener('input', () => {
        switch (speedSlider.value) {
            case '-2':
                videoPlayer.playbackRate = 0.2;
                speedLabel.textContent = '0.2';
                break;
            case '-1':
                videoPlayer.playbackRate = 0.5;
                speedLabel.textContent = '0.5';
                break;
            case '0':
                videoPlayer.playbackRate = 0.7;
                speedLabel.textContent = '0.7';
                break;
            default:
                videoPlayer.playbackRate = speedSlider.value;
                speedLabel.textContent = speedSlider.value;
        }
    });

    // revert playback speed/text/speed slider to normal speed
    speedBtn.addEventListener('click', () => {
        videoPlayer.playbackRate = 1;
        speedLabel.textContent = '1';

        if (speedSlider.value < 1) {
            speedSlider.stepUp(Math.abs(speedSlider.value - 1));
        }
        else {
            speedSlider.stepDown(speedSlider.value - 1);
        }
    });

    // toggle video fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement !== null) {
            document.exitFullscreen();
        } 
        else {
            videoContainer.requestFullscreen();
        }
    });

    // change the default volume
    videoPlayer.volume = data['settings']['volume'];
    videoPlayer.muted = data['settings']['volumeMuted']
    if (!videoPlayer.muted) {
        volumeSlider.stepUp(videoPlayer.volume * 100);
    }
    
    setVolumeSVG();
}

/* ---------- timeline event listeners ---------- */
function loadTimelineEL() {
    // change the video time based on the click location of the timeline
    timelineTrack.addEventListener('click', (pointer) => {
        // get the time based on click location of the playback slider
        videoPlayer.currentTime = timelineState.getDuration() * getPointerPct(pointer, boxes['timelineSliderBox']) + timelineState.getStartTime();

        // update the sliders
        setAllThumbs();
    });

    // "zoom" in and out of the timeline with the scroll wheel
    timelineTrack.addEventListener('wheel', (pointer) => {
        // get the timeline's start time, end time, and duration
        const startTime = timelineState.getStartTime();
        const endTime = timelineState.getEndTime();
        const duration = timelineState.getDuration();

        // check if the scroll was within the timeline range
        if (pointer.clientX > boxes['timelineSliderBox'].left && pointer.clientX < boxes['timelineSliderBox'].right) {
            // get the percentage of the timeline where the event occurred
            const percentage = getPointerPct(pointer, boxes['timelineSliderBox']);
            
            // check if the pointer scrolled up ("zoom in")
            if (pointer.deltaY < 0) {
                // check if timeline is not at maximum zoom
                if (duration > 30) {
                    // calculate the new start/end times and duration
                    const newStartTime = startTime + (REDUCE_FACTOR * duration * percentage);
                    const newEndTime = endTime - (REDUCE_FACTOR * duration * (1 - percentage));
                    const newDuration = newEndTime - newStartTime;
                    
                    // if the new duration would be less than 30s, then set the zoom to 30s
                    timelineState.update(
                        getTruncDecimal((newDuration < 30) ? newStartTime - (30 - newDuration) * percentage : newStartTime, 6),
                        getTruncDecimal((newDuration < 30) ? newStartTime - (30 - newDuration) * percentage + 30 : newEndTime, 6)
                    );
                    
                    // check if the scrubber would be out of the timeline, put it back in bounds
                    videoPlayer.currentTime = Math.max(timelineState.getStartTime(), Math.min(videoPlayer.currentTime, timelineState.getEndTime()));

                    // redraw the tick marks
                    setTimelineOverlay();

                    // update the sliders
                    setAllThumbs();

                    // update the time label
                    currentTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
                }
            } 
            else {
                // check if the timeline is not at minimum zoom
                if (duration < videoPlayer.duration) {
                    // calculate the new start and end times
                    const newStartTime = startTime - (GROW_FACTOR * duration * percentage);
                    const newEndTime = endTime + (GROW_FACTOR * duration * (1 - percentage));
                    
                    // check if "zoom out" would bring time the time out of bounds
                    if (newStartTime < 0) {
                        // reallocate grow factor to the end time if needed
                        timelineState.update(
                            0, 
                            getTruncDecimal(Math.min(videoPlayer.duration, Math.abs(newStartTime) + newEndTime), 6)
                        );
                    } 
                    else {
                        // reallocate grow factor to the start time if needed
                        timelineState.update(
                            getTruncDecimal(newEndTime > videoPlayer.duration ? Math.max(0, newStartTime - (newEndTime - videoPlayer.duration)) : newStartTime, 6),
                            getTruncDecimal(Math.min(videoPlayer.duration, newEndTime), 6)
                        );
                    }
                             
                    // check if the scrubber would be out of the timeline, put it back in bounds
                    videoPlayer.currentTime = Math.max(timelineState.getStartTime(), Math.min(videoPlayer.currentTime, timelineState.getEndTime()));

                    // redraw the tick marks
                    setTimelineOverlay();

                    // update the sliders
                    setAllThumbs();

                    // update the time label
                    currentTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
                }
            }
        }
    });

    //
    timelineThumb.addEventListener('mousedown', () => { 
        flags['timelineDragging'] = true; 
        wasPaused = videoPlayer.paused;
    });

    //
    timelineTrack.addEventListener('mousedown', () => { 
        flags['timelineDragging'] = true; 
        wasPaused = videoPlayer.paused;
    });

    //
    playbackSlider.addEventListener('mousedown', () => { 
        flags['playbackDragging'] = true; 
        wasPaused = videoPlayer.paused;
    });

    //
    document.addEventListener('mouseup', () => { 
        if (flags['timelineDragging'] == true || flags['playbackDragging'] == true) {
            flags['timelineDragging'] = false; 
            flags['playbackDragging'] = false;

            // check if the video has reached the end, set it back the start, and play
            if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();

                //could also check for if the video is playing
                videoPlayer.pause();
                setSVG(playPauseSVG, 'play-arrow');

                setAllThumbs();
            }
            else {
                if (!wasPaused) {
                    videoPlayer.play();
                    setSVG(playPauseSVG, 'pause');
                }
            }

            // update the video time text
            currentTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);

        }
    });

    let wasPaused = false;

    //
    document.addEventListener('mousemove', (pointer) => {
        if (flags['timelineDragging']) {
            videoPlayer.pause();
            setSVG(playPauseSVG, 'play-arrow');

            // get the percentage of the timeline where the event occurred
            let percentage;
            // get the mouse X location relative to the timeline start
            let pointerX = pointer.clientX - boxes['timelineSliderBox'].left;
            
            // make sure the scrubber is within the bounds of the timeline
            if (pointerX < 0) {
                pointerX = 0;
                percentage = 0;
            } 
            else {
                if (pointerX > boxes['timelineSliderBox'].width) {
                    pointerX = boxes['timelineSliderBox'].width;
                    percentage = 1;
                } 
                else {
                    percentage = getPointerPct(pointer, boxes['timelineSliderBox']);
                }
            }
            
            // move the scrubber to the right position
            timelineThumb.style.transform = `translateX(${pointerX}px)`;
            
            // update the video time based on position of the scrubber
            videoPlayer.currentTime = timelineState.getStartTime() + percentage * timelineState.getDuration();

            // update the sliders
            setAllThumbs();
        }

        if (flags['playbackDragging']) {

            videoPlayer.pause();
            setSVG(playPauseSVG, 'play-arrow');

            // get the percentage of the timeline where the event occurred
            let percentage;
            // get the mouse X location relative to the timeline start
            let pointerX = pointer.clientX - boxes['playbackSliderBox'].left;
            
            // make sure the scrubber is within the bounds of the timeline
            if (pointerX < 0) {
                pointerX = 0;
                percentage = 0;
            } 
            else {
                if (pointerX > boxes['playbackSliderBox'].width) {
                    pointerX = boxes['playbackSliderBox'].width;
                    percentage = 1;
                } 
                else {
                    percentage = getPointerPct(pointer, boxes['playbackSliderBox']);
                }
            }
            
            // move the scrubber to the right position
            playbackThumb.style.transform = `translateX(${pointerX}px)`;
            
            // update the video time based on position of the scrubber
            videoPlayer.currentTime = percentage * videoPlayer.duration;

            // update the sliders
            setAllThumbs();
        }
    });
}

// sync the thumbs for the playback and timeline sliders
function syncThumbs() {
    setAllThumbs();

    // request the next animation frame if the video is still playing
    if (!videoPlayer.paused && !videoPlayer.ended) {
        requestID = requestAnimationFrame(syncThumbs);
    }
}







function getTruncDecimal(value, places) {
    return Math.trunc(value * Math.pow(10, places)) / Math.pow(10, places);
}

// gets the percentage location of the interaction in a bounding box
function getPointerPct(pointer, box) {
    return (pointer.clientX - box.left) / box.width;
}


// update the playback thumb position based on the current video time
function setPlaybackThumb() {
    playbackThumb.style.transform = `translateX(${videoPlayer.currentTime / videoPlayer.duration * boxes['playbackSliderBox'].width}px)`;
}

// update the timeline thumb position based on the current video time and timeline bounds
function setTimelineThumb() {
    const percentage = (videoPlayer.currentTime - timelineState.getStartTime()) / timelineState.getDuration();

    if (percentage < 0) {
        timelineThumb.style.transform = `translateX(0px)`;
    }
    else {
        if (percentage > 1) {
            timelineThumb.style.transform = `translateX(${boxes['timelineSliderBox'].width}px)`;
        }
        else {
            timelineThumb.style.transform = `translateX(${percentage * boxes['timelineSliderBox'].width}px)`;
        }
    }
}

function setAllThumbs() {
    setPlaybackThumb();
    setTimelineThumb();
}

// sets the interval ticks on the timeline
function setTimelineOverlay() {
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
    while (timelineOverlay.firstElementChild)
    {
        timelineOverlay.removeChild(timelineOverlay.lastElementChild);
    }

    for (let i = 0; i < numTicks + 1; i++) {
        // calculate the location of each tick
        const x = (-(startTime % interval) + (interval * i)) / (endTime - startTime);

        // not necessary but just removes unseen lines
        if (x > -1) {
            // generate the tick line
            const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tickLine.setAttribute('x1', x * boxes['timelineSliderBox'].width);
            tickLine.setAttribute('y1', 10);
            tickLine.setAttribute('x2', x * boxes['timelineSliderBox'].width);
            tickLine.setAttribute('y2', 50);
            timelineOverlay.appendChild(tickLine);

            // generate the time text
            const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tickText.setAttribute('x', x * boxes['timelineSliderBox'].width + 5);
            tickText.setAttribute('y', 45);
            tickText.textContent = getReadableDuration(interval * (i + firstTick));
            timelineOverlay.appendChild(tickText);
        }

        for (let j = 0; j < subIntervalFactor; j++)
        {
            // calculate the location of each sub tick
            const x2 = interval / ((endTime - startTime) * subIntervalFactor);

            // again check negative and if the sub tick will collide with a regular tick
            if (((x2 * j) + x) > -1 && ((x2 * j) % x) != 0) {
                // generate the sub tick line
                const subTickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                subTickLine.setAttribute('x1', (x + x2 * j) * boxes['timelineSliderBox'].width);
                subTickLine.setAttribute('y1', 15);
                subTickLine.setAttribute('x2', (x + x2 * j) * boxes['timelineSliderBox'].width);
                subTickLine.setAttribute('y2', 30);
                timelineOverlay.appendChild(subTickLine);
            }
        }
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



//change this
// play/pause the video and change to the right SVG
function setVideoPlayer() {
    if (videoPlayer.paused || videoPlayer.ended) {
        videoPlayer.play();
        setSVG(playPauseSVG, 'pause');
    }
    else {
        videoPlayer.pause();
        setSVG(playPauseSVG, 'play-arrow');
    }
}





function resizeTimelineSlider() {
    boxes['timelineSliderBox'] = timelineSlider.getBoundingClientRect();

    // update the timeline marker viewbox
    timelineOverlay.setAttribute('viewbox', `0 0 ${boxes['timelineSliderBox'].width} 60`);

    // reset the ticks on the timeline marker
    if (flags['videoLoaded']) {
        setTimelineOverlay();
        setTimelineThumb();
    }
}

function resizePlaybackSlider() {
    boxes['playbackSliderBox'] = playbackSlider.getBoundingClientRect();

    // reset the ticks on the timeline marker
    if (flags['videoLoaded']) {
        setPlaybackThumb();
    }
}


function getReadableDuration(time) {
    const parsedTime = getParsedTime(time);

    if (parsedTime[1] > 0) {
        return `${parsedTime[1]}:${parsedTime[2] < 10 ? '0' : ''}${parsedTime[2]}:${parsedTime[3] < 10 ? '0' : ''}${parsedTime[3]}`;
    }
    else {
        return `${parsedTime[2]}:${parsedTime[3] < 10 ? '0' : ''}${parsedTime[3]}`;
    }
}