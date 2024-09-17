import { TimelineState } from './timelineState.js';

// wait for DOM to finish loading
window.addEventListener('DOMContentLoaded', init);

async function init() {
    /* ========== elements ========== */

    /* ---------- title bar elements---------- */
    const minimizeBtn = document.querySelector('#minimize-trigger');
    const maximizeBtn = document.querySelector('#maximize-trigger');
    const closeBtn = document.querySelector('#close-trigger');

    /* ---------- nav panel elements---------- */
    const navBar = document.querySelector('#nav-bar');

    const directoryBtn = document.querySelector('#directory-trigger');
    const directorySVG = directoryBtn.querySelector('svg > use');

    const settingsBtn = document.querySelector('#settings-trigger');
    const settingsSVG = settingsBtn.querySelector('svg > use');

    const recordBtn = document.querySelector('#record-trigger');
    const recordSVG = recordBtn.querySelector('svg > use');

    const navExpander = document.querySelector('#nav-expander');
    const navExpanderSVG = navExpander.querySelector('svg > use');

    /* ---------- content panel elements---------- */
    const directorySection = document.getElementById('directory-section');
    const editorSection = document.getElementById('editor-section');
    const settingsSection = document.getElementById('settings-section');

    /* ---------- editor section elements---------- */
    const videoContainer = document.querySelector('#video-container');

    const video = document.querySelector('#video-player');

    const playbackInput = document.querySelector('#playback-slider');
    const playbackInputBox = playbackInput.getBoundingClientRect();

    const playPauseBtn = document.querySelector('#play-pause-control');
    const playPauseSVG = playPauseBtn.querySelector('svg > use');

    const volumeBtn = document.querySelector('#volume-control');
    const volumeSVG = volumeBtn.querySelector('svg > use');
    const volumeInput = document.querySelector('#volume-slider');

    const timeSpan = document.querySelector('#current-time');
    const durationSpan = document.querySelector('#total-time');

    const speedInput = document.querySelector('#speed-slider');
    const speedBtn = document.querySelector('#speed-control');
    const speedSpan = speedBtn.querySelector('#current-speed');

    const fullscreenBtn = document.querySelector('#fullscreen-control');
    const fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    const timeline = document.querySelector('#timeline-marker');
    const timelineInput = document.querySelector('#timeline-slider');

    /* ---------- settings section elements---------- */
    const settingsInput = document.querySelectorAll('.setting > div > input');
    const settingsSelect = document.querySelectorAll('.setting > div > select');
    const saveLocationInput = document.querySelector('#save-location-setting > div > input');
    // const storageLimitSelect = document.querySelector('#storage-limit-setting > div > select');
    // const fileExtensionSelect = document.querySelector('#file-extension-setting > div > select');
    // const encoderSelect = document.querySelector('#encoder-setting > div > select');
    const resolutionWidthInput = document.querySelector('#resolution-width-setting > div > input');
    const resolutionHeightInput = document.querySelector('#resolution-height-setting > div > input');
    // const framerateSelect = document.querySelector('#framerate-setting > div > select');
    // const bitrateSelect = document.querySelector('#bitrate-setting > div > select');


    const [settings] = await Promise.all([
        window.settingsAPI.getAllSettings(),
        preTitleBarInit(),
        preNavPanelInit(),
        preEditorSectionInit()
    ]);

    console.log(settings);

    postEditorSectionInit();
    postSettingsSectionInit();

    window.settingsAPI.onReqSave(() => {
        window.settingsAPI.setAllSettings(settings);
    });

    function postSettingsSectionInit() {
        for (const setting of settingsInput) {
            setting.value = settings[setting.name];
        }

        for (const setting of settingsSelect) {
            setting.value = settings[setting.name];

            setting.addEventListener('change', () => {
                if (isNaN(setting.value)) {
                    settings[setting.name] = setting.value;
                }
                else {
                    settings[setting.name] = Number(setting.value);
                }
            });
        }

        resolutionWidthInput.addEventListener('change', () => {
            if (resolutionWidthInput.value > 2560 || isNaN(resolutionWidthInput.value)) {
                settings['resolutionWidth'] = 2560;
                resolutionWidthInput.value = 2560;
            }
            else {
                if (resolutionWidthInput.value < 1) {
                    settings['resolutionWidth'] = 1;
                    resolutionWidthInput.value = 1;
                }
                else {
                    settings['resolutionWidth'] = Math.floor(resolutionWidthInput.value);
                    resolutionWidthInput.value = Math.floor(resolutionWidthInput.value);
                }
            }
        });

        resolutionHeightInput.addEventListener('change', () => {
            if (resolutionHeightInput.value > 1440 || isNaN(resolutionHeightInput.value)) {
                settings['resolutionHeight'] = 1440;
                resolutionHeightInput.value = 1440;
            }
            else {
                if (resolutionHeightInput.value < 1) {
                    settings['resolutionHeight'] = 1;
                    resolutionHeightInput.value = 1;
                }
                else {
                    settings['resolutionHeight'] = Math.floor(resolutionHeightInput.value);
                    resolutionHeightInput.value = Math.floor(resolutionHeightInput.value);
                }
            }
        });

        saveLocationInput.addEventListener('click', async () => {
            const newSaveLocation = await window.dialogAPI.getDirectory();

            if (newSaveLocation) {
                settings['saveLocation'] = newSaveLocation;
                saveLocationInput.value = newSaveLocation;
            }
        });
    }


    function preTitleBarInit() {
        // API calls for window manipulation
        minimizeBtn.addEventListener('click', () => window.titleBarAPI.minimize());
        maximizeBtn.addEventListener('click', () => window.titleBarAPI.maximize());
        closeBtn.addEventListener('click', () => window.titleBarAPI.close());
    }

    function preNavPanelInit() {
        // change the SVGs on hover
        directoryBtn.addEventListener('mouseenter', () => swapSVG(directorySVG, 'folder-solid'));
        directoryBtn.addEventListener('mouseleave', () => swapSVG(directorySVG, 'folder'));
        directoryBtn.addEventListener('click', () => {
            settingsSection.classList.remove('active');
            editorSection.classList.remove('active');
            directorySection.classList.add('active');
        });
    
        settingsBtn.addEventListener('mouseenter', () => swapSVG(settingsSVG, 'settings-solid'));
        settingsBtn.addEventListener('mouseleave', () => swapSVG(settingsSVG, 'settings'));
        settingsBtn.addEventListener('click', () => {
            directorySection.classList.remove('active');
            editorSection.classList.remove('active');
            settingsSection.classList.add('active');
        });
    
        recordBtn.addEventListener('mouseenter', () => swapSVG(recordSVG, 'record-solid'));
        recordBtn.addEventListener('mouseleave', () => swapSVG(recordSVG, 'record'));
        recordBtn.addEventListener('click', () => {
            directorySection.classList.remove('active');
            settingsSection.classList.remove('active');
            editorSection.classList.add('active');
        });
    
        navExpander.addEventListener('click', () => {
            navBar.classList.toggle('active');
    
            if (navBar.classList.contains('active')) {
                swapSVG(navExpanderSVG, 'arrow-back-ios');
            }
            else {
                swapSVG(navExpanderSVG, 'arrow-forward-ios');
            }
        });
    }

    function preEditorSectionInit() {
        // changes SVGs, accounts for exiting fullscreen using ESC key
        videoContainer.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement !== null) {
                swapSVG(fullscreenSVG, 'fullscreen-exit');
            }
            else {
                swapSVG(fullscreenSVG, 'fullscreen');
            }
        });

        // play/pause the video, update SVGs
        playPauseBtn.addEventListener('click', () => playPauseVideo());

        // update volume mute and SVG
        volumeBtn.addEventListener('click', () => {
            // unmute if the video is muted and change to the correct SVG
            if (video.muted) {
                video.muted = false;

                if (video.volume === 0) {
                    video.volume = 0.1;
                    swapSVG(volumeSVG, 'volume-down');
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

                // update the volume input slider to match volume
                volumeInput.stepUp(video.volume * 100);
            }
            else {
                // mute the video
                video.muted = true;
                // change to the correct SVG
                swapSVG(volumeSVG, 'volume-off');
                // update the volume input slider to match volume
                volumeInput.stepDown(video.volume * 100);
            }
        });

        // update volume and SVG based on volume slider input
        volumeInput.addEventListener('input', () => {
            // change the video volume
            video.volume = volumeInput.value;

            // mute the video and change to the correct SVG if volume is 0
            if (video.volume === 0) {
                video.muted = true;

                volumeSVG.setAttribute('href', 'assets/svg/volume-off.svg#volume-off');
            }
            else {
                // unmute the video and change to the correct SVG
                video.muted = false;

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
    }

    function postEditorSectionInit() {
        // wait for the video meta data to load 
        video.addEventListener('loadedmetadata', () => {
            const timelineState = new TimelineState(0, video.duration);

            initTimeline();
            initVideo();
            initPlaybackInput();

            // change the default volume
            video.volume = 0.5;
            volumeInput.stepUp(video.volume * 100);
            swapSVG(volumeSVG, 'volume-down');

            // set the default timer/duration
            timeSpan.textContent = '0:00';
            durationSpan.textContent = `/${getTimeText(video.duration)}`;

            function initTimeline() {
                window.addEventListener('resize', () => {
                    timeline.setAttribute('viewbox', `0 0 ${timeline.getBoundingClientRect().width} 60`);
            
                    drawTicks();
                });

                // update timeline slider range
                timelineInput.max = video.duration;

                // sliding to 0 is buggy if the step is too small /* change with animation? */
                if (video.duration < 60) {
                    timelineInput.step = 0.1;
                }

                // changes video time based on timeline bounds and playblack slider click location
                timelineInput.addEventListener('input', () => {
                    // make sure clicks on the playback slider are within the timeline's start and end times
                    if (timelineInput.value < timelineState.getStartTime() || timelineInput.value >= timelineState.getEndTime()) {
                        video.currentTime = timelineState.getStartTime();
                        playbackInput.value = timelineState.getStartTime();
                    }
                    else {
                        video.currentTime = timelineInput.value;
                        playbackInput.value = timelineInput.value;
                    }

                    timeSpan.textContent = getTimeText(timelineInput.value);
                });

                // draw the initial tick marks on the timeline
                drawTicks();

                // change the video time based on the click location of the timeline
                timeline.addEventListener('click', (pointer) => {
                    const timelineBox = timeline.getBoundingClientRect();

                    const newTime = (timelineState.getDuration() * getPercentage(pointer, timelineBox)) + timelineState.getStartTime();

                    video.currentTime = newTime;
                    playbackInput.value = newTime;
                    timelineInput.value = newTime;

                    timeSpan.textContent = getTimeText(newTime);
                });

                // "zoom" in and out of the timeline with the scroll wheel
                timeline.addEventListener('wheel', (pointer) => {
                    const timelineBox = timeline.getBoundingClientRect();
                    // get the timeline's start time, end time, and content box
                    const startTime = timelineState.getStartTime();
                    const endTime = timelineState.getEndTime();
                    const duration = timelineState.getDuration();
                    // values to grow/reduce timeline by
                    const growFactor = 0.15;
                    const reduceFactor = 0.1;

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
                                    startTime + (reduceFactor * duration * percentage), 
                                    endTime - (reduceFactor * duration * (1 - percentage))
                                );
                            }
                        }
                        else {
                            // check if the timeline is not at minimum zoom
                            if (duration < video.duration) {
                                // calculate the new start and end times
                                const newStartTime = startTime - (growFactor * duration * percentage);
                                const newEndTime = endTime + (growFactor * duration * (1 - percentage));

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



            function initVideo() {
                // play/pause the video, update SVGs
                video.addEventListener('click', () => playPauseVideo());

                // change the scrubber, playback slider, and time to match the current time
                video.addEventListener('timeupdate', () => {
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

                    timeSpan.textContent = getTimeText(video.currentTime);
                });
            }

            function initPlaybackInput() {
                // update playback slider range
                playbackInput.max = video.duration;

                // sliding to 0 is buggy if the step is too small /* change with animation? */
                if (video.duration < 60) {
                    playbackInput.step = 0.1;
                }

                // changes video time based on timeline bounds and playblack slider click location
                playbackInput.addEventListener('input', () => {
                    // make sure clicks on the playback slider are within the timeline's start and end times
                    if (playbackInput.value < timelineState.getStartTime() || playbackInput.value >= timelineState.getEndTime()) {
                        timelineInput.value = timelineState.getStartTime();
                        video.currentTime = timelineState.getStartTime();
                    }
                    else {
                        timelineInput.value = playbackInput.value;
                        video.currentTime = playbackInput.value;
                    }

                    timeSpan.textContent = getTimeText(playbackInput.value);
                });

                // revert the hover hightlight
                playbackInput.addEventListener('mouseleave', () => {
                    playbackInput.style.backgroundImage = 'none';
                });

                // create a hover highlight based on pointer location
                playbackInput.addEventListener('mousemove', (pointer) => {
                    const percentage = getPercentage(pointer, playbackInputBox) * 100;
                    
                    playbackInput.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${percentage}%, transparent ${percentage}%)`;
                });
            }

            // draws the interval ticks on the timeline
            function drawTicks() {
                // get the current timeline state variables
                const startTime = timelineState.getStartTime();
                const endTime = timelineState.getEndTime();
                const interval = timelineState.getInterval();
                const subInterval = timelineState.getSubInterval();
                const subIntervalFactor = interval / subInterval;
                const timelineBox = timeline.getBoundingClientRect();

                // get the expected number of ticks in the timeline
                const numTicks = ((endTime - (endTime % interval)) - (startTime - (startTime % interval))) / interval;

                // get the time of the first tick (e.g. 2:00, 5:00, etc.)
                const firstTick = (startTime - (startTime % interval)) / interval;

                // clear out the existing ticks in the SVG
                while (timeline.firstElementChild)
                {
                    timeline.removeChild(timeline.lastElementChild);
                }

                for (let i = 0; i < numTicks + 1; i++) {
                    // calculate the location of each tick
                    const x = (-(startTime % interval) + (interval * i)) / (endTime - startTime);

                    // not necessary but just removes unseen lines
                    if (x > -1) {
                        // generate the tick line
                        const tickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        tickLine.setAttribute('x1', x * timelineBox.width);
                        tickLine.setAttribute('y1', 10);
                        tickLine.setAttribute('x2', x * timelineBox.width);
                        tickLine.setAttribute('y2', 50);
                        timeline.appendChild(tickLine);

                        // generate the time text
                        const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        tickText.setAttribute('x', x * timelineBox.width + 5);
                        tickText.setAttribute('y', 45);
                        tickText.textContent = `${Math.floor((interval * (i + firstTick)) / 60)}:${Math.floor((interval * (i + firstTick)) % 60) < 10 ? '0' : ''}${Math.floor((interval * (i + firstTick)) % 60)}`;
                        timeline.appendChild(tickText);
                    }

                    for (let j = 0; j < subIntervalFactor; j++)
                    {
                        // calculate the location of each sub tick
                        const x2 = interval / ((endTime - startTime) * subIntervalFactor);

                        // again check negative and if the sub tick will collide with a regular tick
                        if (((x2 * j) + x) > -1 && ((x2 * j) % x) != 0) {
                            // generate the sub tick line
                            const subTickLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                            subTickLine.setAttribute('x1', (x + x2 * j) * timelineBox.width);
                            subTickLine.setAttribute('y1', 15);
                            subTickLine.setAttribute('x2', (x + x2 * j) * timelineBox.width);
                            subTickLine.setAttribute('y2', 30);
                            timeline.appendChild(subTickLine);
                        }
                    }
                }
            }
        });
    }


 




    // play/pause the video
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

    // swaps the SVG of an element
    function swapSVG(elementSVG, name) {
        elementSVG.setAttribute('href', `assets/svg/${name}.svg#${name}`);
    }

    // gets the time text from the number of seconds
    function getTimeText(time) {
        return `${Math.floor(time / 60)}:${Math.floor(time % 60) < 10 ? '0' : ''}${Math.floor(time % 60)}`;
    }

    // gets the click percentage in a bounding box
    function getPercentage(pointer, box) {
        return (pointer.clientX - box.left) / box.width;
    }
}


function webSocketInit() {
    // document.getElementById('#record-trigger').addEventListener('click', () => {
    //     window.webSocketAPI.startRecord();
    // });

    // document.getElementById('stop').addEventListener('click', () => {
    //     window.webSocketAPI.stopRecord();
    // });
}
