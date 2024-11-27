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
    ATTEMPTS, FAST_DELAY_IN_MSECONDS, SLOW_DELAY_IN_MSECONDS, PLAYBACK_RATE_MAPPING, 
    html, 
    initializationOverlay, initializationStatusLabel, 
    titleBar, minimizeBtn, maximizeBtn, closeBtn, 
    navBar, directoriesBtn, directoriesIcon, settingsBtn, settingsIcon, currentRecordingLabelContainer, currentRecordingTimeLabel, currentRecordingGameLabel, recordBtn, recordIcon, autoRecordResumeLabel, 
    navToggleBtn, navToggleIcon, 
    generalStatusLabel, directoriesSection, editorSection, settingsSection, 
    videoPreviewTemplate, videoPreviewWidth, capturesGallery, capturesLeftBtn, capturesRightBtn, clipsGallery, clipsLeftBtn, clipsRightBtn, 
    videoContainer, videoPlayer, playPauseOverlayIcon, 
    playbackContainer, seekSlider, seekTrack, seekOverlay, seekThumb, 
    mediaBar, playPauseBtn, playPauseIcon, 
    volumeBtn, volumeIcon, volumeSlider, volumeSliderWidth, volumeOverlay, volumeThumb, 
    currentVideoTimeLabel, currentVideoDurationLabel, 
    playbackRateSlider, playbackRateSliderWidth, playbackRateThumb, playbackRateBtn, playbackRateLabel, 
    fullscreenBtn, fullscreenIcon, 
    timelineSlider, timelineOverlay, timelineThumb, 
    clipBar, allClipSettingFields, clipViewBtn, clipCreateBtn, clipToggleBtn, clipToggleIcon, 
    mostSettingFields, mostSettingToggleSwitches, capturesPathSettingField, clipsPathSettingField, darkModeSettingToggleField, darkModeSettingToggleIcon, 
    flags, boxes, 
    data, state, 
    initRendVariables 
} from './rendVariables.js';
import { setIcon, getParsedTime, setActiveSection, attemptAsyncFunction } from './rendSharedFunctions.js';

/**
 * @exports initRendEditorSection, setVideoPlayerState, updateSeekSlider, updateTimelineSlider, getReadableDuration
 */
export { initRendEditorSection, setVideoPlayerState, updateSeekSlider, updateVolumeSlider, updatePlaybackRateSlider, updateTimelineSlider, getReadableDuration }

/**
 * Initializes the editor section
 */
function initRendEditorSection() {
    initVideoContainerEL();
    initVideoContainer();
    initTimelineSliderEL();
    initClipToggleBtnEL();
}





function initClipToggleBtnEL() {
    // on click, change the nav bar state
    clipToggleBtn.addEventListener('click', () => {
        // toggle the nav bar
        clipBar.classList.toggle('active');

        // change the icon and save the setting, depending on if the nav bar is active
        if (clipBar.classList.contains('active')) {
            setIcon(clipToggleIcon, 'arrow-back-ios');
        }
        else {
            setIcon(clipToggleIcon, 'arrow-forward-ios');
        }
    });

    clipViewBtn.addEventListener('click', () => {
        console.log('test');
    });

    clipCreateBtn.addEventListener('click', () => {
        console.log('test2');
    });



    // iterate through each setting field
    for (const clipSettingField of allClipSettingFields) {
        // on change, validate the setting, save it, and set the saved value
        clipSettingField.addEventListener('change', async () => {
            // settingField.value = data['settings'][settingField.name] = await attemptAsyncFunction(() => window.settingsAPI.setSetting(settingField.name, settingField.value), ATTEMPTS, FAST_DELAY_IN_MSECONDS, false);
        });
    }
}









/**
 * Initializes the video container event listeners
 */
function initVideoContainerEL() {
    // on fullscreen change, change the icon and resize all the editor sliders
    videoContainer.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            setIcon(fullscreenIcon, 'fullscreen-exit');
            updateSeekSlider();
            updateTimelineSlider();
            updateVolumeSlider();
            updatePlaybackRateSlider();
        }
        else {
            setIcon(fullscreenIcon, 'fullscreen');
            updateSeekSlider();
            updateTimelineSlider();
            updateVolumeSlider();
            updatePlaybackRateSlider();
        }
    });

    // on play, start animation frames to move sliders smooethly
    videoPlayer.addEventListener('play', () => {
        // sync the slider thumbs' movement to each frame of the video
        state['animationID'] = requestAnimationFrame(syncSeekTimelineSliders);
    });

    // on pause, show the playback container and cancel animation frames
    videoPlayer.addEventListener('pause', () => {
        // show the playback container
        playbackContainer.classList.add('active');

        // cancel the syncing to prevent unnecessary computations while paused
        cancelAnimationFrame(state['animationID']);
    });

    // on mousemove, show the playback container and reset the timeout for disappearing
    videoPlayer.addEventListener('mousemove', () => {
        // show the playback container
        playbackContainer.classList.add('active');

        // remove the old timeout for disappearing
        clearTimeout(state['playbackContainerTimeout']);
        
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
            clearTimeout(state['playbackContainerTimeout']);
        }
    })

    // on click, play/pause the video and change the icon
    videoPlayer.addEventListener('click', () => {
        setVideoPlayerState('toggle');
    });

    // on time update, check the video player time
    videoPlayer.addEventListener('timeupdate', () => {
        // check if the video is loaded (editor section is active)
        if (flags['videoLoaded']) {
            if (!flags['timelineSliderDragging'] && !flags['seekSliderDragging']) {
                // reset the video, change the icon, and pause the video, depending on if the video is outside of the timeline bounds
                if (videoPlayer.currentTime < state['timeline'].getStartTime() || videoPlayer.currentTime >= state['timeline'].getEndTime()) {
                    videoPlayer.currentTime = state['timeline'].getStartTime();
        
                    // pause the video and change the icon
                    setVideoPlayerState('pause');
        
                    // set the seek slider and timeline slider
                    setSeekSlider();
                    setTimelineSlider();
                }
        
                // set the video current time label
                currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
            }
            // else {
            //     // pause the video and change the icon
            //     // setVideoPlayerState('pause');
            // }
        }
    });

    // on load of meta data, set the editor to default state
    videoPlayer.addEventListener('loadedmetadata', () => {
        // reset the timeline state and timeline overlay
        state['timeline'].update(0, getTruncDecimal(videoPlayer.duration, 6));
        setTimelineOverlay();

        // set the video current time label to 0
        currentVideoTimeLabel.textContent = '0:00';
        currentVideoDurationLabel.textContent = `/${getReadableDuration(videoPlayer.duration)}`;

        // set the video loaded flag
        flags['videoLoaded'] = true;

        // auto play the video and change the icon
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

    // on click, change the video time based on the click location on the seek slider
    seekSlider.addEventListener('click', (pointer) => {
        videoPlayer.currentTime = videoPlayer.duration * getPointerEventPct(pointer, boxes['seekSliderBox']);

        // set the set slider and timeline slider
        setSeekSlider();
        setTimelineSlider();
    });

    // on mousemove, set a hover highlight based on pointer location
    seekSlider.addEventListener('mousemove', (pointer) => {
        setSeekTrack(getPointerEventPct(pointer, boxes['seekSliderBox']) * 100);
    });

    // on mouseleave, remove the hover hightlight
    seekSlider.addEventListener('mouseleave', () => {
        setSeekTrack(0);
    });

    // on mousedown, set the seek slider dragging and previously paused flags
    seekSlider.addEventListener('mousedown', () => { 
        flags['seekSliderDragging'] = true; 
        flags['previouslyPaused'] = videoPlayer.paused;
    });

    // on mouseleave, hide the volume and speed sliders
    mediaBar.addEventListener('mouseleave', () => {
        volumeSlider.classList.remove('active');
        playbackRateSlider.classList.remove('active');
    });

    // on click, play/pause the video and change the icon
    playPauseBtn.addEventListener('click', () => setVideoPlayerState('toggle'));

    // on click, mute/unmute the video and change the icon
    volumeBtn.addEventListener('click', () => {
        // set the volume to 0.1 in case the video gets unmuted
        if (videoPlayer.volume === 0) {
            videoPlayer.volume = data['settings']['volume'] = 0.1;
        }

        videoPlayer.muted = data['settings']['volumeMuted'] = !videoPlayer.muted;

        // set the volume slider
        setVolumeSlider();
    });

    // on mouse enter, show the volume slider
    volumeBtn.addEventListener('mouseenter', () => {
        volumeSlider.classList.add('active');

        // wait for the transition to finish, then capture the box
        setTimeout(() => {
            boxes['volumeSliderBox'] = volumeSlider.getBoundingClientRect();
            flags['updateVolumeSlider'] = false;
        }, 200);
    });

    // on mouse down, set the volume slider dragging flag
    volumeSlider.addEventListener('mousedown', () => { 
        flags['volumeSliderDragging'] = true; 
    });

    // on mouse down, set the playback rate slider dragging flag
    playbackRateSlider.addEventListener('mousedown', () => { 
        flags['playbackRateSliderDragging'] = true; 
    });

    // on click, set the volume
    volumeSlider.addEventListener('click', (pointer) => {
        // update the video volume and settings cache
        videoPlayer.volume = data['settings']['volume'] = Math.max(0, Math.min(getPointerEventPct(pointer, boxes['volumeSliderBox']), 1));
        videoPlayer.muted = data['settings']['volumeMuted'] = videoPlayer.volume === 0;

        // set the volume slider
        setVolumeSlider();
    });

    // on click, set the playback rate
    playbackRateSlider.addEventListener('click', (pointer) => {
        // update the video playback rate
        videoPlayer.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(-2, Math.min(Math.round(getPointerEventLoc(pointer, boxes['playbackRateSliderBox']) / (boxes['playbackRateSliderBox'].width / 6) - 2), 4))];

        // set the playback rate slider
        setPlaybackRateSlider();
    });

    // on click, revert to the default playback speed
    playbackRateBtn.addEventListener('click', () => {
        videoPlayer.playbackRate = 1;

        // set the playback rate slider
        setPlaybackRateSlider();
    });

    // on mouse enter, show the playback rate slider
    playbackRateBtn.addEventListener('mouseenter', () => {
        playbackRateSlider.classList.add('active');

        // wait for the transition to finish, then capture the box
        setTimeout(() => {
            boxes['playbackRateSliderBox'] = playbackRateSlider.getBoundingClientRect();
            flags['updatePlaybackRateSlider'] = false;
        }, 200);
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
    // set the initial video volume
    videoPlayer.volume = data['settings']['volume'];
    videoPlayer.muted = data['settings']['volumeMuted'];

    // set the volume and playback rate sliders
    setVolumeSlider();
    setPlaybackRateSlider();

    // standby will pause the video but hide the play pause icon overlay
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

        // set the seek slider and timeline slider
        setSeekSlider();
        setTimelineSlider();
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

                    // set the seek slider and timeline slider
                    setSeekSlider();
                    setTimelineSlider();

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

                    // set the seek slider and timeline slider
                    setSeekSlider();
                    setTimelineSlider();

                    // set the video current time label
                    currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
                }
            }
        }
    });

    // on mousedown, set the timeline slider dragging and previously paused flags
    timelineSlider.addEventListener('mousedown', () => { 
        flags['timelineSliderDragging'] = true; 
        flags['previouslyPaused'] = videoPlayer.paused;
    });

    // on mouseup, validate the slider input and change the video time
    document.addEventListener('mouseup', () => { 
        if (flags['timelineSliderDragging'] === true || flags['seekSliderDragging'] === true) {
            // set the seek slider and  timeline slider dragging flags to false
            flags['timelineSliderDragging'] = false; 
            flags['seekSliderDragging'] = false;

            // check if the video is out of the timeline bounds, set it back the start
            if (videoPlayer.currentTime < state['timeline'].getStartTime() || videoPlayer.currentTime >= state['timeline'].getEndTime()) {
                videoPlayer.currentTime = state['timeline'].getStartTime();

                // pause the video and change the icon
                setVideoPlayerState('pause');

                // set the seek slider and timeline slider
                setSeekSlider();
                setTimelineSlider();
            }
            else {
                // check if the video was not previously paused
                if (!flags['previouslyPaused']) {
                    // play the video and change the icon
                    setVideoPlayerState('play');
                }
            }

            // set the video current time label
            currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
        }
        else {
            // set the volume slider dragging or playback rate slider dragging flag to false
            if (flags['volumeSliderDragging']) {
                flags['volumeSliderDragging'] = false;
            }
            else {
                if (flags['playbackRateSliderDragging']) {
                    flags['playbackRateSliderDragging'] = false;
                }
            }
        }
    });

    // on mousemove, match seek slider and timeline slider position and set video time
    document.addEventListener('mousemove', (pointer) => {
        // check if the seek slider is dragging
        if (flags['seekSliderDragging']) {
            // pause the video and change the icon
            setVideoPlayerState('pause');

            /**/
            videoPlayer.currentTime = Math.max(0, Math.min(getPointerEventPct(pointer, boxes['seekSliderBox']), 1)) * videoPlayer.duration;

            // set the seek slider and timeline slider
            setSeekSlider();
            setTimelineSlider(); 

            // set the video current time label
            currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
        }
        else {
            // check if the timeline slider is dragging
            if (flags['timelineSliderDragging']) {
                // pause the video and change the icon
                setVideoPlayerState('pause');

                /**/
                videoPlayer.currentTime = Math.max(0, Math.min(getPointerEventPct(pointer, boxes['timelineSliderBox']), 1)) * state['timeline'].getDuration() + state['timeline'].getStartTime();

                // set the seek slider and timeline slider
                setSeekSlider();
                setTimelineSlider();

                // set the video current time label
                currentVideoTimeLabel.textContent = getReadableDuration(videoPlayer.currentTime);
            }
            else {
                if (flags['volumeSliderDragging']) {
                    // update the video volume and settings cache
                    videoPlayer.volume = data['settings']['volume'] = Math.max(0, Math.min(getPointerEventPct(pointer, boxes['volumeSliderBox']), 1));
                    videoPlayer.muted = data['settings']['volumeMuted'] = videoPlayer.volume === 0;

                    // set the volume slider
                    setVolumeSlider();
                }
                else {
                    if (flags['playbackRateSliderDragging']) {
                        // update the video playback rate
                        videoPlayer.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(-2, Math.min(Math.round(getPointerEventLoc(pointer, boxes['playbackRateSliderBox']) / (boxes['playbackRateSliderBox'].width / 6) - 2), 4))];

                        // set the playback rate slider
                        setPlaybackRateSlider();
                    }
                }
            }
        }
    });
}

/**
 * Sets the video player state
 * @param {string} action - The action to take on the video player state
 */
function setVideoPlayerState(action) {
    switch (action) {
        case 'play':
            // play the video, change the icon to pause, hide the overlay
            setIcon(playPauseIcon, 'pause');
            playPauseOverlayIcon.style.opacity = '';
            videoPlayer.play();
            break;
        case 'pause':
            // pause the video, change the icon to play, show the overlay
            setIcon(playPauseIcon, 'play-arrow');
            playPauseOverlayIcon.style.opacity = '1';
            videoPlayer.pause();
            break;
        case 'toggle':
            // play/pause the video, change the icon to the opposite, toggle the overlay
            if (videoPlayer.paused || videoPlayer.ended) {
                setIcon(playPauseIcon, 'pause');
                playPauseOverlayIcon.style.opacity = '';
                videoPlayer.play();
            }
            else {
                setIcon(playPauseIcon, 'play-arrow');
                playPauseOverlayIcon.style.opacity = '1';
                videoPlayer.pause();
            }
            break;
        case 'standby':
            // pause the video, change the icon to pause, hide the overlay
            setIcon(playPauseIcon, 'pause');
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
 * @returns {string} The readable duration (hh:mm:ss or mm:ss)
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

/**
 * Sets the seek slider thumb and overlay
 */
function setSeekSlider() {
    setSeekThumb(videoPlayer.currentTime / videoPlayer.duration * boxes['seekSliderBox'].width);
    setSeekOverlay(videoPlayer.currentTime / videoPlayer.duration * 100);
}

/**
 * Sets the seek slider track
 * 
 * @param {number} thumbLocation - The location of the seek thumb
 */
function setSeekTrack(thumbLocation) {
    seekTrack.style.background = `linear-gradient(to right, var(--strack-lgradientcolor) ${thumbLocation}%, var(--strack-bgcolor) ${thumbLocation}%`;
}

/**
 * Sets the seek slider overlay
 * 
 * @param {number} thumbLocation - The location of the seek thumb
 */
function setSeekOverlay(thumbLocation) {
    seekOverlay.style.background = `linear-gradient(to right, var(--soverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the seek slider thumb
 * 
 * @param {number} thumbLocation - The location of the seek thumb
 */
function setSeekThumb(thumbLocation) {
    seekThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the seek slider
 */
function updateSeekSlider() {
    // get the new seek slider bounding box
    boxes['seekSliderBox'] = seekSlider.getBoundingClientRect();

    // if the video is loaded, set the new playback thumb position
    if (flags['videoLoaded']) {
        setSeekSlider();
    }
}

/**
 * Sets the volume slider thumb and overlay
 */
function setVolumeSlider() { 
    // if the video is muted, move the slider to the left and set the muted icon
    if (videoPlayer.muted) {
        setIcon(volumeIcon, 'volume-off');

        setVolumeThumb(0);
        setVolumeOverlay(0);
    }
    else {
        // else, set the correct volume icon
        if (videoPlayer.volume > 0.6) {
            setIcon(volumeIcon, 'volume-up');
        }
        else {
            if (videoPlayer.volume > 0.1) {
                setIcon(volumeIcon, 'volume-down');
            }
            else {
                setIcon(volumeIcon, 'volume-mute');
            }
        }

        // set the volume thumb and overlay (trailing bar)
        setVolumeThumb(videoPlayer.volume * volumeSliderWidth);
        setVolumeOverlay(videoPlayer.volume * 100);
    }
}

/**
 * Sets the volume slider overlay
 * 
 * @param {number} thumbLocation - The location of the volume thumb
 */
function setVolumeOverlay(thumbLocation) {
    volumeOverlay.style.background = `linear-gradient(to right, var(--voverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the volume slider thumb
 * 
 * @param {number} thumbLocation - The location of the volume thumb
 */
function setVolumeThumb(thumbLocation) {
    volumeThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the volume slider
 */
function updateVolumeSlider() {
    flags['updateVolumeSlider'] = true;
}

/**
 * Sets the playback rate slider thumb
 */
function setPlaybackRateSlider() {
    playbackRateLabel.textContent = videoPlayer.playbackRate;
    setPlaybackRateThumb(playbackRateSliderWidth / 6 * (PLAYBACK_RATE_MAPPING[videoPlayer.playbackRate] + 2));
}

/**
 * Sets the playback rate slider thumb
 * 
 * @param {number} thumbLocation - The location of the playback rate thumb
 */
function setPlaybackRateThumb(thumbLocation) {
    playbackRateThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the playback rate slider
 */
function updatePlaybackRateSlider() {
    flags['updatePlaybackRateSlider'] = true;
}

/**
 * Sets the timeline slider thumb
 */
function setTimelineSlider() {
    setTimelineThumb(Math.max(0, Math.min((videoPlayer.currentTime - state['timeline'].getStartTime()) / state['timeline'].getDuration(), 1) * boxes['timelineSliderBox'].width));
}

/**
 * Sets the timeline overlay
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
 * Sets the timeline slider thumb
 * 
 * @param {number} thumbLocation - The location of the timeline thumb
 */
function setTimelineThumb(thumbLocation) {
    // get the percentage location of the video time within the timeline bounding box
    timelineThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the timeline slider
 */
function updateTimelineSlider() {
    // get the new timeline slider bounding box
    boxes['timelineSliderBox'] = timelineSlider.getBoundingClientRect();

    // set the timeline marker viewbox
    timelineOverlay.setAttribute('viewbox', `0 0 ${boxes['timelineSliderBox'].width} 60`);

    // if the video is loaded, set the new timeline overlay and thumb position
    if (flags['videoLoaded']) {
        setTimelineOverlay();
        setTimelineSlider();
    }
}

/**
 * Syncs the seek and timeline thumbs to the video frame
 */
function syncSeekTimelineSliders() {
    // set the seek slider and timeline slider
    setSeekSlider();
    setTimelineSlider();

    // request the next animation frame if the video is playing
    if (!videoPlayer.paused && !videoPlayer.ended) {
        state['animationID'] = requestAnimationFrame(syncSeekTimelineSliders);
    }
}