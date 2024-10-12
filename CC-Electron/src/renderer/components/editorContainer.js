import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navToggleBtn, navToggleSVG, 
    directoryContainer1, editorContainer1, settingsContainer1, 
    videoContainer, videoPlayer, playbackContainer, playbackSlider, playbackTrack, playbackThumb, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeSlider, currentTimeLabel, totalTimeLabel, speedSlider, speedBtn, speedLabel, fullscreenBtn, fullscreenSVG, 
    timelineTrack, timelineThumb, timelineState,  
    allSettingPill, saveLocationSettingPill, 
    capturesGallery, videoPreviewTemplate, videoPreviewWidth, capturesLeftBtn, capturesRightBtn, 
    flags, boxes, 
    settingsCache, 
    videosData } from './variables.js';

import { getClickPercentage, setSVG, setTicks, getReadableTime, setVolumeSVG, setVideoState, setBoxWidths, setGalleryGap } from './shared.js';

export { initVideoContainer, initTimelineContainer }

function initVideoContainer() {
    loadVideoEL();
}

function initTimelineContainer() {
    loadTimelineEL();
}

let oldTime = 0;

function loadVideoEL() {
    
    /* ---------- video container event listeners ---------- */
    // changes SVGs, accounts for exiting fullscreen using ESC key
    videoContainer.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            setSVG(fullscreenSVG, 'fullscreen-exit');
        }
        else {
            setSVG(fullscreenSVG, 'fullscreen');
        }
    });

    /* ---------- video event listeners ---------- */
    videoPlayer.addEventListener('pause', () => {
        playbackContainer.style.opacity = "1";
    });

    videoPlayer.addEventListener('play', () => playbackContainer.style.opacity = "");

    // play/pause the video, update SVGs
    videoPlayer.addEventListener('click', () => setVideoState());

    // change the scrubber, playback slider, and time to match the current time
    videoPlayer.addEventListener('timeupdate', () => {
        if (flags['videoMetaDataLoaded']) {
            console.log(oldTime, videoPlayer.currentTime, videoPlayer.duration);
            // check if the scrubber would be out of the timeline, put it back at the start
            // checking if the scrubber is before the start creates a race condition...
            if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();
                videoPlayer.play();
            }

            playbackThumb.style.transition = `transform ${videoPlayer.currentTime - oldTime}s linear 0s`;
            timelineThumb.style.transition = `transform ${videoPlayer.currentTime - oldTime}s linear 0s`;
            updatePlaybackThumb();
            updateTimelineThumb();

            oldTime = videoPlayer.currentTime;

            // update the video time text
            currentTimeLabel.textContent = getReadableTime(videoPlayer.currentTime);
        }
    });

    // wait for the video meta data to load 
    videoPlayer.addEventListener('loadedmetadata', () => {
        playbackThumb.style.transition = '';
        timelineThumb.style.transition = '';

        oldTime = 0;
        timelineState.update(0, videoPlayer.duration);
        setTicks();

        // set the default timer/duration
        currentTimeLabel.textContent = '0:00';
        totalTimeLabel.textContent = `/${getReadableTime(videoPlayer.duration)}`;

        flags['videoMetaDataLoaded'] = true;

        // auto play video
        setVideoState();
    });

    /* ---------- playback bar event listeners ---------- */
    // change the video time based on the click location of the timeline
    playbackSlider.addEventListener('click', (pointer) => {
        const test = videoPlayer.duration * getClickPercentage(pointer, boxes['playbackSliderBox']);

        // make sure clicks on the playback slider are within the timeline's start and end times
        if (test < timelineState.getStartTime() || test >= timelineState.getEndTime()) {
            // update the timeline slider and video time
            videoPlayer.currentTime = timelineState.getStartTime();
        }
        else {
            videoPlayer.currentTime = test;
        }

        playbackThumb.style.transition = '';
        timelineThumb.style.transition = '';

        updatePlaybackThumb();
        updateTimelineThumb();
    });

    // create a hover highlight based on pointer location
    playbackSlider.addEventListener('mousemove', (pointer) => {
        const playbackSliderPct = getClickPercentage(pointer, boxes['playbackSliderBox']) * 100;
        
        playbackTrack.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${playbackSliderPct}%, transparent ${playbackSliderPct}%)`;
    });

    // revert the hover hightlight
    playbackSlider.addEventListener('mouseleave', () => {
        playbackTrack.style.backgroundImage = 'none';
    });

    // play/pause the video, update SVGs
    playPauseBtn.addEventListener('click', () => setVideoState());

    // update volume mute and SVG
    volumeBtn.addEventListener('click', () => {
        // unmute if the video is muted
        if (videoPlayer.muted) {
            videoPlayer.muted = false;

            // change volume to 0.1 if it was 0
            if (videoPlayer.volume === 0) {
                videoPlayer.volume = 0.1;
                settingsCache['volume'] = videoPlayer.volume;
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
        settingsCache['volumeMuted'] = videoPlayer.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // update based on volume slider input
    volumeSlider.addEventListener('input', () => {
        // mute video if volume is 0
        if (volumeSlider.value == 0) {
            videoPlayer.muted = true;
        }
        else {
            videoPlayer.muted = false;
        }

        // set the video volume and cache volume data
        videoPlayer.volume = volumeSlider.value;
        settingsCache['volume'] = videoPlayer.volume;
        settingsCache['volumeMuted'] = videoPlayer.muted;

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
    videoPlayer.volume = settingsCache['volume'];
    videoPlayer.muted = settingsCache['volumeMuted']
    if (!videoPlayer.muted) {
        volumeSlider.stepUp(videoPlayer.volume * 100);
    }
    
    setVolumeSVG();
}

/* ---------- timeline event listeners ---------- */
function loadTimelineEL() {
    // change the video time based on the click location of the timeline
    timelineTrack.addEventListener('click', (pointer) => {
        videoPlayer.currentTime = ((timelineState.getEndTime() - timelineState.getStartTime()) * getClickPercentage(pointer, boxes['timelineTrackBox'])) + timelineState.getStartTime();

        playbackThumb.style.transition = '';
        timelineThumb.style.transition = '';

        updatePlaybackThumb();
        updateTimelineThumb();
    });

    // "zoom" in and out of the timeline with the scroll wheel
    timelineTrack.addEventListener('wheel', (pointer) => {
        // get the timeline's start time, end time, and content box
        const startTime = timelineState.getStartTime();
        const endTime = timelineState.getEndTime();
        const duration = timelineState.getDuration();

        // check if the scroll was within the timeline range
        if (pointer.clientX > boxes['timelineTrackBox'].left && pointer.clientX < boxes['timelineTrackBox'].right) {
            // get the percentage of the timeline where the event occurred
            const percentage = getClickPercentage(pointer, boxes['timelineTrackBox']);

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
                        (newDuration < 30) ? newStartTime - (30 - newDuration) * percentage : newStartTime,
                        (newDuration < 30) ? newStartTime - (30 - newDuration) * percentage + 30 : newEndTime
                    );

                    // redraw the tick marks
                    setTicks();

                    // check if the scrubber would be out of the timeline, put it back in bounds
                    if (videoPlayer.currentTime < timelineState.getStartTime()) {
                        videoPlayer.currentTime = timelineState.getStartTime();
                    } 
                    else {
                        if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                            videoPlayer.currentTime = timelineState.getEndTime();
                        }
                    }

                    playbackThumb.style.transition = '';
                    timelineThumb.style.transition = '';
                    updatePlaybackThumb();
                    updateTimelineThumb();

                    currentTimeLabel.textContent = getReadableTime(videoPlayer.currentTime);

                    
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
                            (newEndTime > videoPlayer.duration) ? videoPlayer.duration : ((Math.abs(newStartTime) + newEndTime) > videoPlayer.duration ? videoPlayer.duration : (Math.abs(newStartTime) + newEndTime))
                        );
                    }
                    else {
                        // reallocate grow factor to the start time if needed
                        timelineState.update(
                            (newEndTime > videoPlayer.duration) ? ((newStartTime - (newEndTime - videoPlayer.duration)) < 0 ? 0 : (newStartTime - (newEndTime - videoPlayer.duration))) : newStartTime, 
                            (newEndTime > videoPlayer.duration) ? videoPlayer.duration : newEndTime
                        );
                    }

                    // redraw the tick marks
                    setTicks();

                    // check if the scrubber would be out of the timeline, put it back in bounds
                    if (videoPlayer.currentTime < timelineState.getStartTime()) {
                        videoPlayer.currentTime = timelineState.getStartTime();
                    } 
                    else {
                        if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                            videoPlayer.currentTime = timelineState.getEndTime();
                        }
                    }

                    playbackThumb.style.transition = '';
                    timelineThumb.style.transition = '';
                    updatePlaybackThumb();
                    updateTimelineThumb();

                    currentTimeLabel.textContent = getReadableTime(videoPlayer.currentTime);
                }
            }
        }
    });

    timelineThumb.addEventListener('mousedown', () => {
        flags['timelineDragging'] = true;
    });

    timelineTrack.addEventListener('mousedown', () => {
        flags['timelineDragging'] = true;
    });

    playbackSlider.addEventListener('mousedown', () => {
        flags['playbackDragging'] = true;
    });

    document.addEventListener('mouseup', () => {
        flags['timelineDragging'] = false;
        flags['playbackDragging'] = false;
    });

    document.addEventListener('mousemove', (pointer) => {
        if (flags['timelineDragging']) {
            // get the percentage of the timeline where the event occurred
            let percentage;
            // get the mouse X location relative to the timeline start
            let pointerX = pointer.clientX - boxes['timelineTrackBox'].left;

            // make sure the scrubber is within the bounds of the timeline
            if (pointerX < 0) {
                pointerX = 0;
                percentage = 0;
            }
            else {
                if (pointerX > boxes['timelineTrackBox'].width) {
                    pointerX = boxes['timelineTrackBox'].width;
                    percentage = 1;
                }
                else {
                    percentage = getClickPercentage(pointer, boxes['timelineTrackBox']);
                }
            }

            // move the scrubber to the right position
            timelineThumb.style.transform = `translateX(${pointerX}px)`;

            // update the video time based on position of the scrubber
            videoPlayer.currentTime = timelineState.getStartTime() + (percentage * (timelineState.getEndTime() - timelineState.getStartTime()));

            playbackThumb.style.transition = '';
            timelineThumb.style.transition = '';
            updatePlaybackThumb();
            updateTimelineThumb();
        }
        
        if (flags['playbackDragging']) {
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
                    percentage = getClickPercentage(pointer, boxes['playbackSliderBox']);
                }
            }

            // move the scrubber to the right position
            playbackThumb.style.transform = `translateX(${pointerX}px)`;

            // update the video time based on position of the scrubber
            videoPlayer.currentTime = percentage * videoPlayer.duration;

            playbackThumb.style.transition = '';
            timelineThumb.style.transition = '';
            updatePlaybackThumb();
            updateTimelineThumb();
        }
    });
}

// send the video player volume when requested
window.settingsAPI.reqVolumeSettings(() => {
    window.settingsAPI.setVolumeSettings({ 'volume': settingsCache['volume'], 'volumeMuted': settingsCache['volumeMuted'] });
});








// gets the scrubber percentage in the timeline bounding box
function getThumbPercentage() {
    return (videoPlayer.currentTime - timelineState.getStartTime()) / timelineState.getDuration();
}

// updates the scrubber location
function updateTimelineThumb() {
    if (getThumbPercentage() < 0)
    {
        timelineThumb.style.transform = `translateX(0px)`;
    }
    else {
        if (getThumbPercentage() > 1) {
            timelineThumb.style.transform = `translateX(${boxes['timelineTrackBox'].width}px)`;
        }
        else {
            timelineThumb.style.transform = `translateX(${getThumbPercentage() * boxes['timelineTrackBox'].width}px)`;
        }
    }
}

// updates the scrubber location
function updatePlaybackThumb() {
    if (videoPlayer.currentTime / videoPlayer.duration < 0)
    {
        playbackThumb.style.transform = `translateX(0px)`;
    }
    else {
        if (videoPlayer.currentTime / videoPlayer.duration > 1) {
            playbackThumb.style.transform = `translateX(${boxes['playbackSliderBox'].width}px)`;
        }
        else {
            playbackThumb.style.transform = `translateX(${videoPlayer.currentTime / videoPlayer.duration * boxes['playbackSliderBox'].width}px)`;
        }
    }
}