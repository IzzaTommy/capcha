/**
 * Module for initializing the editor section
 * 
 * @module rendEditorSection
 * @requires rendVariables
 * @requires rendSharedFunctions
 */
import { 
    GROW_FACTOR, REDUCE_FACTOR, MIN_TIMELINE_ZOOM, MIN_GALLERY_GAP, 
    MSECONDS_IN_SECOND, SECONDS_IN_DAY, SECONDS_IN_HOUR, SECONDS_IN_MINUTE, 
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekThumb, 
    playbackBar, playPauseBtn, playPauseIcon, volumeBtn, volumeIcon, volumeSlider, currentVideoTimeLabel, currentVideoDurationLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineTrack, timelineThumb, 
    mostSettingFields, mostSettingToggleFields, capturesPathSettingField, darkModeSettingToggleField, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setSVG, getParsedTime, resizeAll, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';

/**
 * @exports initRendEditorSection, setVideoPlayerState, resizeseekSlider, resizeTimelineSlider, getReadableDuration
 */
export { initRendEditorSection, setVideoPlayerState, resizeseekSlider, resizeTimelineSlider, getReadableDuration }

/**
 * Initializes the editor section
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
            setSVG(fullscreenIcon, 'fullscreen-exit');
            resizeseekSlider();
            resizeTimelineSlider();
        }
        else {
            setSVG(fullscreenIcon, 'fullscreen');
            resizeseekSlider();
            resizeTimelineSlider();
        }
    });

    // on play, revert forced playback container opacity and start animation frames
    videoPlayer.addEventListener('play', () => {
        // sync the slider thumbs' movement to each frame of the video
        state['animationID'] = requestAnimationFrame(syncThumbs);
    });

    // on pause, show the playback container and cancel animation frames
    videoPlayer.addEventListener('pause', () => {
        // show the playback container
        playbackContainer.classList.add('active');

        // cancel the syncing to prevent unnecessary computations
        cancelAnimationFrame(state['animationID']);
    });

    // on mousemove, show the playback container and reset the timeout for disappearing
    videoPlayer.addEventListener('mousemove', () => {
        // show the playback container
        playbackContainer.classList.add('active');

        // remove the old timeout for disappearing
        if (state['playbackContainerTimeout']) {
            clearTimeout(state['playbackContainerTimeout']);
        }
        
        // restart the timeout for disappearing
        state['playbackContainerTimeout'] = setTimeout(() => {
            // if the video is not paused, hide the playback container
            if (!videoPlayer.paused) {
                playbackContainer.classList.remove('active');
            }
        }, 3000);
    });

    // on mouseleave, hide the playback container and remove the timeout for disappearing
    videoPlayer.addEventListener('mouseleave', () => {
        // if the video is not paused, hide the playback container
        if (!videoPlayer.paused) {
            playbackContainer.classList.remove('active');

            // remove the old timeout for disappearing
            if (state['playbackContainerTimeout']) {
                clearTimeout(state['playbackContainerTimeout']);
            }
        }
    })

    // on click, play/pause the video and change the SVG
    videoPlayer.addEventListener('click', () => {
        setVideoPlayerState('toggle');
    });

    // on time update, check the video player time
    videoPlayer.addEventListener('timeupdate', () => {
        // check if the video is loaded (editor section is active)
        if (flags['videoLoaded']) {
            if (!flags['timelineSliderDragging'] && !flags['seekSliderDragging']) {
                // reset the video, change the SVG, and pause the video, depending on if the video has reached the end
                if (videoPlayer.currentTime < state['timeline'].getStartTime() || videoPlayer.currentTime >= state['timeline'].getEndTime()) {
                    videoPlayer.currentTime = state['timeline'].getStartTime();
        
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
        }
    });

    // on load of meta data, set the editor to default state
    videoPlayer.addEventListener('loadedmetadata', () => {
        // set the timeline state and timeline overlay
        state['timeline'].update(0, getTruncDecimal(videoPlayer.duration, 6));
        setTimelineOverlay();

        // set the video current time label to 0
        currentVideoTimeLabel.textContent = '0:00';
        currentVideoDurationLabel.textContent = `/${getReadableDuration(videoPlayer.duration)}`;

        // set the video loaded flag
        flags['videoLoaded'] = true;

        // play the video and change the SVG
        setVideoPlayerState('play');
    });

    // on mousemove, show the playback container and reset the timeout for disappearing
    playbackContainer.addEventListener('mousemove', () => {
        // show the playback container
        playbackContainer.classList.add('active');

        // remove the old timeout for disappearing
        if (state['playbackContainerTimeout']) {
            clearTimeout(state['playbackContainerTimeout']);
        }
        
        // restart the timeout for disappearing
        state['playbackContainerTimeout'] = setTimeout(() => {
            // if the video is not paused, hide the playback container
            if (!videoPlayer.paused) {
                playbackContainer.classList.remove('active');
            }
        }, 3000);
    });

    // on mouseleave, hide the playback container and remove the timeout for disappearing
    playbackContainer.addEventListener('mouseleave', () => {
        // if the video is not paused, hide the playback container
        if (!videoPlayer.paused) {
            playbackContainer.classList.remove('active');

            // remove the old timeout for disappearing
            if (state['playbackContainerTimeout']) {
                clearTimeout(state['playbackContainerTimeout']);
            }
        }
    });

    // on click, change the video time based on the click location on the playback slider
    seekSlider.addEventListener('click', (pointer) => {
        // get the new time based on click location on the playback slider
        const newTime = videoPlayer.duration * getPointerEventPct(pointer, boxes['seekSliderBox']);

        // check if the new time is within the timeline's start and end times
        // videoPlayer.currentTime = (newTime < state['timeline'].getStartTime() || newTime >= state['timeline'].getEndTime()) ? state['timeline'].getStartTime() : newTime;
        videoPlayer.currentTime = newTime;

        // set the playback slider and timeline slider thumbs
        setAllThumbs();
    });

    // on mousemove, set a hover highlight based on pointer location
    seekSlider.addEventListener('mousemove', (pointer) => {
        const seekSliderPct = getPointerEventPct(pointer, boxes['seekSliderBox']) * 100;
        
        seekTrack.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${seekSliderPct}%, transparent ${seekSliderPct}%)`;
    });

    // on mouseleave, remove the hover hightlight
    seekSlider.addEventListener('mouseleave', () => {
        seekTrack.style.backgroundImage = 'none';
    });

    // on mousedown, set the timeline dragging and previously paused flags
    seekSlider.addEventListener('mousedown', () => { 
        flags['seekSliderDragging'] = true; 
        flags['previouslyPaused'] = videoPlayer.paused;
    });

    // on mouseleave, change the volume / speed slider widths to hide
    playbackBar.addEventListener('mouseleave', () => {
        volumeSlider.style.width = '';
        speedSlider.style.width = '';
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
        setvolumeIcon();
    });

    // on mouse enter, change the volume slider width to show
    volumeBtn.addEventListener('mouseenter', () => {
        volumeSlider.style.width = 'var(--vslider-alt-width)';
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
        setvolumeIcon();
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

    // on mouse enter, change the speed slider width to show
    speedBtn.addEventListener('mouseenter', () => {
        speedSlider.style.width = 'var(--spslider-alt-width)';
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
    setvolumeIcon();

    // unload the editor video
    setVideoPlayerState('standby');
}

/**
 * Initializes the timeline slider event listeners
 */
function initTimelineSliderEL() {
    // on click, change the video time based on the click location on the timeline slider
    timelineSlider.addEventListener('click', (pointer) => {
        // get the time based on click location on the timeline slider
        videoPlayer.currentTime = state['timeline'].getDuration() * getPointerEventPct(pointer, boxes['timelineSliderBox']) + state['timeline'].getStartTime();

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
                if (state['timeline'].getDuration() > MIN_TIMELINE_ZOOM) {
                    // calculate the new start/end times and duration
                    newStartTime = state['timeline'].getStartTime() + (REDUCE_FACTOR * state['timeline'].getDuration() * percentage);
                    newEndTime = state['timeline'].getEndTime() - (REDUCE_FACTOR * state['timeline'].getDuration() * (1 - percentage));
                    newDuration = newEndTime - newStartTime;
                    
                    // check if the new duration is less than 30s and set the zoom to 30s
                    state['timeline'].update(
                        getTruncDecimal((newDuration < MIN_TIMELINE_ZOOM) ? newStartTime - (MIN_TIMELINE_ZOOM - newDuration) * percentage : newStartTime, 6),
                        getTruncDecimal((newDuration < MIN_TIMELINE_ZOOM) ? newStartTime - (MIN_TIMELINE_ZOOM - newDuration) * percentage + MIN_TIMELINE_ZOOM : newEndTime, 6)
                    );
                    
                    // check if the video time is out of the timeline, put it back in bounds
                    if (videoPlayer.currentTime < state['timeline'].getStartTime()) {
                        videoPlayer.currentTime = state['timeline'].getStartTime();
                    } 
                    else {
                        if (videoPlayer.currentTime > state['timeline'].getEndTime()) {
                            videoPlayer.currentTime = state['timeline'].getEndTime();
                        }
                    }

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
                if (state['timeline'].getDuration() < videoPlayer.duration) {
                    // calculate the new start and end times
                    newStartTime = state['timeline'].getStartTime() - (GROW_FACTOR * state['timeline'].getDuration() * percentage);
                    newEndTime = state['timeline'].getEndTime() + (GROW_FACTOR * state['timeline'].getDuration() * (1 - percentage));
                    
                    // check if "zoom out" would bring the timeline out of bounds
                    if (newStartTime < 0) {
                        // reallocate grow factor to the end time if needed
                        state['timeline'].update(
                            0, 
                            getTruncDecimal(Math.min(videoPlayer.duration, Math.abs(newStartTime) + newEndTime), 6)
                        );
                    } 
                    else {
                        // reallocate grow factor to the start time if needed
                        state['timeline'].update(
                            getTruncDecimal(newEndTime > videoPlayer.duration ? Math.max(0, newStartTime - (newEndTime - videoPlayer.duration)) : newStartTime, 6),
                            getTruncDecimal(Math.min(videoPlayer.duration, newEndTime), 6)
                        );
                    }
                             
                    // check if the video time is out of the timeline, put it back in bounds
                    if (videoPlayer.currentTime < state['timeline'].getStartTime()) {
                        videoPlayer.currentTime = state['timeline'].getStartTime();
                    } 
                    else {
                        if (videoPlayer.currentTime > state['timeline'].getEndTime()) {
                            videoPlayer.currentTime = state['timeline'].getEndTime();
                        }
                    }

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
        if (flags['timelineSliderDragging'] === true || flags['seekSliderDragging'] === true) {
            // set the timeline and playback dragging flags to false
            flags['timelineSliderDragging'] = false; 
            flags['seekSliderDragging'] = false;

            // check if the video has reached the end, set it back the start
            if (videoPlayer.currentTime < state['timeline'].getStartTime() || videoPlayer.currentTime >= state['timeline'].getEndTime()) {
                videoPlayer.currentTime = state['timeline'].getStartTime();

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
        if (flags['seekSliderDragging']) {
            // pause the video and change the SVG
            setVideoPlayerState('pause');

            // get the pointer location on the playback slider
            location = getPointerEventLoc(pointer, boxes['seekSliderBox']);
            
            // check if the pointer is within the playback slider
            if (location < 0) {
                // set the playback slider thumb to the start, set the video time to the start
                seekThumb.style.transform = `translateX(0px)`;
                videoPlayer.currentTime = 0;
            } 
            else {
                if (location > boxes['seekSliderBox'].width) {
                    // set the playback slider thumb to the end, set the video time to the end
                    seekThumb.style.transform = `translateX(${boxes['seekSliderBox'].width}px)`;
                    videoPlayer.currentTime = videoPlayer.duration;
                } 
                else {
                    // set the playback slider thumb to the pointer, set the video time to the relative time
                    seekThumb.style.transform = `translateX(${location}px)`;
                    videoPlayer.currentTime = getPointerEventPct(pointer, boxes['seekSliderBox']) * videoPlayer.duration;
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
                    videoPlayer.currentTime = state['timeline'].getStartTime();
                } 
                else {
                    if (location > boxes['timelineSliderBox'].width) {
                        // set the timeline slider thumb to the end, set the video time to the end
                        timelineThumb.style.transform = `translateX(${boxes['timelineSliderBox'].width}px)`;
                        videoPlayer.currentTime = state['timeline'].getEndTime();
                    } 
                    else {
                        // set the timeline slider thumb to the pointer, set the video time to the relative time
                        timelineThumb.style.transform = `translateX(${location}px)`;
                        videoPlayer.currentTime = state['timeline'].getStartTime() + getPointerEventPct(pointer, boxes['timelineSliderBox']) * state['timeline'].getDuration();
                    }
                }

                // set the playback slider thumb
                setseekThumb();

                // set the video current time label
                currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
            }
        }
    });
}

/**
 * Sets the volume SVG based on the volume
 */
function setvolumeIcon() {
    if (videoPlayer.muted) {
        setSVG(volumeIcon, 'volume-off');
    }
    else {
        if (videoPlayer.volume > 0.6) {
            setSVG(volumeIcon, 'volume-up');
        }
        else {
            if (videoPlayer.volume > 0.1) {
                setSVG(volumeIcon, 'volume-down');
            }
            else {
                setSVG(volumeIcon, 'volume-mute');
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
            setSVG(playPauseIcon, 'pause');
            playPauseOverlayIcon.style.opacity = '';
            videoPlayer.play();
            break;
        case 'pause':
            // pause the video and change the SVG
            setSVG(playPauseIcon, 'play-arrow');
            playPauseOverlayIcon.style.opacity = '1';
            videoPlayer.pause();
            break;
        case 'toggle':
            // play/pause the video and change the SVG
            if (videoPlayer.paused || videoPlayer.ended) {
                setSVG(playPauseIcon, 'pause');
                playPauseOverlayIcon.style.opacity = '';
                videoPlayer.play();
            }
            else {
                setSVG(playPauseIcon, 'play-arrow');
                playPauseOverlayIcon.style.opacity = '1';
                videoPlayer.pause();
            }
            break;
        case 'standby':
            // pause the video and change the SVG
            setSVG(playPauseIcon, 'pause');
            playPauseOverlayIcon.style.opacity = '';
            videoPlayer.pause();
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
function setseekThumb() {
    seekThumb.style.transform = `translateX(${videoPlayer.currentTime / videoPlayer.duration * boxes['seekSliderBox'].width}px)`;
}

/**
 * Resizes the playback slider
 */
function resizeseekSlider() {
    // get the new playback slider bounding box
    boxes['seekSliderBox'] = seekSlider.getBoundingClientRect();

    // if the video is loaded, set the new playback thumb position
    if (flags['videoLoaded']) {
        setseekThumb();
    }
}

/**
 * Sets the timeline thumb position based on video time
 */
function setTimelineThumb() {
    // get the percentage location of the video time within the timeline bounding box
    const percentage = (videoPlayer.currentTime - state['timeline'].getStartTime()) / state['timeline'].getDuration();

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
    setseekThumb();
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
        state['animationID'] = requestAnimationFrame(syncThumbs);
    }
}

/**
 * Sets the ticks on the timeline overlay
 */
function setTimelineOverlay() {
    // get the location of the first tick in seconds and the number of ticks based on the duration
    const firstTick = Math.ceil(state['timeline'].getStartTime() / state['timeline'].getSubInterval()) * state['timeline'].getSubInterval();
    const numTicks = ((Math.floor(state['timeline'].getEndTime() / state['timeline'].getSubInterval()) * state['timeline'].getSubInterval()) - firstTick) / state['timeline'].getSubInterval() + 1;

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
        tickLocation = firstTick + (i * state['timeline'].getSubInterval());
        // get the percentage location of the tick within the timeline overlay
        tickPercentage = (tickLocation - state['timeline'].getStartTime()) / state['timeline'].getDuration();

        // get the tick line clone
        tickLineClone = tickLineTemplate.cloneNode(true);

        // set the tick line horizontal location
        tickLineClone.setAttribute('x1', tickPercentage * boxes['timelineSliderBox'].width);
        tickLineClone.setAttribute('x2', tickPercentage * boxes['timelineSliderBox'].width);

        // check if the tick is an interval tick
        if (tickLocation % state['timeline'].getInterval() === 0) {
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