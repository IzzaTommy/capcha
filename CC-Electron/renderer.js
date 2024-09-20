import { TimelineState } from './timelineState.js';

// wait for DOM to finish loading
window.addEventListener('DOMContentLoaded', init);

async function init() {
    // values to grow/reduce timeline by
    const GROW_FACTOR = 0.15;
    const REDUCE_FACTOR = 0.1;

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
    let playbackInputBox;
    let playbackInputPct;

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

    const timelineSVG = document.querySelector('#timeline-marker');
    const timelineInput = document.querySelector('#timeline-slider');
    let timelineBox;

    let timelineState;

    let videoMetaDataLoaded = false;

    /* ---------- settings section elements---------- */
    const settingsInputSelect = document.querySelectorAll(':not(#save-location-setting).setting > div > input, .setting > div > select');
    const saveLocationInput = document.querySelector('#save-location-setting > div > input');

    /* ---------- directory section elements---------- */
    const capturesGallery = document.querySelector('#captures-carousel > .gallery');
    const videoPreviewTemplate = document.getElementsByTagName('template')[0];

    // get settings and run pre-initialization
    const [settingsCache] = await Promise.all([
        window.settingsAPI.getAllSettings(),
        preInit()
    ]);

    // apply settings and get videos from the directory
    const [videosData] = await Promise.all([
        window.filesAPI.getAllVideosData(),
        postSettingsFetch()
    ]);

    // load the video galleries
    postVideosDataFetch();

    // handles loading event listeners for the title bar, nav panel, and editor
    function preInit() {
        titleBarInit();
        navPanelInit();
        editorSectionInit();

        // handles title bar button event listeners
        function titleBarInit() {
            // API calls for window manipulation
            minimizeBtn.addEventListener('click', () => window.titleBarAPI.minimize());
            maximizeBtn.addEventListener('click', () => window.titleBarAPI.maximize());
            closeBtn.addEventListener('click', () => window.titleBarAPI.close());
        }
    
        // handles navigation bar button event listeners
        function navPanelInit() {
            // change the SVGs on hover, change active content on click
            directoryBtn.addEventListener('mouseenter', () => swapSVG(directorySVG, 'folder-solid'));
            directoryBtn.addEventListener('mouseleave', () => swapSVG(directorySVG, 'folder'));
            directoryBtn.addEventListener('click', () => {
                settingsSection.classList.remove('active');
                editorSection.classList.remove('active');
                directorySection.classList.add('active');

                video.pause();
            });
        
            // change the SVGs on hover, change active content on click
            settingsBtn.addEventListener('mouseenter', () => swapSVG(settingsSVG, 'settings-solid'));
            settingsBtn.addEventListener('mouseleave', () => swapSVG(settingsSVG, 'settings'));
            settingsBtn.addEventListener('click', () => {
                directorySection.classList.remove('active');
                editorSection.classList.remove('active');
                settingsSection.classList.add('active');

                video.pause();
            });
        
            // // change the SVGs on hover, change active content on click
            // recordBtn.addEventListener('mouseenter', () => swapSVG(recordSVG, 'record-solid'));
            // recordBtn.addEventListener('mouseleave', () => swapSVG(recordSVG, 'record'));
            // recordBtn.addEventListener('click', () => {
            //     directorySection.classList.remove('active');
            //     settingsSection.classList.remove('active');
            //     editorSection.classList.add('active');
            // });
        
            // change the SVG on click, set nav bar to active
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
    
        // handles editor section event listeners
        function editorSectionInit() {
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
                playbackInputBox = playbackInput.getBoundingClientRect();
                playbackInputPct = getPercentage(pointer, playbackInputBox) * 100;
                
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
    
                if (videoMetaDataLoaded) {
                    drawTicks();
                }
            });
    



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
    
            // change the video time based on the click location of the timeline
            timelineSVG.addEventListener('click', (pointer) => {
                timelineBox = timelineSVG.getBoundingClientRect();
    
                const newTime = (timelineState.getDuration() * getPercentage(pointer, timelineBox)) + timelineState.getStartTime();
    
                video.currentTime = newTime;
                playbackInput.value = newTime;
                timelineInput.value = newTime;
    
                timeSpan.textContent = getTimeText(newTime);
            });
    
            // "zoom" in and out of the timeline with the scroll wheel
            timelineSVG.addEventListener('wheel', (pointer) => {
                const timelineBox = timelineSVG.getBoundingClientRect();
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
    



            /* ---------- video event listeners ---------- */
            // play/pause the video, update SVGs
            video.addEventListener('click', () => playPauseVideo());
    
            // change the scrubber, playback slider, and time to match the current time
            video.addEventListener('timeupdate', () => {
                if (videoMetaDataLoaded) {
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
                timelineState = new TimelineState(0, video.duration);
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
    
                videoMetaDataLoaded = true;

                // auto play video
                playPauseVideo();
            });
        }
    }

    // handles loading and saving settings
    function postSettingsFetch() {
        // change the default volume
        video.volume = settingsCache['volume'];
        video.muted = settingsCache['volumeMuted']
        if (!video.muted) {
            volumeInput.stepUp(video.volume * 100);
        }
        
        setVolumeSVG();

        for (const setting of settingsInputSelect) {
            // load each settings initial value from stored settings
            setting.value = settingsCache[setting.name];

            // on change, validate the setting, save it, and set the saved value
            setting.addEventListener('change', async () => {
                settingsCache[setting.name] = await window.settingsAPI.setSetting(setting.name, setting.value);
                setting.value = settingsCache[setting.name];
            });
        }

        // load the initial value from stored settings
        saveLocationInput.value = settingsCache[saveLocationInput.name];

        // on change, select directory from dialog, save it, and set the saved value
        saveLocationInput.addEventListener('click', async () => {
            settingsCache[saveLocationInput.name] = await window.settingsAPI.setSetting(saveLocationInput.name, saveLocationInput.value);
            saveLocationInput.value = settingsCache[saveLocationInput.name];
        });

        // send the video player volume when requested
        window.settingsAPI.onGetVolumeSettings(() => {
            window.settingsAPI.setVolumeSettings({ 'volume': settingsCache['volume'], 'volumeMuted': settingsCache['volumeMuted'] });
        });
    }

    // handles loading of the video galleries
    function postVideosDataFetch() {
        // get the current date
        const currentDate = new Date();

        // clear the captures gallery
        while (capturesGallery.firstElementChild)
        {
            capturesGallery.removeChild(capturesGallery.lastElementChild);
        }
    
        for (const videoData of videosData) {
            // make clone of the video preview template
            const videoPreviewClone = videoPreviewTemplate.content.cloneNode(true);
            let headerText;

            // calculate the age of the file relative to the current time
            const msDiff = currentDate - videoData['created'];
            const minDiff = Math.floor(msDiff / 60000);
            const hourDiff = Math.floor(minDiff / 60);
            const dayDiff = Math.floor(hourDiff / 24);

            if (dayDiff > 0) {
                headerText = `GAME - ${dayDiff} day${dayDiff > 1 ? 's' : ''} ago`;
            }
            else {
                if (hourDiff > 0) {
                    headerText = `GAME - ${hourDiff} hour${hourDiff > 1 ? 's' : ''} ago`;
                }
                else {
                    headerText = `GAME - ${minDiff} minute${minDiff !== 1 ? 's' : ''} ago`;
                }
            }

            // fill in video data to the template
            videoPreviewClone.querySelector('.video-preview').dataset.src = videoData['path'];
            videoPreviewClone.querySelector('img').setAttribute('src', videoData['thumbnailPath']);
            videoPreviewClone.querySelector('h4').textContent = headerText;
            videoPreviewClone.querySelector('p').textContent = videoData['nameExt'];
    
            // on click, open the video in the editor
            videoPreviewClone.querySelector('.video-preview').addEventListener('click', () => {
                video.setAttribute('src', videoData['path']);

                directorySection.classList.remove('active');
                settingsSection.classList.remove('active');
                editorSection.classList.add('active');

                videoMetaDataLoaded = false;
            });

            // add the video preview to the gallery
            capturesGallery.appendChild(videoPreviewClone);
        }
    }

    // gets the click percentage in a bounding box
    function getPercentage(pointer, box) {
        return (pointer.clientX - box.left) / box.width;
    }

    // swaps the SVG of an element
    function swapSVG(elementSVG, name) {
        elementSVG.setAttribute('href', `assets/svg/${name}.svg#${name}`);
    }

    // draws the interval ticks on the timeline
    function drawTicks() {
        // get the current timeline state variables
        const startTime = timelineState.getStartTime();
        const endTime = timelineState.getEndTime();
        const interval = timelineState.getInterval();
        const subInterval = timelineState.getSubInterval();
        const subIntervalFactor = interval / subInterval;
        const timelineBox = timelineSVG.getBoundingClientRect();

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
                tickLine.setAttribute('x1', x * timelineBox.width);
                tickLine.setAttribute('y1', 10);
                tickLine.setAttribute('x2', x * timelineBox.width);
                tickLine.setAttribute('y2', 50);
                timelineSVG.appendChild(tickLine);

                // generate the time text
                const tickText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                tickText.setAttribute('x', x * timelineBox.width + 5);
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
                    subTickLine.setAttribute('x1', (x + x2 * j) * timelineBox.width);
                    subTickLine.setAttribute('y1', 15);
                    subTickLine.setAttribute('x2', (x + x2 * j) * timelineBox.width);
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
}


function webSocketInit() {
    // document.getElementById('#record-trigger').addEventListener('click', () => {
    //     window.webSocketAPI.startRecord();
    // });

    // document.getElementById('stop').addEventListener('click', () => {
    //     window.webSocketAPI.stopRecord();
    // });
}
