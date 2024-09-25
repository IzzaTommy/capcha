import { GROW_FACTOR, REDUCE_FACTOR, 
    minimizeBtn, maximizeBtn, closeBtn, navBar, directoryBtn, directorySVG, settingsBtn, settingsSVG, recordBtn, recordSVG, 
    navExpander, navExpanderSVG, 
    directorySection, editorSection, settingsSection, 
    videoContainer, video, playbackInput, 
    playPauseBtn, playPauseSVG, volumeBtn, volumeSVG, volumeInput, timeSpan, durationSpan, speedInput, speedBtn, speedSpan, fullscreenBtn, fullscreenSVG, 
    timelineSVG, timelineInput, timelineState, 
    settingsInputSelect, saveLocationInput, capturesGallery, videoPreviewTemplate, 
    flags, 
    settingsCache, 
    videosData } from './variables.js';

import { getPercentage, swapSVG, drawTicks, getTimeText, setVolumeSVG, playPauseVideo } from './util.js';

export { initVideoContainer }

function initVideoContainer() {
    /* ---------- video container event listeners ---------- */
    // changes SVGs, accounts for exiting fullscreen using ESC key
    videoContainer.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            swapSVG(fullscreenSVG, 'fullscreen-exit');
        }
        else {
            swapSVG(fullscreenSVG, 'fullscreen');
        }
    });

    /* ---------- video event listeners ---------- */
    // play/pause the video, update SVGs
    video.addEventListener('click', () => playPauseVideo());

    // change the scrubber, playback slider, and time to match the current time
    video.addEventListener('timeupdate', () => {
        if (flags['videoMetaDataLoaded']) {
            // check if the scrubber would be out of the timeline, put it back at the start
            // checking if the scrubber is before the start creates a race condition...
            if (video.currentTime >= timelineState.getEndTime()) {
                video.currentTime = timelineState.getStartTime();
                video.play();
            }

            // update the scrubber, playback slider, and timer to match the current time
            if (playbackInput.value != video.currentTime || timelineInput.value != video.currentTime) {
                playbackInput.value = video.currentTime;
                timelineInput.value = video.currentTime;
            }

            // update the video time text
            timeSpan.textContent = getTimeText(video.currentTime);
        }
    });

    // wait for the video meta data to load 
    video.addEventListener('loadedmetadata', () => {
        timelineState.update(0, video.duration);
        drawTicks();

        // update timeline and playback slider range
        timelineInput.min = 0;

        playbackInput.max = video.duration;
        timelineInput.max = video.duration;

        playbackInput.value = 0;
        timelineInput.value = 0;

        // sliding to 0 is buggy if the step is too small /* change with animation? */
        if (video.duration < 60) {
            playbackInput.step = 0.1;
            timelineInput.step = 0.1;
        }
        else {
            playbackInput.step = 0.01;
            timelineInput.step = 0.01;
        }

        // set the default timer/duration
        timeSpan.textContent = '0:00';
        durationSpan.textContent = `/${getTimeText(video.duration)}`;

        flags['videoMetaDataLoaded'] = true;

        // auto play video
        playPauseVideo();
    });

    /* ---------- playback bar event listeners ---------- */
    // changes video time based on timeline bounds and playblack slider click location
    playbackInput.addEventListener('input', () => {
        // make sure clicks on the playback slider are within the timeline's start and end times
        if (playbackInput.value < timelineState.getStartTime() || playbackInput.value >= timelineState.getEndTime()) {
            // update the timeline slider and video time
            timelineInput.value = timelineState.getStartTime();
            video.currentTime = timelineState.getStartTime();
        }
        else {
            timelineInput.value = playbackInput.value;
            video.currentTime = playbackInput.value;
        }

        // update the current video time text
        timeSpan.textContent = getTimeText(playbackInput.value);
    });

    // create a hover highlight based on pointer location
    playbackInput.addEventListener('mousemove', (pointer) => {
        const playbackInputBox = playbackInput.getBoundingClientRect();
        const playbackInputPct = getPercentage(pointer, playbackInputBox) * 100;
        
        playbackInput.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${playbackInputPct}%, transparent ${playbackInputPct}%)`;
    });

    // revert the hover hightlight
    playbackInput.addEventListener('mouseleave', () => {
        playbackInput.style.backgroundImage = 'none';
    });

    // play/pause the video, update SVGs
    playPauseBtn.addEventListener('click', () => playPauseVideo());

    // update volume mute and SVG
    volumeBtn.addEventListener('click', () => {
        // unmute if the video is muted
        if (video.muted) {
            video.muted = false;

            // change volume to 0.1 if it was 0
            if (video.volume === 0) {
                video.volume = 0.1;
                settingsCache['volume'] = video.volume;
            }

            // update the volume input slider to match volume
            volumeInput.stepUp(video.volume * 100);
        }
        else {
            // mute the video
            video.muted = true;

            // update the volume input slider to match volume
            volumeInput.stepDown(video.volume * 100);
        }

        // cache the mute status
        settingsCache['volumeMuted'] = video.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // update based on volume slider input
    volumeInput.addEventListener('input', () => {
        // mute video if volume is 0
        if (volumeInput.value == 0) {
            video.muted = true;
        }
        else {
            video.muted = false;
        }

        // set the video volume and cache volume data
        video.volume = volumeInput.value;
        settingsCache['volume'] = video.volume;
        settingsCache['volumeMuted'] = video.muted;

        // change the volume SVG
        setVolumeSVG();
    });

    // change playback speed/text based on speed slider input
    speedInput.addEventListener('input', () => {
        switch (speedInput.value) {
            case '-2':
                video.playbackRate = 0.2;
                speedSpan.textContent = '0.2';
                break;
            case '-1':
                video.playbackRate = 0.5;
                speedSpan.textContent = '0.5';
                break;
            case '0':
                video.playbackRate = 0.7;
                speedSpan.textContent = '0.7';
                break;
            default:
                video.playbackRate = speedInput.value;
                speedSpan.textContent = speedInput.value;
        }
    });

    // revert playback speed/text/speed slider to normal speed
    speedBtn.addEventListener('click', () => {
        video.playbackRate = 1;
        speedSpan.textContent = '1';

        if (speedInput.value < 1) {
            speedInput.stepUp(Math.abs(speedInput.value - 1));
        }
        else {
            speedInput.stepDown(speedInput.value - 1);
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
    // resize timeline viewbox on window resize
    window.addEventListener('resize', () => {
        timelineSVG.setAttribute('viewbox', `0 0 ${timelineSVG.getBoundingClientRect().width} 60`);

        if (flags['videoMetaDataLoaded']) {
            drawTicks();
        }
    });

    // change the default volume
    video.volume = settingsCache['volume'];
    video.muted = settingsCache['volumeMuted']
    if (!video.muted) {
        volumeInput.stepUp(video.volume * 100);
    }
    
    setVolumeSVG();
}

// send the video player volume when requested
window.settingsAPI.reqVolumeSettings(() => {
    window.settingsAPI.setVolumeSettings({ 'volume': settingsCache['volume'], 'volumeMuted': settingsCache['volumeMuted'] });
});