/**
 * Module for initializing the editor section
 * 
 * @module rendEditorSection
 * @requires rendVariables
 * @requires rendShared
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    html, 
    minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesSVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseStatusSVG, 
    playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentVideoTimeLabel, totalVideoTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, timelineState, 
    allSettingPill, allSettingToggleSwitch, capturesPathSettingPill, darkModeSettingToggleSwitch, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, stateData 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll } from './rendShared.js';

/**
 * @exports initRendEditorSection, resizePlaybackSlider, resizeTimelineSlider, getReadableDuration
 */
export { initRendEditorSection, resizePlaybackSlider, resizeTimelineSlider, getReadableDuration }

/**
 * Initializes the editor section and its components
 */
function initRendEditorSection() {
    initVideoContainerEL();
    initVideoContainer();
    initTimelineSliderEL();
}

/**
 * Initializes the video container event listeners
 */
function initVideoContainerEL() {
    // on fullscreen change, change the SVG and resize the playback slider
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

    // on play, revert forced playback container opacity and start animation frames
    videoPlayer.addEventListener('play', () => {
        // allow default opacity behavior
        playbackContainer.style.opacity = "";

        // sync the slider thumbs' movement to each frame of the video
        stateData['animationID'] = requestAnimationFrame(syncThumbs);
    });

    // on pause, show the playback container and cancel animation frames
    videoPlayer.addEventListener('pause', () => {
        // show the playback container
        playbackContainer.style.opacity = "1";

        // cancel the syncing to prevent unnecessary computations
        cancelAnimationFrame(stateData['animationID']);
    });

    // on click, play/pause the video and change the SVG
    videoPlayer.addEventListener('click', () => setVideoPlayerState('toggle'));

    // on time update, check the video player time
    videoPlayer.addEventListener('timeupdate', () => {
        // check if the video is loaded (editor section is active)
        if (flags['videoLoaded'] && !flags['timelineSliderDragging'] && !flags['playbackSliderDragging']) {
            // reset the video, change the SVG, and pause the video, depending on if the video has reached the end
            if (videoPlayer.currentTime < timelineState.getStartTime() || videoPlayer.currentTime >= timelineState.getEndTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();
    
                // pause the video and change the SVG
                setVideoPlayerState('pause');
    
                // set the playback slider and timeline slider thumbs
                setAllThumbs();
            }
    
            // set the video current time label
            currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
        }
        else {
            // pause the video and change the SVG
            setVideoPlayerState('pause');
        }
    });

    // on load of meta data, set the editor to default state
    videoPlayer.addEventListener('loadedmetadata', () => {
        // set the timeline state and timeline overlay
        timelineState.update(0, getTruncDecimal(videoPlayer.duration, 6));
        setTimelineOverlay();

        // set the video current time label to 0
        currentVideoTimeLabel.textContent = '0:00';
        totalVideoTimeLabel.textContent = `/${getReadableDuration(videoPlayer.duration)}`;

        // set the video loaded flag
        flags['videoLoaded'] = true;

        // play the video and change the SVG
        setVideoPlayerState('play');
    });

    // on click, change the video time based on the click location on the playback slider
    playbackSlider.addEventListener('click', (pointer) => {
        // get the new time based on click location on the playback slider
        const newTime = videoPlayer.duration * getPointerEventPct(pointer, boxes['playbackSliderBox']);

        // check if the new time is within the timeline's start and end times
        // videoPlayer.currentTime = (newTime < timelineState.getStartTime() || newTime >= timelineState.getEndTime()) ? timelineState.getStartTime() : newTime;
        videoPlayer.currentTime = newTime;

        // set the playback slider and timeline slider thumbs
        setAllThumbs();
    });

    // on mousemove, set a hover highlight based on pointer location
    playbackSlider.addEventListener('mousemove', (pointer) => {
        const playbackSliderPct = getPointerEventPct(pointer, boxes['playbackSliderBox']) * 100;
        
        playbackTrack.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${playbackSliderPct}%, transparent ${playbackSliderPct}%)`;
    });

    // on mouseleave, remove the hover hightlight
    playbackSlider.addEventListener('mouseleave', () => {
        playbackTrack.style.backgroundImage = 'none';
    });

    // on mousedown, set the timeline dragging and previously paused flags
    playbackSlider.addEventListener('mousedown', () => { 
        flags['playbackSliderDragging'] = true; 
        flags['previouslyPaused'] = videoPlayer.paused;
    });

    // on click, play/pause the video and change the SVG
    playPauseBtn.addEventListener('click', () => setVideoPlayerState('toggle'));

    // on click, mute/unmute the video and change the SVG
    volumeBtn.addEventListener('click', () => {
        // set the video to unmuted if the video is muted
        if (videoPlayer.muted) {
            videoPlayer.muted = false;
            
            // set the volume to 0.1 if the volume is 0
            if (videoPlayer.volume === 0) {
                videoPlayer.volume = 0.1;
                data['settings']['volume'] = videoPlayer.volume;
            }
            
            // set the volume input slider to match volume
            volumeSlider.stepUp(videoPlayer.volume * 100);
        } 
        else {
            // set the video to muted
            videoPlayer.muted = true;
            
            // set the volume input slider to match volume
            volumeSlider.stepDown(videoPlayer.volume * 100);
        }

        // save the setting
        data['settings']['volumeMuted'] = videoPlayer.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // on input, set the volume
    volumeSlider.addEventListener('input', () => {
        // set the video to muted if the volume is 0
        videoPlayer.muted = volumeSlider.value === '0';

        // set the video volume
        videoPlayer.volume = volumeSlider.value;

        // save the settings
        data['settings']['volume'] = videoPlayer.volume;
        data['settings']['volumeMuted'] = videoPlayer.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // on input, set the playback speed
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

    // on click, revert to the default playback speed
    speedBtn.addEventListener('click', () => {
        // set the playback speed and speed label to 1
        videoPlayer.playbackRate = 1;
        speedLabel.textContent = '1';

        // set the speed input slider to match playback speed
        if (speedSlider.value < 1) {
            speedSlider.stepUp(Math.abs(speedSlider.value - 1));
        }
        else {
            speedSlider.stepDown(speedSlider.value - 1);
        }
    });

    // on click, toggle the video player fullscreen
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement !== null) {
            document.exitFullscreen();
        } 
        else {
            videoContainer.requestFullscreen();
        }
    });
}

/**
 * Initializes the video container
 */
function initVideoContainer() {
    // load each settings initial value from stored settings
    videoPlayer.volume = data['settings']['volume'];
    videoPlayer.muted = data['settings']['volumeMuted']

    // set the volume input slider to match volume
    if (!videoPlayer.muted) {
        volumeSlider.stepUp(videoPlayer.volume * 100);
    }
    
    // change the volume SVG
    setVolumeSVG();
}

/**
 * Initializes the timeline slider event listeners
 */
function initTimelineSliderEL() {
    // on click, change the video time based on the click location on the timeline slider
    timelineSlider.addEventListener('click', (pointer) => {
        // get the time based on click location on the timeline slider
        videoPlayer.currentTime = timelineState.getDuration() * getPointerEventPct(pointer, boxes['timelineSliderBox']) + timelineState.getStartTime();

        // set the playback slider and timeline slider thumbs
        setAllThumbs();
    });

    // on scroll, "zoom" in/out of the timeline
    timelineSlider.addEventListener('wheel', (pointer) => {
        // the new start/end times, duration, and percentage
        let newStartTime, newEndTime, newDuration, percentage;

        // check if the scroll is within the timeline slider
        if (pointer.clientX >= boxes['timelineSliderBox'].left && pointer.clientX <= boxes['timelineSliderBox'].right && pointer.clientY <= boxes['timelineSliderBox'].bottom && pointer.clientY >= boxes['timelineSliderBox'].top) {
            // get the click percentage on the timeline slider
            percentage = getPointerEventPct(pointer, boxes['timelineSliderBox']);
            
            // check if the pointer scrolled up ("zoom in")
            if (pointer.deltaY < 0) {
                // check if timeline is not at maximum zoom of 30s
                if (timelineState.getDuration() > MIN_TIMELINE_ZOOM) {
                    // calculate the new start/end times and duration
                    newStartTime = timelineState.getStartTime() + (REDUCE_FACTOR * timelineState.getDuration() * percentage);
                    newEndTime = timelineState.getEndTime() - (REDUCE_FACTOR * timelineState.getDuration() * (1 - percentage));
                    newDuration = newEndTime - newStartTime;
                    
                    // check if the new duration is less than 30s and set the zoom to 30s
                    timelineState.update(
                        getTruncDecimal((newDuration < MIN_TIMELINE_ZOOM) ? newStartTime - (MIN_TIMELINE_ZOOM - newDuration) * percentage : newStartTime, 6),
                        getTruncDecimal((newDuration < MIN_TIMELINE_ZOOM) ? newStartTime - (MIN_TIMELINE_ZOOM - newDuration) * percentage + MIN_TIMELINE_ZOOM : newEndTime, 6)
                    );
                    
                    // check if the video time is out of the timeline, put it back in bounds
                    videoPlayer.currentTime = Math.max(timelineState.getStartTime(), Math.min(videoPlayer.currentTime, timelineState.getEndTime()));

                    // set the timeline overlay
                    setTimelineOverlay();

                    // set the playback slider and timeline slider thumbs
                    setAllThumbs();

                    // set the video current time label
                    currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
                }
            } 
            else {
                // check if the timeline is not at minimum zoom
                if (timelineState.getDuration() < videoPlayer.duration) {
                    // calculate the new start and end times
                    newStartTime = timelineState.getStartTime() - (GROW_FACTOR * timelineState.getDuration() * percentage);
                    newEndTime = timelineState.getEndTime() + (GROW_FACTOR * timelineState.getDuration() * (1 - percentage));
                    
                    // check if "zoom out" would bring the timeline out of bounds
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
                             
                    // check if the video time is out of the timeline, put it back in bounds
                    videoPlayer.currentTime = Math.max(timelineState.getStartTime(), Math.min(videoPlayer.currentTime, timelineState.getEndTime()));

                    // set the timeline overlay
                    setTimelineOverlay();

                    // set the playback slider and timeline slider thumbs
                    setAllThumbs();

                    // set the video current time label
                    currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
                }
            }
        }
    });

    // on mousedown, set the timeline dragging and previously paused flags
    timelineSlider.addEventListener('mousedown', () => { 
        flags['timelineSliderDragging'] = true; 
        flags['previouslyPaused'] = videoPlayer.paused;
    });

    // on mouseup, validate the slider input and change the video time
    document.addEventListener('mouseup', () => { 
        if (flags['timelineSliderDragging'] === true || flags['playbackSliderDragging'] === true) {
            // set the timeline and playback dragging flags to false
            flags['timelineSliderDragging'] = false; 
            flags['playbackSliderDragging'] = false;

            // check if the video has reached the end, set it back the start
            if (videoPlayer.currentTime < timelineState.getStartTime() || videoPlayer.currentTime >= timelineState.getEndTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();

                // pause the video and change the SVG
                setVideoPlayerState('pause');

                // set the playback slider and timeline slider thumbs
                setAllThumbs();
            }
            else {
                // check if the video was previously paused
                if (!flags['previouslyPaused']) {
                    // play the video and change the SVG
                    setVideoPlayerState('play');
                }
            }

            // set the video current time label
            currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
        }
    });

    // on mousemove, match playback and timeline slider position and set video time
    document.addEventListener('mousemove', (pointer) => {
        // the pointer location on the timeline slider
        let location;

        // check if the playback slider is dragging
        if (flags['playbackSliderDragging']) {
            // pause the video and change the SVG
            setVideoPlayerState('pause');

            // get the pointer location on the playback slider
            location = getPointerEventLoc(pointer, boxes['playbackSliderBox']);
            
            // check if the pointer is within the playback slider
            if (location < 0) {
                // set the playback slider thumb to the start, set the video time to the start
                playbackThumb.style.transform = `translateX(0px)`;
                videoPlayer.currentTime = 0;
            } 
            else {
                if (location > boxes['playbackSliderBox'].width) {
                    // set the playback slider thumb to the end, set the video time to the end
                    playbackThumb.style.transform = `translateX(${boxes['playbackSliderBox'].width}px)`;
                    videoPlayer.currentTime = videoPlayer.duration;
                } 
                else {
                    // set the playback slider thumb to the pointer, set the video time to the relative time
                    playbackThumb.style.transform = `translateX(${location}px)`;
                    videoPlayer.currentTime = getPointerEventPct(pointer, boxes['playbackSliderBox']) * videoPlayer.duration;
                }
            }

            // set the playback slider and timeline slider thumbs
            setAllThumbs();

            // set the video current time label
            currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
        }
        else {
            // check if the timeline slider is dragging
            if (flags['timelineSliderDragging']) {
                // pause the video and change the SVG
                setVideoPlayerState('pause');

                // get the pointer location on the timeline slider
                location = getPointerEventLoc(pointer, boxes['timelineSliderBox']);
                
                // check if the pointer is within the timeline slider
                if (location < 0) {
                    // set the timeline slider thumb to the start, set the video time to the start
                    timelineThumb.style.transform = `translateX(0px)`;
                    videoPlayer.currentTime = timelineState.getStartTime();
                } 
                else {
                    if (location > boxes['timelineSliderBox'].width) {
                        // set the timeline slider thumb to the end, set the video time to the end
                        timelineThumb.style.transform = `translateX(${boxes['timelineSliderBox'].width}px)`;
                        videoPlayer.currentTime = timelineState.getEndTime();
                    } 
                    else {
                        // set the timeline slider thumb to the pointer, set the video time to the relative time
                        timelineThumb.style.transform = `translateX(${location}px)`;
                        videoPlayer.currentTime = timelineState.getStartTime() + getPointerEventPct(pointer, boxes['timelineSliderBox']) * timelineState.getDuration();
                    }
                }

                // set the playback slider thumb
                setPlaybackThumb();

                // set the video current time label
                currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
            }
        }
    });
}

/**
 * Sets the volume SVG based on the volume
 */
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

/**
 * Sets the video player state
 * @param {string} action - The action to take on the video player state
 */
function setVideoPlayerState(action) {
    switch (action) {
        case 'play':
            // play the video and change the SVG
            setSVG(playPauseSVG, 'pause');
            playPauseStatusSVG.style.opacity = '';
            videoPlayer.play();
            break;
        case 'pause':
            // pause the video and change the SVG
            setSVG(playPauseSVG, 'play-arrow');
            playPauseStatusSVG.style.opacity = '1';
            videoPlayer.pause();
            break;
        case 'toggle':
            // play/pause the video and change the SVG
            if (videoPlayer.paused || videoPlayer.ended) {
                setSVG(playPauseSVG, 'pause');
                playPauseStatusSVG.style.opacity = '';
                videoPlayer.play();
            }
            else {
                setSVG(playPauseSVG, 'play-arrow');
                playPauseStatusSVG.style.opacity = '1';
                videoPlayer.pause();
            }
            break;
        default:
    }
}

/**
 * Gets the pointer event location within the bounding box of the element
 * 
 * @param {MouseEvent} pointer - The mouse event pointer
 * @param {DOMRect} box - The element bounding box
 * @returns {number} The location of the pointer event
 */
function getPointerEventLoc(pointer, box) {
    return pointer.clientX - box.left;
}

/**
 * Gets the pointer event percentage within the bounding box of the element
 * 
 * @param {MouseEvent} pointer - The mouse event pointer
 * @param {DOMRect} box - The element bounding box
 * @returns {number} The percentage of the pointer event
 */
function getPointerEventPct(pointer, box) {
    return getPointerEventLoc(pointer, box) / box.width;
}

/**
 * Sets the playback thumb position based on video time
 */
function setPlaybackThumb() {
    playbackThumb.style.transform = `translateX(${videoPlayer.currentTime / videoPlayer.duration * boxes['playbackSliderBox'].width}px)`;
}

/**
 * Resizes the playback slider
 */
function resizePlaybackSlider() {
    // get the new playback slider bounding box
    boxes['playbackSliderBox'] = playbackSlider.getBoundingClientRect();

    // if the video is loaded, set the new playback thumb position
    if (flags['videoLoaded']) {
        setPlaybackThumb();
    }
}

/**
 * Sets the timeline thumb position based on video time
 */
function setTimelineThumb() {
    // get the percentage location of the video time within the timeline bounding box
    const percentage = (videoPlayer.currentTime - timelineState.getStartTime()) / timelineState.getDuration();

    // set the timeline thumb position within the timeline bounding box
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

/**
 * Resizes the timeline slider
 */
function resizeTimelineSlider() {
    // get the new timeline slider bounding box
    boxes['timelineSliderBox'] = timelineSlider.getBoundingClientRect();

    // set the timeline marker viewbox
    timelineOverlay.setAttribute('viewbox', `0 0 ${boxes['timelineSliderBox'].width} 60`);

    // if the video is loaded, set the new timeline overlay and thumb position
    if (flags['videoLoaded']) {
        setTimelineOverlay();
        setTimelineThumb();
    }
}

/**
 * Sets the playback and timeline thumb positions based on video time
 */
function setAllThumbs() {
    setPlaybackThumb();
    setTimelineThumb();
}

/**
 * Syncs the playback and timeline thumbs to the video frame
 */
function syncThumbs() {
    // set the playback slider and timeline slider thumbs
    setAllThumbs();

    // request the next animation frame if the video is playing
    if (!videoPlayer.paused && !videoPlayer.ended) {
        stateData['animationID'] = requestAnimationFrame(syncThumbs);
    }
}

/**
 * Sets the ticks on the timeline overlay
 */
function setTimelineOverlay() {
    // get the location of the first tick in seconds and the number of ticks based on the duration
    const firstTick = Math.ceil(timelineState.getStartTime() / timelineState.getSubInterval()) * timelineState.getSubInterval();
    const numTicks = ((Math.floor(timelineState.getEndTime() / timelineState.getSubInterval()) * timelineState.getSubInterval()) - firstTick) / timelineState.getSubInterval() + 1;

    // the tick line clone, tick text clone, tick location, and tick percentage
    let tickLineClone, tickTextClone, tickLocation, tickPercentage;

    // get the tick line template and the tick text template
    const tickLineTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const tickTextTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // set the default tick line height
    tickLineTemplate.setAttribute('y1', 15);
    tickLineTemplate.setAttribute('y2', 30);

    // set the default tick text vertical location
    tickTextTemplate.setAttribute('y', 45);

    // remove all timeline overlay ticks
    while (timelineOverlay.firstElementChild)
    {
        timelineOverlay.removeChild(timelineOverlay.lastElementChild);
    }

    // iterate through each tick
    for (let i = 0; i < numTicks; i++)
    {
        // get the location of the tick in seconds
        tickLocation = firstTick + (i * timelineState.getSubInterval());
        // get the percentage location of the tick within the timeline overlay
        tickPercentage = (tickLocation - timelineState.getStartTime()) / timelineState.getDuration();

        // get the tick line clone
        tickLineClone = tickLineTemplate.cloneNode(true);

        // set the tick line horizontal location
        tickLineClone.setAttribute('x1', tickPercentage * boxes['timelineSliderBox'].width);
        tickLineClone.setAttribute('x2', tickPercentage * boxes['timelineSliderBox'].width);

        // check if the tick is an interval tick
        if (tickLocation % timelineState.getInterval() === 0) {
            // set the tick line height to be larger
            tickLineClone.setAttribute('y1', 10);
            tickLineClone.setAttribute('y2', 50);

            // get the tick text clone
            tickTextClone = tickTextTemplate.cloneNode(true);

            // set the tick text horizontal location
            tickTextClone.setAttribute('x', tickPercentage * boxes['timelineSliderBox'].width + 5);
            // set the tick text time label
            tickTextClone.textContent = getReadableDuration(tickLocation);

            // append the tick text
            timelineOverlay.appendChild(tickTextClone);
        }

        // append the tick line
        timelineOverlay.appendChild(tickLineClone);      
    }
}

/**
 * Truncates a decimal value by a specified number of digits
 * 
 * @param {number} value - The value to truncate
 * @param {number} places - The number of decimal digits to truncate to
 * @returns 
 */
function getTruncDecimal(value, places) {
    return Math.trunc(value * Math.pow(10, places)) / Math.pow(10, places);
}

/**
 * Gets the duration in a readable format
 * 
 * @param {number} time - The duration in seconds
 * @returns {string} The readable duration
 */
function getReadableDuration(time) {
    // gets the days, hours, minutes, and seconds of the time
    const parsedTime = getParsedTime(time);

    // return the duration in hh:mm:ss or mm:ss format
    if (parsedTime[1] > 0) {
        return `${parsedTime[1]}:${parsedTime[2] < 10 ? '0' : ''}${parsedTime[2]}:${parsedTime[3] < 10 ? '0' : ''}${parsedTime[3]}`;
    }
    else {
        return `${parsedTime[2]}:${parsedTime[3] < 10 ? '0' : ''}${parsedTime[3]}`;
    }
}