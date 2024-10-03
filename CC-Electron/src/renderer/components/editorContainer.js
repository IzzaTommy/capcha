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

export { initVideoContainer, initTimelineContainer }

function initVideoContainer() {
    loadVideoEL();
}

function initTimelineContainer() {
    loadTimelineEL();
}

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
    // play/pause the video, update SVGs
    videoPlayer.addEventListener('click', () => setVideoState());

    // change the scrubber, playback slider, and time to match the current time
    videoPlayer.addEventListener('timeupdate', () => {
        if (flags['videoMetaDataLoaded']) {
            // check if the scrubber would be out of the timeline, put it back at the start
            // checking if the scrubber is before the start creates a race condition...
            if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();
                videoPlayer.play();
            }

            // update the scrubber, playback slider, and timer to match the current time
            if (playbackSlider.value != videoPlayer.currentTime || timelineSlider.value != videoPlayer.currentTime) {
                playbackSlider.value = videoPlayer.currentTime;
                timelineSlider.value = videoPlayer.currentTime;
            }

            // update the video time text
            currentTimeLabel.textContent = getReadableTime(videoPlayer.currentTime);
        }
    });

    // wait for the video meta data to load 
    videoPlayer.addEventListener('loadedmetadata', () => {
        timelineState.update(0, videoPlayer.duration);
        setTicks();

        // update timeline and playback slider range
        timelineSlider.min = 0;

        playbackSlider.max = videoPlayer.duration;
        timelineSlider.max = videoPlayer.duration;

        playbackSlider.value = 0;
        timelineSlider.value = 0;

        // sliding to 0 is buggy if the step is too small /* change with animation? */
        if (videoPlayer.duration < 60) {
            playbackSlider.step = 0.1;
            timelineSlider.step = 0.1;
        }
        else {
            playbackSlider.step = 0.01;
            timelineSlider.step = 0.01;
        }

        // set the default timer/duration
        currentTimeLabel.textContent = '0:00';
        totalTimeLabel.textContent = `/${getReadableTime(videoPlayer.duration)}`;

        flags['videoMetaDataLoaded'] = true;

        // auto play video
        setVideoState();
    });

    /* ---------- playback bar event listeners ---------- */
    // changes video time based on timeline bounds and playblack slider click location
    playbackSlider.addEventListener('input', () => {
        // make sure clicks on the playback slider are within the timeline's start and end times
        if (playbackSlider.value < timelineState.getStartTime() || playbackSlider.value >= timelineState.getEndTime()) {
            // update the timeline slider and video time
            timelineSlider.value = timelineState.getStartTime();
            videoPlayer.currentTime = timelineState.getStartTime();
        }
        else {
            timelineSlider.value = playbackSlider.value;
            videoPlayer.currentTime = playbackSlider.value;
        }

        // update the current video time text
        currentTimeLabel.textContent = getReadableTime(playbackSlider.value);
    });

    // create a hover highlight based on pointer location
    playbackSlider.addEventListener('mousemove', (pointer) => {
        const playbackSliderPct = getClickPercentage(pointer, boxes['playbackSliderBox']) * 100;
        
        playbackSlider.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${playbackSliderPct}%, transparent ${playbackSliderPct}%)`;
    });

    // revert the hover hightlight
    playbackSlider.addEventListener('mouseleave', () => {
        playbackSlider.style.backgroundImage = 'none';
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

    /* ---------- timeline event listeners ---------- */
    // change the default volume
    videoPlayer.volume = settingsCache['volume'];
    videoPlayer.muted = settingsCache['volumeMuted']
    if (!videoPlayer.muted) {
        volumeSlider.stepUp(videoPlayer.volume * 100);
    }
    
    setVolumeSVG();
}

function loadTimelineEL() {
    // changes video time based on timeline bounds and playblack slider click location
    timelineSlider.addEventListener('input', () => {
        // make sure clicks on the playback slider are within the timeline's start and end times
        if (timelineSlider.value < timelineState.getStartTime() || timelineSlider.value >= timelineState.getEndTime()) {
            // update the playback slider and video time
            playbackSlider.value = timelineState.getStartTime();
            videoPlayer.currentTime = timelineState.getStartTime();
        }
        else {
            playbackSlider.value = timelineSlider.value;
            videoPlayer.currentTime = timelineSlider.value;
        }

        // update the current video time text
        currentTimeLabel.textContent = getReadableTime(timelineSlider.value);
    });

    // "zoom" in and out of the timeline with the scroll wheel
    timelineSlider.addEventListener('wheel', (pointer) => {
        // get the timeline's start time, end time, and content box
        const startTime = timelineState.getStartTime();
        const endTime = timelineState.getEndTime();
        const duration = timelineState.getDuration();

        // check if the scroll was within the timeline range
        if (pointer.clientX > boxes['timelineSliderBox'].left && pointer.clientX < boxes['timelineSliderBox'].right) {
            // get the percentage of the timeline where the event occurred
            const percentage = getClickPercentage(pointer, boxes['timelineSliderBox']);

            // check if the pointer scrolled up ("zoom in")
            if (pointer.deltaY < 0) {
                // check if timeline is not at maximum zoom
                if (duration > 30) {
                    // adjust the timeline start time, end time, and interval
                    timelineState.update(
                        startTime + (REDUCE_FACTOR * duration * percentage), 
                        endTime - (REDUCE_FACTOR * duration * (1 - percentage))
                    );
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
                }
            }

            // redraw the tick marks
            setTicks();

            // check if the scrubber would be out of the timeline, put it back in bounds
            if (videoPlayer.currentTime < timelineState.getStartTime()) {
                videoPlayer.currentTime = timelineState.getStartTime();
                playbackSlider.value = timelineState.getStartTime();
                timelineSlider.value = timelineState.getStartTime();
            } 
            else {
                if (videoPlayer.currentTime >= timelineState.getEndTime()) {
                    videoPlayer.currentTime = timelineState.getEndTime();
                    playbackSlider.value = timelineState.getEndTime();
                    timelineSlider.value = timelineState.getEndTime();
                }
            }

            timelineSlider.min = timelineState.getStartTime();
            timelineSlider.max = timelineState.getEndTime();

            currentTimeLabel.textContent = getReadableTime(timelineSlider.value);
        }
    });
}
// send the video player volume when requested
window.settingsAPI.reqVolumeSettings(() => {
    window.settingsAPI.setVolumeSettings({ 'volume': settingsCache['volume'], 'volumeMuted': settingsCache['volumeMuted'] });
});