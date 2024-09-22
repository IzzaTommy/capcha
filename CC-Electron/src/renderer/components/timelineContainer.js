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

export { initTimelineContainer }

function initTimelineContainer() {
    // changes video time based on timeline bounds and playblack slider click location
    timelineInput.addEventListener('input', () => {
        // make sure clicks on the playback slider are within the timeline's start and end times
        if (timelineInput.value < timelineState.getStartTime() || timelineInput.value >= timelineState.getEndTime()) {
            // update the playback slider and video time
            playbackInput.value = timelineState.getStartTime();
            video.currentTime = timelineState.getStartTime();
        }
        else {
            playbackInput.value = timelineInput.value;
            video.currentTime = timelineInput.value;
        }

        // update the current video time text
        timeSpan.textContent = getTimeText(timelineInput.value);
    });

    // "zoom" in and out of the timeline with the scroll wheel
    timelineInput.addEventListener('wheel', (pointer) => {
        const timelineBox = timelineInput.getBoundingClientRect();
        // get the timeline's start time, end time, and content box
        const startTime = timelineState.getStartTime();
        const endTime = timelineState.getEndTime();
        const duration = timelineState.getDuration();

        // check if the scroll was within the timeline range
        if (pointer.clientX > timelineBox.left && pointer.clientX < timelineBox.right) {
            // get the percentage of the timeline where the event occurred
            const percentage = getPercentage(pointer, timelineBox);

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
                if (duration < video.duration) {
                    // calculate the new start and end times
                    const newStartTime = startTime - (GROW_FACTOR * duration * percentage);
                    const newEndTime = endTime + (GROW_FACTOR * duration * (1 - percentage));

                    // check if "zoom out" would bring time the time out of bounds
                    if (newStartTime < 0) {
                        // reallocate grow factor to the end time if needed
                        timelineState.update(
                            0, 
                            (newEndTime > video.duration) ? video.duration : ((Math.abs(newStartTime) + newEndTime) > video.duration ? video.duration : (Math.abs(newStartTime) + newEndTime))
                        );
                    }
                    else {
                        // reallocate grow factor to the start time if needed
                        timelineState.update(
                            (newEndTime > video.duration) ? ((newStartTime - (newEndTime - video.duration)) < 0 ? 0 : (newStartTime - (newEndTime - video.duration))) : newStartTime, 
                            (newEndTime > video.duration) ? video.duration : newEndTime
                        );
                    }
                }
            }

            // redraw the tick marks
            drawTicks();

            // check if the scrubber would be out of the timeline, put it back in bounds
            if (video.currentTime < timelineState.getStartTime()) {
                video.currentTime = timelineState.getStartTime();
                playbackInput.value = timelineState.getStartTime();
                timelineInput.value = timelineState.getStartTime();
            } 
            else {
                if (video.currentTime >= timelineState.getEndTime()) {
                    video.currentTime = timelineState.getEndTime();
                    playbackInput.value = timelineState.getEndTime();
                    timelineInput.value = timelineState.getEndTime();
                }
            }

            timelineInput.min = timelineState.getStartTime();
            timelineInput.max = timelineState.getEndTime();

            timeSpan.textContent = getTimeText(timelineInput.value);
        }
    });
}