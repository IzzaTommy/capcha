/**
 * Module for initializing the editor section for the renderer process
 * 
 * @module rendererEditorSection
 * @requires rendererGeneral
 * @requires rendererSettingsSection
 */
import { ICON, STATE, SECTION, setConfOvrlState, setConfCtrState, setContStatLabelText, setSectState, setIcon, getModBox, getRdblDur, getTruncDec, getPtrEventLoc, getPtrEventPct } from './rendererGeneral.js';
import { SPEAKER_VOLUME_GROW, SPEAKER_VOLUME_REDUCE, MICROPHONE_VOLUME_GROW, MICROPHONE_VOLUME_REDUCE, getStgVolSldrBox, getIsStgVolSldrCtrHover, getIsStgVolSldrDrag, setIsStgVolSldrDrag, pseudoSetStgVol, setStgVol, setStgVolSldr, getStg, setStg } from './rendererSettingsSection.js';

// editor section constants
// playback container grow, reduce, and timeout
const PLAYBACK_CONTAINER_GROW = 5;
const PLAYBACK_CONTAINER_REDUCE = 5;
const PLAYBACK_CONTAINER_TIMEOUT = 3000;

// video volume min, max, grow, reduce, muted
const VIDEO_VOLUME_MIN = 0;
const VIDEO_VOLUME_MAX = 1;
const VIDEO_VOLUME_GROW = 0.05;
const VIDEO_VOLUME_REDUCE = 0.05
const VIDEO_VOLUME_MUTED = 0.1;

// playback rate min, max, grow, reduce, default, segments, mapping, and offset
const PLAYBACK_RATE_MIN = -2;
const PLAYBACK_RATE_MAX = 4;
const PLAYBACK_RATE_GROW = 1;
const PLAYBACK_RATE_REDUCE = 1;
const PLAYBACK_RATE_DEF = 1;
const PLAYBACK_RATE_SEGMENTS = 6;
const PLAYBACK_RATE_MAPPING = {
    '-2': 0.2, 
    '-1': 0.5, 
    '0': 0.7, 
    '1': 1, 
    '2': 2, 
    '3': 3, 
    '4': 4, 
    '0.7': 0,
    '0.5': -1, 
    '0.2': -2 
};
const PLAYBACK_RATE_MAPPING_OFFSET = 2;

// timeline zoom min, grow, reduce, top, bottom, offset
const TIMELINE_ZOOM_MIN = 30;
const TIMELINE_GROW = 0.15;
const TIMELINE_REDUCE = 0.1;
const TIMELINE_OVERLAY_HEIGHT_DEF = 60;
const TIMELINE_OVERLAY_SUB_TICK_LINE_TOP_DEF = 15;
const TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM_DEF = 30;
const TIMELINE_OVERLAY_TICK_LINE_TOP_DEF = 10;
const TIMELINE_OVERLAY_TICK_LINE_BOTTOM_DEF = 50;
const TIMELINE_OVERLAY_TICK_TEXT_TOP_DEF = 45;
const TIMELINE_OVERLAY_TICK_TEXT_OFFSET = 5;

// clip length min
const CLIP_LENGTH_MIN = 5;

// editor section variables
let editProgLabel, 
videoCtr, videoPlr, playPauseStatIcon, 
plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
mediaBar, playPauseBarBtn, playPauseBarIcon, videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrMaxWidth, videoVolOvrl, videoVolThumb, 
curVideoTimeLabel, curVideoDurLabel, plbkRateSldrCtr, plbkRateSldr, plbkRateSldrMaxWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, fscBarBtn, fscBarIcon, 
tmlnSldr, tmlnOvrl, tmlnOvrlUIScale, tmlnThumb, clipLeftThumb, clipRightThumb, 
clipBar, viewBarBtn, createBarBtn, clipTogBtn, clipTogIcon;

// editor section boxes
let seekSldrBox, videoVolSldrBox, plbkRateSldrBox, tmlnSldrBox;

// editor section flags
let isVideoLoaded, isVideoPlrHover, wasPaused, isPlbkCtrHover, isSeekSldrDrag, isVideoVolBarBtnHover, isVideoVolSldrCtrHover, isVideoVolSldrDrag, 
isPlbkRateBarBtnHover, isPlbkRateSldrCtrHover, isPlbkRateSldrDrag, isTmlnSldrDrag, isClipLeftThumbDrag, isClipRightThumbDrag;

// editor section states
let videoFrameLen, animId, plbkCtrTmoId, tmln;

/**
 * Initializes the editor section variables
 */
export function initRendEditSectVars() {
    // editor section program label
    editProgLabel = document.getElementById('program-label-editor');

    // video container, player, play pause status icon
    videoCtr = document.getElementById('ctr-video');
    videoPlr = document.getElementById('player-video');
    playPauseStatIcon = document.getElementById('status-icon-play-pause');

    // playback container, seek slider
    plbkCtr = document.getElementById('ctr-playback');
    seekSldr = document.getElementById('slider-seek');
    seekTrack = document.getElementById('track-seek');
    seekOvrl = document.getElementById('overlay-seek');
    seekThumb = document.getElementById('thumb-seek');

    // media bar, play pause and video volume bar buttons, video volume slider
    mediaBar = document.getElementById('bar-media');
    playPauseBarBtn = document.getElementById('bar-btn-play-pause');
    playPauseBarIcon = playPauseBarBtn.querySelector('#bar-icon-play-pause > use');
    videoVolBarBtn = document.getElementById('bar-btn-video-volume');
    videoVolBarIcon = videoVolBarBtn.querySelector('#bar-icon-video-volume > use');
    videoVolSldrCtr = document.getElementById('slider-ctr-video-volume');
    videoVolSldr = document.getElementById('slider-video-volume');
    videoVolSldrMaxWidth = parseInt(window.getComputedStyle(videoVolSldr).getPropertyValue('max-width'));
    videoVolOvrl = document.getElementById('overlay-video-volume');
    videoVolThumb = document.getElementById('thumb-video-volume');

    // current video labels, playback rate slider, playback rate and fullscreen bar buttons
    curVideoTimeLabel = document.getElementById('time-label-current-video');
    curVideoDurLabel = document.getElementById('duration-label-current-video');
    plbkRateSldrCtr = document.getElementById('slider-ctr-playback-rate');
    plbkRateSldr = document.getElementById('slider-playback-rate');
    plbkRateSldrMaxWidth = parseInt(window.getComputedStyle(plbkRateSldr).getPropertyValue('max-width'));
    plbkRateThumb = document.getElementById('thumb-playback-rate');
    plbkRateBarBtn = document.getElementById('bar-btn-playback-rate');
    plbkRateValueLabel = document.getElementById('value-label-playback-rate');
    fscBarBtn = document.getElementById('bar-btn-fullscreen');
    fscBarIcon = fscBarBtn.querySelector('#bar-icon-fullscreen > use');

    // timeline slider, clip thumbs
    tmlnSldr = document.getElementById('slider-timeline');
    tmlnOvrl = document.getElementById('overlay-timeline');
    tmlnOvrlUIScale = parseInt(window.getComputedStyle(tmlnOvrl).getPropertyValue('height')) / TIMELINE_OVERLAY_HEIGHT_DEF;
    tmlnThumb = document.getElementById('thumb-timeline');
    clipLeftThumb = document.getElementById('left-thumb-clip');
    clipRightThumb = document.getElementById('right-thumb-clip'); 

    // clip bar, view and create bar buttons, clip toggle button
    clipBar = document.getElementById('bar-clip');
    viewBarBtn = document.getElementById('bar-btn-view');
    createBarBtn = document.getElementById('bar-btn-create');
    clipTogBtn = document.getElementById('toggle-btn-clip');
    clipTogIcon = document.querySelector('#toggle-icon-clip > use');

    // slider boxes
    seekSldrBox = getModBox(seekSldr.getBoundingClientRect());
    videoVolSldrBox = getModBox(videoVolSldr.getBoundingClientRect());
    plbkRateSldrBox = getModBox(plbkRateSldr.getBoundingClientRect());
    tmlnSldrBox = getModBox(tmlnSldr.getBoundingClientRect());

    // video and slider flags
    isVideoLoaded = false;
    isVideoPlrHover = false;
    wasPaused = false;
    isPlbkCtrHover = false;
    isSeekSldrDrag = false;
    isVideoVolBarBtnHover = false;
    isVideoVolSldrCtrHover = false;
    isVideoVolSldrDrag = false;
    isPlbkRateBarBtnHover = false;
    isPlbkRateSldrCtrHover = false;
    isPlbkRateSldrDrag = false;
    isTmlnSldrDrag = false;
    isClipLeftThumbDrag = false;
    isClipRightThumbDrag = false;

    // video frame length, animation id, playback container timeout, and timeline
    videoFrameLen = -1;
    animId = -1;
    plbkCtrTmoId = -1;
    tmln = {
        'startTime': -1, 
        'endTime': -1, 
        'dur': -1, 
        'intv': -1, 
        'subIntv': -1, 
        'clipLen': -1, 
        'clipStartTime': -1, 
        'clipEndTime': -1
    };
}

/**
 * Initializes the editor section
 */
export function initRendEditSect() {
    // initialize the video container
    initVideoCtrEL();
    initVideoCtr();

    // initialize the timeline slider event listeners
    initTmlnSldrEL();

    // initialize the clip container event listeners
    initClipCtrEL();
}

/**
 * Initializes the video container event listeners
 */
function initVideoCtrEL() {
    // on keydown, check and execute premapped hotkeys
    document.addEventListener('keydown', (kbd) => {
        // check if a video is loaded
        if (isVideoLoaded) {
            switch (kbd.key) {
                // spacebar - toggle the video player state
                case ' ':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // toggle the video player state
                    setVideoPlrState(STATE.TOGGLE);

                    break;
                
                // left arrow - decrease the video volume, playback rate, or current time
                case 'ArrowLeft':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // check if the video volume bar button or slider container is hovered
                    if (isVideoVolBarBtnHover || isVideoVolSldrCtrHover) {
                        // set the video volume
                        pseudoSetVideoVol(videoPlr.volume - VIDEO_VOLUME_REDUCE);
                        setVideoVol();

                        // set the video volume bar button and slider
                        setVideoVolBarBtnSldr();
                    }
                    else {
                        // check if the playback rate bar button or slider container is hovered
                        if (isPlbkRateBarBtnHover || isPlbkRateSldrCtrHover) {
                            // set the playback rate
                            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE);
                        }
                        else {
                            // set the video time
                            setVideoTime(videoPlr.currentTime - PLAYBACK_CONTAINER_REDUCE, false, true, true, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                        }
                    }

                    break;

                // right arrow - increase the video volume, playback rate, or current time
                case 'ArrowRight':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // check if the video volume bar button or slider container is hovered
                    if (isVideoVolBarBtnHover || isVideoVolSldrCtrHover) {
                        // set the video volume
                        pseudoSetVideoVol(videoPlr.volume + VIDEO_VOLUME_GROW);
                        setVideoVol();

                        // set the video volume bar button and slider
                        setVideoVolBarBtnSldr();
                    }
                    else {
                        // check if the playback rate bar button or slider container is hovered
                        if (isPlbkRateBarBtnHover || isPlbkRateSldrCtrHover) {
                            // set the playback rate
                            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW);
                        }
                        else {
                            // set the video time
                            setVideoTime(videoPlr.currentTime + PLAYBACK_CONTAINER_GROW, false, true, true, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                        }
                    }
            
                    break;

                // minus - decrease the playback rate
                case '-':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // set the playback rate
                    setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE);

                    break;

                // equals - increase the playback rate
                case '=':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // set the playback rate
                    setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW);

                    break;

                // m - mute the video volume
                case 'm':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // toggle the video volume muted state
                    pseudoSetVideoVolState();
                    setVideoVol();

                    // set the video volume bar button and slider
                    setVideoVolBarBtnSldr();

                    break;

                // escape - unload the video
                case 'Escape':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // set the active content section to the directories section
                    setSectState(SECTION.DIRECTORIES);

                    break;

                // comma - move back 1 frame if paused
                case ',':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // check if the video player is paused
                    if (videoPlr.paused) {
                        // set the video time
                        setVideoTime(videoPlr.currentTime - videoFrameLen, false, true, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                    }

                    break;

                // period - move forward 1 frame if paused
                case '.':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // check if the video player is paused
                    if (videoPlr.paused) {
                        // set the video time
                        setVideoTime(videoPlr.currentTime + videoFrameLen, false, true, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                    }

                    break;

                // h - hide the playback container and play pause status icon (for screenshotting)
                case 'h':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
                    if (!isTmlnSldrDrag && !isSeekSldrDrag && !isVideoVolSldrDrag && !isPlbkRateSldrDrag) {
                        playPauseStatIcon.classList.remove('active');
                        plbkCtr.classList.remove('active');
                    }
            }
        }
        else {
            switch (kbd.key) {
                // left arrow - decrease the speaker or microphone volume
                case 'ArrowLeft':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();

                    // check if the speaker volume slider container is hovered
                    if (getIsStgVolSldrCtrHover(true)) {  // boolean1 isSpk
                        // set the speaker volume
                        pseudoSetStgVol(getStg('speakerVolume') - SPEAKER_VOLUME_REDUCE, true);  // boolean1 isSpk
                        setStgVol(true);  // boolean1 isSpk

                        // set the speaker volume slider
                        setStgVolSldr(true);  // boolean1 isSpk
                    }
                    else {
                        // check if the microphone volume slider container is hovered
                        if (getIsStgVolSldrCtrHover(false)) {  // boolean1 isSpk
                            // set the microphone volume
                            pseudoSetStgVol(getStg('microphoneVolume') - MICROPHONE_VOLUME_REDUCE, false);  // boolean1 isSpk
                            setStgVol(false);  // boolean1 isSpk

                            // set the microphone volume slider
                            setStgVolSldr(false);  // boolean1 isSpk
                        }
                    }

                    break;

                // right arrow - increase the speaker or microphone volume
                case 'ArrowRight':
                    // prevent the default behavior on the hotkey
                    kbd.preventDefault();
                    
                    // check if the speaker volume slider container is hovered
                    if (getIsStgVolSldrCtrHover(true)) {  // boolean1 isSpk
                        // set the speaker volume
                        pseudoSetStgVol(getStg('speakerVolume') + SPEAKER_VOLUME_GROW, true);  // boolean1 isSpk
                        setStgVol(true);  // boolean1 isSpk

                        // set the speaker volume slider
                        setStgVolSldr(true);  // boolean1 isSpk
                    }
                    else {
                        // check if the microphone volume slider container is hovered
                        if (getIsStgVolSldrCtrHover(false)) {  // boolean1 isSpk
                            // set the microphone volume
                            pseudoSetStgVol(getStg('microphoneVolume') + MICROPHONE_VOLUME_GROW, false);  // boolean1 isSpk
                            setStgVol(false);  // boolean1 isSpk

                            // set the microphone volume slider
                            setStgVolSldr(false);  // boolean1 isSpk
                        }
                    }
            
                    break;
            }
        }
    });

    // on fullscreenchange, change the icon and update the seek, video volume, and playback rate sliders
    videoCtr.addEventListener('fullscreenchange', () => {
        // check if the document has an element in fullscreen
        if (document.fullscreenElement !== null) {
            // change the fullscreen bar icon
            setIcon(fscBarIcon, ICON.FULLSCREEN_EXIT);

            // update the seek, video volume, and playback rate sliders
            setSeekSldrBox();
            setVideoVolSldrBox();
            setPlbkRateSldrBox();
        }
        else {
            // change the fullscreen bar icon
            setIcon(fscBarIcon, ICON.FULLSCREEN);

            // update the seek, video volume, and playback rate sliders
            setSeekSldrBox();
            setVideoVolSldrBox();
            setPlbkRateSldrBox();
        }
    });

    // on loadedmetadata, set the editor to default state
    videoPlr.addEventListener('loadedmetadata', () => {
        // reset the timeline state
        setTmlnState(0, videoPlr.duration);

        // update the playback, playback rate, timeline sliders, and timeline overlay
        setSeekSldr();
        setPlbkRateBarBtnSldr();
        setTmlnSldr();
        setTmlnOvrl();

        // reset the current video labels
        curVideoTimeLabel.textContent = '0:00';
        curVideoDurLabel.textContent = `/${getRdblDur(videoPlr.duration)}`;

        // set the video loaded flag
        isVideoLoaded = true;

        // auto play the video and change the icon
        setVideoPlrState(STATE.PLAY);
    });

    // on time update, check the video player time and update the playback sliders
    videoPlr.addEventListener('timeupdate', () => {
        // check if the video is loaded (editor section is active)
        if (isVideoLoaded) {
            // check if none of the playback sliders or clip thumbs are dragging
            if (!isSeekSldrDrag && !isTmlnSldrDrag && !isClipLeftThumbDrag && !isClipRightThumbDrag) {
                // set the video time
                setVideoTime(null, false, true, true, false, false);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
            }
        }
    });

    // on mouseenter, show the playback container and start the timeout for hiding
    videoPlr.addEventListener('mouseenter', () => {
        // show the play pause status icon if it is hidden from pressing 'h'
        if (videoPlr.paused) {
            playPauseStatIcon.classList.add('active');
        }

        // show the playback container
        plbkCtr.classList.add('active');

        // set the video player hover flag
        isVideoPlrHover = true;

        // set the playback container timeout
        setPlbkCtrTmoId();
    });

    // on mousemove, show the playback container and reset the timeout for hiding
    videoPlr.addEventListener('mousemove', () => {
        // show the play pause status icon if it is hidden from pressing 'h'
        if (videoPlr.paused) {
            playPauseStatIcon.classList.add('active');
        }

        // show the playback container
        plbkCtr.classList.add('active');

        // set the playback container timeout
        setPlbkCtrTmoId();
    });

    // on click, toggle the video state
    videoPlr.addEventListener('click', () => setVideoPlrState(STATE.TOGGLE));

    // on play, start animation frames to sync the slider thumbs' movement to each frame of the video
    videoPlr.addEventListener('play', () => animId = requestAnimationFrame(syncSeekTmlnSldrs));

    // on pause, show the playback container and cancel animation frames
    videoPlr.addEventListener('pause', () => {
        // show the playback container
        plbkCtr.classList.add('active');

        // cancel the syncing to prevent unnecessary computations while paused
        cancelAnimationFrame(animId);
    });

    // on mouseleave, conditionally hide the playback ctr and remove the timeout for disappearing
    videoPlr.addEventListener('mouseleave', () => {
        // set the video player hover flag
        isVideoPlrHover = false;

        // remove the old timeout
        clearTimeout(plbkCtrTmoId);

        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !isSeekSldrDrag && !isVideoVolSldrDrag && !isPlbkRateSldrDrag) {
            plbkCtr.classList.remove('active');
        }
    })

    // on mouseenter, show the playback container
    plbkCtr.addEventListener('mouseenter', () => { 
        // show the play pause status icon if it is hidden from pressing 'h'
        if (videoPlr.paused) {
            playPauseStatIcon.classList.add('active');
        }

        // show the playback container
        plbkCtr.classList.add('active');

        // set the playback container hover flag
        isPlbkCtrHover = true;
    });

    // on mousemove, show the playback container
    plbkCtr.addEventListener('mousemove', () => {
        // show the play pause status icon if it is hidden from pressing 'h'
        if (videoPlr.paused) {
            playPauseStatIcon.classList.add('active');
        }

        // show the playback container
        plbkCtr.classList.add('active');
    });

    // on mouseleave, conditionally hide the playback ctr and remove the timeout for hiding
    plbkCtr.addEventListener('mouseleave', () => {
        // set the playback container hover flag
        isPlbkCtrHover = false;

        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !isSeekSldrDrag && !isVideoVolSldrDrag && !isPlbkRateSldrDrag) {
            plbkCtr.classList.remove('active');
        }
    });

    // on mousemove, show a hover highlight based on the pointer location
    seekSldr.addEventListener('mousemove', (ptr) => setSeekTrack(getPtrEventPct(ptr, seekSldrBox) * 100));

    // on mousedown, set the current time based on the pointer location
    seekSldr.addEventListener('mousedown', (ptr) => {
        // set the seek slider dragging flag
        isSeekSldrDrag = true; 

        // set the video time
        setVideoTime(videoPlr.duration * getPtrEventPct(ptr, seekSldrBox), true, false, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
    });

    // on mouseleave, hide the hover hightlight
    seekSldr.addEventListener('mouseleave', () => setSeekTrack(0));

    // on mouseleave, hide the video volume and playback rate sliders if they are not dragging
    mediaBar.addEventListener('mouseleave', () => {
        // check if the video volume slider is not dragging
        if (!isVideoVolSldrDrag) {
            // hide the video volume slider
            videoVolSldr.classList.remove('active');
        }

        // check if the playback rate slider is not dragging
        if (!isPlbkRateSldrDrag) {
            // hide the playback rate slider
            plbkRateSldr.classList.remove('active');
        }
    });

    // on click, toggle the video state and change the icon
    playPauseBarBtn.addEventListener('click', () => setVideoPlrState(STATE.TOGGLE));

    // on mouseenter, show the video volume slider and update it if needed
    videoVolBarBtn.addEventListener('mouseenter', () => {
        // show the video volume slider
        videoVolSldr.classList.add('active');

        // set the video volume bar button hover flag
        isVideoVolBarBtnHover = true
    });

    // on click, mute/unmute the video volume and change the icon
    videoVolBarBtn.addEventListener('click', async () => {
        // toggles the video volume muted state
        pseudoSetVideoVolState();
        setVideoVol();

        // set the video volume bar button and slider
        setVideoVolBarBtnSldr();
    });

    // on wheel, increase or decrease the video volume
    videoVolBarBtn.addEventListener('wheel', async (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the video volume
        if (ptr.deltaY < 0) {
            // set the video volume
            pseudoSetVideoVol(videoPlr.volume + VIDEO_VOLUME_GROW);
            setVideoVol();

            // set the video volume bar button and slider
            setVideoVolBarBtnSldr();
        }
        // else, decrease the video volume
        else {
            // set the video volume
            pseudoSetVideoVol(videoPlr.volume - VIDEO_VOLUME_REDUCE);
            setVideoVol();

            // set the video volume bar button and slider
            setVideoVolBarBtnSldr();
        }
    });

    // on mouseleave, disable the hover flag
    videoVolBarBtn.addEventListener('mouseleave', () => isVideoVolBarBtnHover = false);

    // on mouseenter, enable the hover flag
    videoVolSldrCtr.addEventListener('mouseenter', () => isVideoVolSldrCtrHover = true);

    // on wheel, increase or decrease the video volume
    videoVolSldrCtr.addEventListener('wheel', (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the video volume
        if (ptr.deltaY < 0) {
            // set the video volume
            pseudoSetVideoVol(videoPlr.volume + VIDEO_VOLUME_GROW);
            setVideoVol();

            // set the video volume bar button and slider
            setVideoVolBarBtnSldr();
        }
        // else, decrease the video volume
        else {
            // set the video volume
            pseudoSetVideoVol(videoPlr.volume - VIDEO_VOLUME_REDUCE);
            setVideoVol();

            // set the video volume bar button and slider
            setVideoVolBarBtnSldr();
        }
    });

    // on mouseleave, disable the hover flag
    videoVolSldrCtr.addEventListener('mouseleave', () => isVideoVolSldrCtrHover = false);

    // on mousedown, enable the dragging flag and set the video volume based on the pointer location
    videoVolSldr.addEventListener('mousedown', (ptr) => {
        // set the video volume
        pseudoSetVideoVol(getPtrEventPct(ptr, videoVolSldrBox));

        // set the video volume bar button and slider
        setVideoVolBarBtnSldr();

        // set the video volume slider dragging flag
        isVideoVolSldrDrag = true;
    });

    // on mouseenter, enable the hover flag
    plbkRateSldrCtr.addEventListener('mouseenter', () => isPlbkRateSldrCtrHover = true);

    // on wheel, increase or decrease the playback rate
    plbkRateSldrCtr.addEventListener('wheel', (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the playback rate
        if (ptr.deltaY < 0) {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW);
        }
        // else, decrease the playback rate
        else {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE);
        }
    });

    // on mouseleave, disable the hover flag
    plbkRateSldrCtr.addEventListener('mouseleave', () => isPlbkRateSldrCtrHover = false);

    // on mousedown, enable the dragging flag and set the playback rate based on the pointer location
    plbkRateSldr.addEventListener('mousedown', (ptr) => { 
        // set the playback rate
        setPlbkRate(Math.round(getPtrEventLoc(ptr, plbkRateSldrBox) / (plbkRateSldrBox.width / PLAYBACK_RATE_SEGMENTS) - PLAYBACK_RATE_MAPPING_OFFSET));

        // set the playback rate bar button and slider dragging flag
        isPlbkRateSldrDrag = true;
    });

    // on mouseenter, show the playback rate slider
    plbkRateBarBtn.addEventListener('mouseenter', () => {
        // show the playback rate slider
        plbkRateSldr.classList.add('active');

        // set the playback rate bar button hover flag
        isPlbkRateBarBtnHover = true
    });

    // on click, revert to the default playback speed
    plbkRateBarBtn.addEventListener('click', () => {
        // set the default playback rate
        videoPlr.playbackRate = PLAYBACK_RATE_DEF;

        // set the playback rate bar button and slider
        setPlbkRateBarBtnSldr();
    });

    // on wheel, increase or decrease the playback rate
    plbkRateBarBtn.addEventListener('wheel', (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the playback rate
        if (ptr.deltaY < 0) {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW);
        }
        // else, decrease the playback rate
        else {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE);
        }
    });

    // on mouseleave, disable the hover flag
    plbkRateBarBtn.addEventListener('mouseleave', () => isPlbkRateBarBtnHover = false);

    // on click, toggle the video player fullscreen
    fscBarBtn.addEventListener('click', () => document.fullscreenElement !== null ? document.exitFullscreen() : videoCtr.requestFullscreen());
}

/**
 * Initializes the video ctr
 */
function initVideoCtr() {
    // set the initial video volume and muted state
    videoPlr.volume = getStg('videoVolume');
    videoPlr.muted = getStg('videoVolumeMuted');

    // set the video volume bar button and slider
    setVideoVolBarBtnSldr();

    // standby will pause the video but hide the play pause icon overlay
    setVideoPlrState(STATE.STANDBY);
}

/**
 * Initializes the timeline slider event listeners
 */
function initTmlnSldrEL() {
    // on mousemove, match seek and timeline slider positions and set video time
    document.addEventListener('mousemove', (ptr) => {
        // check if the seek slider is dragging
        if (isSeekSldrDrag) {
            // set the video time
            setVideoTime(Math.max(0, Math.min(getPtrEventPct(ptr, seekSldrBox), 1)) * videoPlr.duration, false, false, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
        }
        else {
            // check if the video volume slider is dragging
            if (isVideoVolSldrDrag) {
                // set the video volume
                pseudoSetVideoVol(getPtrEventPct(ptr, videoVolSldrBox));

                // set the video volume bar button and slider
                setVideoVolBarBtnSldr();
            }
            else {
                // check if the playback rate slider is dragging
                if (isPlbkRateSldrDrag) {
                    // set the playback rate
                    setPlbkRate(Math.round(getPtrEventLoc(ptr, plbkRateSldrBox) / (plbkRateSldrBox.width / PLAYBACK_RATE_SEGMENTS) - PLAYBACK_RATE_MAPPING_OFFSET));
                }
                else {
                    // check if the timeline slider is dragging
                    if (isTmlnSldrDrag) {
                        // set the video time
                        setVideoTime(Math.max(0, Math.min(getPtrEventPct(ptr, tmlnSldrBox), 1)) * tmln['dur'] + tmln['startTime'], false, false, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                    }
                    else {
                        // check if the left clip thumb is dragging
                        if (isClipLeftThumbDrag) {
                            // get the new clip start time
                            const newClipStartTime = Math.max(0, Math.min(getPtrEventPct(ptr, tmlnSldrBox), 1)) * tmln['dur'] + tmln['startTime'];

                            // update the clip start time to be at the minimum time length before the clip end time
                            tmln['clipStartTime'] = getTruncDec(newClipStartTime < tmln['clipEndTime'] - CLIP_LENGTH_MIN ? newClipStartTime : Math.max(tmln['startTime'], tmln['clipEndTime'] - CLIP_LENGTH_MIN));

                            // set the left clip thumb
                            setClipLeftThumb((tmln['clipStartTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);

                            // set the video time
                            setVideoTime(null, false, true, true, false, false);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                        }
                        else {
                            // check if the right clip thumb is dragging
                            if (isClipRightThumbDrag) {
                                // get the new clip end time
                                const newClipEndTime = Math.max(0, Math.min(getPtrEventPct(ptr, tmlnSldrBox), 1)) * tmln['dur'] + tmln['startTime'];

                                // update the clip end time to be at the minimum time length after the clip start time
                                tmln['clipEndTime'] = getTruncDec(newClipEndTime > tmln['clipStartTime'] + CLIP_LENGTH_MIN ? newClipEndTime : Math.min(tmln['endTime'], tmln['clipStartTime'] + CLIP_LENGTH_MIN));

                                // set the right clip thumb
                                setClipRightThumb((tmln['clipEndTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);

                                // set the video time
                                setVideoTime(null, false, true, true, false, false);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
                            }
                            else {
                                // check if the speaker volume slider is dragging
                                if (getIsStgVolSldrDrag(true)) {
                                    // set the speaker volume
                                    pseudoSetStgVol(getPtrEventPct(ptr, getStgVolSldrBox(true)), true);  // boolean1 isSpk, boolean2 isSpk

                                    // set the speaker volume slider
                                    setStgVolSldr(true);  // boolean1 isSpk
                                }
                                else {
                                    // check if the microphone volume slider is dragging
                                    if (getIsStgVolSldrDrag(false)) {
                                        // set the microphone volume
                                        pseudoSetStgVol(getPtrEventPct(ptr, getStgVolSldrBox(false)), false);  // boolean1 isSpk, boolean2 isSpk

                                        // set the microphone volume slider
                                        setStgVolSldr(false);  // boolean1 isSpk
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // on mouseup, validate the slider input and change the video time
    document.addEventListener('mouseup', async () => { 
        // check if the timeline or seek slider is dragging
        if (isTmlnSldrDrag === true || isSeekSldrDrag === true) {
            // set the timeline and seek slider dragging flags
            isTmlnSldrDrag = isSeekSldrDrag = false;

            // check if the video player and playback containers are not hovered
            if (!isVideoPlrHover && !isPlbkCtrHover) {
                // hide the playback container
                plbkCtr.classList.remove('active');
            }
            else {
                // check if the video player is hovered
                if (isVideoPlrHover) {
                    // set the playback container timeout
                    setPlbkCtrTmoId();
                }
            }

            // set the video time
            setVideoTime(null, false, true, true, true, false);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
        }
        else {
            // check if the video volume slider is dragging
            if (isVideoVolSldrDrag) {
                // set the video volume slider dragging flag
                isVideoVolSldrDrag = false;

                // set the video volume
                setVideoVol();

                // check if the video player and playback containers are not hovered
                if (!isVideoPlrHover && !isPlbkCtrHover) {
                    // hide the playback container
                    plbkCtr.classList.remove('active');
                }
                else {
                    // check if the video player is hovered
                    if (isVideoPlrHover) {
                        // set the playback container timeout
                        setPlbkCtrTmoId();
                    }
                }

                // hide the volume slider if the button, slider, and playback container are not hovered
                if (!isVideoVolBarBtnHover && !isVideoVolSldrCtrHover && !isPlbkCtrHover) {
                    videoVolSldr.classList.remove('active');
                }

                // hide the playback rate slider if the button, slider, and playback container are not hovered
                if (!isPlbkRateBarBtnHover && !isPlbkRateSldrCtrHover && !isPlbkCtrHover) {
                    plbkRateSldr.classList.remove('active');
                }
            }
            else {
                // check if the playback rate slider is dragging
                if (isPlbkRateSldrDrag) {
                    // set the playback rate slider dragging flag
                    isPlbkRateSldrDrag = false;

                    // check if the video player and playback containers are not hovered
                    if (!isVideoPlrHover && !isPlbkCtrHover) {
                        // hide the playback container
                        plbkCtr.classList.remove('active');
                    }
                    else {
                        // check if the video player is hovered
                        if (isVideoPlrHover) {
                            // set the playback container timeout
                            setPlbkCtrTmoId();
                        }
                    }
    
                    // check if the video volume bar button, slider container, and playback container are not hovered
                    if (!isVideoVolBarBtnHover && !isVideoVolSldrCtrHover && !isPlbkCtrHover) {
                        // hide the video volume slider
                        videoVolSldr.classList.remove('active');
                    }
    
                    // check if the video volume bar button, slider container, and playback container are not hovered
                    if (!isPlbkRateBarBtnHover && !isPlbkRateSldrCtrHover && !isPlbkCtrHover) {
                        // hide the playback rate slider
                        plbkRateSldr.classList.remove('active');
                    }
                }
                else {
                    // check if the clip left thumb is dragging
                    if (isClipLeftThumbDrag) {
                        // set the clip left thumb dragging flag
                        isClipLeftThumbDrag = false;
                    } 
                    else {
                        // check if the clip right thumb is dragging
                        if (isClipRightThumbDrag) {
                            // set the clip right thumb dragging flag
                            isClipRightThumbDrag = false;
                        }
                        else {
                            // check if the speaker volume slider is dragging
                            if (getIsStgVolSldrDrag(true)) {
                                // set the speaker volume slider dragging flag
                                setIsStgVolSldrDrag(false, true);  // boolean1 value, boolean1 isSpk

                                // set the speaker volume
                                setStgVol(true);  // boolean1 isSpk
                            }
                            else {
                                // check if the microphone volume slider is dragging
                                if (getIsStgVolSldrDrag(false)) {
                                    // set the microphone volume slider dragging flag
                                    setIsStgVolSldrDrag(false, false);  // boolean1 value, boolean1 isSpk

                                    // set the microphone volume
                                    setStgVol(false);  // boolean1 isSpk
                                } 
                            }
                        }
                    }
                }
            }
        }
    });

    // on wheel, zoom in/out of the timeline
    tmlnSldr.addEventListener('wheel', (ptr) => {
        // prevent the scrolling of the container
        ptr.preventDefault();

        // check if the scroll is within the timeline slider
        if (ptr.clientX >= tmlnSldrBox['left'] && ptr.clientX <= tmlnSldrBox['right']) {
            // get the event location percentage on the timeline slider
            const pct = getPtrEventPct(ptr, tmlnSldrBox);
            
            // check if the pointer scrolled up (zoom in)
            if (ptr.deltaY < 0) {
                // check if the timeline is not at minimum zoom
                if (tmln['dur'] > TIMELINE_ZOOM_MIN) {
                    // calculate the new start/end times and duration
                    const newStartTime = tmln['startTime'] + (TIMELINE_REDUCE * tmln['dur'] * pct);
                    const newEndTime = tmln['endTime'] - (TIMELINE_REDUCE * tmln['dur'] * (1 - pct));
                    const newDur = newEndTime - newStartTime;
                    
                    // check if the new duration is less than the minimum zoom, set the timeline bounds to the minimum
                    setTmlnState(
                        getTruncDec((newDur < TIMELINE_ZOOM_MIN) ? newStartTime - (TIMELINE_ZOOM_MIN - newDur) * pct : newStartTime),
                        getTruncDec((newDur < TIMELINE_ZOOM_MIN) ? newStartTime - (TIMELINE_ZOOM_MIN - newDur) * pct + TIMELINE_ZOOM_MIN : newEndTime)
                    );

                    // check if clipping is active
                    if (clipBar.classList.contains('active')) {
                        // check if the clip start time is within the timeline start time
                        if (tmln['clipStartTime'] < tmln['startTime']) {
                            // update the clip start time to the timeline start time
                            tmln['clipStartTime'] = tmln['startTime'];

                            // make sure the clip end time is at the minimum time length after the clip start time
                            if (tmln['clipEndTime'] < tmln['clipStartTime'] + CLIP_LENGTH_MIN) {
                                tmln['clipEndTime'] = tmln['clipStartTime'] + CLIP_LENGTH_MIN;
                            }
                        }

                        // check if the clip end time is within the timeline end time
                        if (tmln['clipEndTime'] >= tmln['endTime']) {
                            // update the clip end time to the timeline end time
                            tmln['clipEndTime'] = tmln['endTime'];

                            // make sure the clip start time is at the minimum time length before the clip end time
                            if (tmln['clipStartTime'] > tmln['clipEndTime'] - CLIP_LENGTH_MIN) {
                                tmln['clipStartTime'] = tmln['clipEndTime'] - CLIP_LENGTH_MIN;
                            }
                        }
                    }

                    // set the clip thumbs
                    setClipLeftThumb((tmln['clipStartTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);
                    setClipRightThumb((tmln['clipEndTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);

                    // set the video time
                    setVideoTime(null, false, true, true, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd

                    // set the timeline overlay
                    setTmlnOvrl();
                }
            } 
            else {
                // check if the timeline is not at maximum zoom
                if (tmln['dur'] < videoPlr.duration) {
                    // calculate the new start and end times
                    const newStartTime = tmln['startTime'] - (TIMELINE_GROW * tmln['dur'] * pct);
                    const newEndTime = tmln['endTime'] + (TIMELINE_GROW * tmln['dur'] * (1 - pct));
                    
                    // check if zoom out would bring the timeline out of bounds
                    if (newStartTime < 0) {
                        // reallocate grow factor to the end time if needed
                        setTmlnState(
                            0, 
                            getTruncDec(Math.min(videoPlr.duration, Math.abs(newStartTime) + newEndTime))
                        );
                    }
                    else {
                        // reallocate grow factor to the start time if needed
                        setTmlnState(
                            getTruncDec(newEndTime > videoPlr.duration ? Math.max(0, newStartTime - (newEndTime - videoPlr.duration)) : newStartTime),
                            getTruncDec(Math.min(videoPlr.duration, newEndTime))
                        );
                    }

                    // check if clipping is active
                    if (clipBar.classList.contains('active')) {
                        // check if the clip start time is within the timeline start time
                        if (tmln['clipStartTime'] < tmln['startTime']) {
                            // update the clip start time to the timeline start time
                            tmln['clipStartTime'] = tmln['startTime'];

                            // make sure the clip end time is at the minimum time length after the clip start time
                            if (tmln['clipEndTime'] < tmln['clipStartTime'] + CLIP_LENGTH_MIN) {
                                tmln['clipEndTime'] = tmln['clipStartTime'] + CLIP_LENGTH_MIN;
                            }
                        }

                        // check if the clip end time is within the timeline end time
                        if (tmln['clipEndTime'] >= tmln['endTime']) {
                            // update the clip end time to the timeline end time
                            tmln['clipEndTime'] = tmln['endTime'];

                            // make sure the clip start time is at the minimum time length before the clip end time
                            if (tmln['clipStartTime'] > tmln['clipEndTime'] - CLIP_LENGTH_MIN) {
                                tmln['clipStartTime'] = tmln['clipEndTime'] - CLIP_LENGTH_MIN;
                            }
                        }
                    }

                    // set the clip thumbs
                    setClipLeftThumb((tmln['clipStartTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);
                    setClipRightThumb((tmln['clipEndTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);

                    // set the video time
                    setVideoTime(null, false, true, true, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd

                    // set the timeline overlay
                    setTmlnOvrl();
                }
            }
        }
    });

    // on mousedown, set the timeline slider dragging / previously paused flags, and the current time
    tmlnSldr.addEventListener('mousedown', (ptr) => {
        // set the timeline slider dragging flag
        isTmlnSldrDrag = true; 

        // set the video time
        setVideoTime(tmln['dur'] * getPtrEventPct(ptr, tmlnSldrBox) + tmln['startTime'], true, false, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd
    });

    // on mousedown, set the clip left thumb dragging and previously paused flags
    clipLeftThumb.addEventListener('mousedown', (event) => {
        // prevent mousedown event on timeline slider from firing
        event.stopPropagation();

        // set the clip left thumb dragging flag
        isClipLeftThumbDrag = true; 
    });

    // on mousedown, set the clip left thumb dragging and previously paused flags
    clipRightThumb.addEventListener('mousedown', (event) => {
        // prevent mousedown event on timeline sliderfrom firing
        event.stopPropagation();

        // set the clip right thumb dragging flag
        isClipRightThumbDrag = true; 
    });
}

/**
 * Initializes the clip container event listeners
 */
function initClipCtrEL() {
    // on click, view the clip
    viewBarBtn.addEventListener('click', () => { 
        // set the video time
        setVideoTime(tmln['clipStartTime'], false, false, false, false, true);  // boolean1 doPauseBeforeSet, boolean2 doBoundsCheck, boolean3 doPauseInCheck, boolean4 doVideoStateCheck, boolean5 doSetSldrsAtEnd

        // set the video player state to play
        setVideoPlrState(STATE.PLAY);
    });

    // on click, create the clip
    createBarBtn.addEventListener('click', async () => {
        // try to create the clip
        try {
            // set the confirmation container state to creating
            setConfCtrState(STATE.CREATING);

            // set the confirmation overlay state to active
            setConfOvrlState(STATE.ACTIVE);

            await window['editSectAPI'].reqCreateClip(videoPlr.getAttribute('src'), tmln['clipStartTime'], tmln['clipEndTime']);
        }
        catch (_) {
            // notify the user that the clip could not be created
            setContStatLabelText('Failed to create the clip!');

            // set the confirmation overlay state to inactive
            setConfOvrlState(STATE.INACTIVE);
        }
    });

    // on click, change the clip toggle button state
    clipTogBtn.addEventListener('click', () => setClipBarState(STATE.TOGGLE));
}

/**
 * Sets the editor program label text
 * 
 * @param {string} text - The new text of the editor program label
 */
export function setEditProgLabelText(text) {
    editProgLabel.textContent = text;
}

/**
 * Gets the video loaded flag
 * 
 * @returns {boolean} The video loaded flag
 */
export function getIsVideoLoaded() {
    return isVideoLoaded;
}

/**
 * Sets the video loaded flag
 * 
 * @param {boolean} value - The new value of the video loaded flag
 */
export function setIsVideoLoaded(value) {
    isVideoLoaded = value;
}

/**
 * Sets the video frame length
 * 
 * @param {number} frameLen - The new frame length of the video
 */
export function setVideoFrameLen(frameLen) {
    videoFrameLen = frameLen;
}

/**
 * Sets the video player source
 * 
 * @param {string} src - The new source of the video
 */
export function setVideoPlrSrc(src) {
    videoPlr.setAttribute('src', src);
}

/**
 * Sets the video player state
 * 
 * @param {number} state - The new state of the video player
 */
export function setVideoPlrState(state) {
    switch (state) {
        case STATE.PLAY:
            // change the icon to pause, hide the play pause status icon, and play the video
            setIcon(playPauseBarIcon, ICON.PAUSE);
            playPauseStatIcon.classList.remove('active');
            videoPlr.play();

            break;

        case STATE.PAUSE:
            // change the icon to play, show the play pause status icon, and pause the video
            setIcon(playPauseBarIcon, ICON.PLAY);
            playPauseStatIcon.classList.add('active');
            videoPlr.pause();

            break;

        case STATE.TOGGLE:
            // if the video is paused or ended
            if (videoPlr.paused || videoPlr.ended) {
                // change the icon to pause, hide the play pause status icon, and play the video
                setIcon(playPauseBarIcon, ICON.PAUSE);
                playPauseStatIcon.classList.remove('active');
                videoPlr.play();
            }
            else {
                // change the icon to play, show the play pause status icon, and pause the video
                setIcon(playPauseBarIcon, ICON.PLAY);
                playPauseStatIcon.classList.add('active');
                videoPlr.pause();
            }

            break;
        case STATE.STANDBY:
            // change the icon to pause, hide the play pause status icon, and pause the video
            // this is meant to prevent the play pause status icon from showing for a moment when a new video starts
            setIcon(playPauseBarIcon, ICON.PAUSE);
            playPauseStatIcon.classList.remove('active');
            videoPlr.pause();

            break;
    }
}

/**
 * Sets the video time, with necessary checks and slider updates
 * 
 * @param {number} time - The new video time
 * @param {boolean} doPauseBeforeSet - If the video state should be captured before updating the video time
 * @param {boolean} doBoundsCheck - If the video time should be checked to be within the clip or timeline bounds
 * @param {boolean} doPauseInCheck - If the video should be paused if the time is out of the clip or timeline bounds
 * @param {boolean} doVideoStateCheck - If the old saved video state should be restored when a bounds check fails
 * @param {boolean} doSetSldrsAtEnd - If the sliders should be set within the bounds check or outside (to reduce redundant slider sets)
 */
function setVideoTime(time, doPauseBeforeSet, doBoundsCheck, doPauseInCheck, doVideoStateCheck, doSetSldrsAtEnd) { 
    // check if the video should be paused before setting the time
    if (doPauseBeforeSet) {
        // set the paused state and pause the video
        wasPaused = videoPlr.paused;
        setVideoPlrState(STATE.PAUSE);
    }

    // check if the time is not null
    if (time != null) {
        // set the current video time
        videoPlr.currentTime = time;
    }

    // check if the timeline and clips bounds need to be checked
    if (doBoundsCheck) {
        // check if clipping is active
        if (clipBar.classList.contains('active')) {
            // check if the current video time is outside of the clip bounds
            if (videoPlr.currentTime < tmln['clipStartTime'] || videoPlr.currentTime >= tmln['clipEndTime']) {
                // set the current video time to the clip start time
                videoPlr.currentTime = tmln['clipStartTime'];
    
                // check if the video should be paused if the current video time falls out of bounds
                if (doPauseInCheck) {
                    // set the video player state to pause
                    setVideoPlrState(STATE.PAUSE);
                }

                // check if the sliders should be set if the current video time falls out of bounds
                if (!doSetSldrsAtEnd) {
                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                }
            }
            else {
                // check if the video state should be checked if the current video time does not fall out of bounds
                if (doVideoStateCheck) {
                    // check if the video was not previously paused
                    if (!wasPaused) {
                        // set the video player state to play
                        setVideoPlrState(STATE.PLAY);
                    }
                }
            }
        }
        else {
            // check if the current video time is outside of the timeline bounds
            if (videoPlr.currentTime < tmln['startTime'] || videoPlr.currentTime >= tmln['endTime']) {
                videoPlr.currentTime = tmln['startTime'];
        
                // check if the video should be paused if the current video time falls out of bounds
                if (doPauseInCheck) {
                    // set the video player state to pause
                    setVideoPlrState(STATE.PAUSE);
                }

                // check if the sliders should be set if the current video time falls out of bounds
                if (!doSetSldrsAtEnd) {
                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                }
            }
            else {
                // check if the video state should be checked if the current video time does not fall out of bounds
                if (doVideoStateCheck) {
                    // check if the video was not previously paused
                    if (!wasPaused) {
                        // set the video player state to play
                        setVideoPlrState(STATE.PLAY);
                    }
                }
            }
        }
    }

    // set the playback sliders (this boolean exists because timeupdate does not require the playback sliders to be set
    // except when the time is out of bounds, so it reduces repeated work)
    if (doSetSldrsAtEnd) {
        setSeekSldr();
        setTmlnSldr();
    }

    // set the current video time label
    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
}

/**
 * Sets the playback container timeout
 */
function setPlbkCtrTmoId() {
    // remove the old playback container timeout
    clearTimeout(plbkCtrTmoId);

    // set a new playback container timeout
    plbkCtrTmoId = setTimeout(() => {
        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !isSeekSldrDrag && !isVideoVolSldrDrag && !isPlbkRateSldrDrag) {
            plbkCtr.classList.remove('active');
        }
    }, PLAYBACK_CONTAINER_TIMEOUT);
}

/**
 * Sets the seek slider thumb and overlay
 */
function setSeekSldr() {
    setSeekThumb(videoPlr.currentTime / videoPlr.duration * seekSldrBox['width']);
    setSeekOvrl(videoPlr.currentTime / videoPlr.duration * 100);
}

/**
 * Sets the seek slider track
 * 
 * @param {number} thumbLoc - The location of the seek thumb
 */
function setSeekTrack(thumbLoc) {
    seekTrack.style.background = `linear-gradient(to right, var(--strack-lgradientcolor) ${thumbLoc}%, var(--strack-bgcolor) ${thumbLoc}%`;
}

/**
 * Sets the seek slider overlay
 * 
 * @param {number} thumbLoc - The location of the seek thumb
 */
function setSeekOvrl(thumbLoc) {
    seekOvrl.style.background = `linear-gradient(to right, var(--soverlay-lgradientcolor) ${thumbLoc}%, transparent ${thumbLoc}%`;
}

/**
 * Sets the seek slider thumb
 * 
 * @param {number} thumbLoc - The location of the seek thumb
 */
function setSeekThumb(thumbLoc) {
    seekThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the seek slider
 */
export function setSeekSldrBox() {
    // get the new modifiable seek slider bounding box
    seekSldrBox = getModBox(seekSldr.getBoundingClientRect());

    // set the seek slider thumb and overlay
    setSeekSldr();
}

/**
 * Sets the video volume in the settings cache ONLY
 * 
 * @param {number} value - The new value of the video volume
 */
function pseudoSetVideoVol(value) {
    // set the video volume and muted state in the settings cache
    setStg('videoVolume', Math.max(VIDEO_VOLUME_MIN, Math.min(value, VIDEO_VOLUME_MAX)));
    setStg('videoVolumeMuted', videoPlr.volume === VIDEO_VOLUME_MIN);

    // set the video volume and muted state
    videoPlr.volume = getStg('videoVolume');
    videoPlr.muted = getStg('videoVolumeMuted');
}

/**
 * Toggles the video volume muted state and saves the state in the settings cache ONLY
 */
function pseudoSetVideoVolState() {
    // set the vol to 0.1 in case the video gets unmuted
    if (videoPlr.volume === VIDEO_VOLUME_MIN)
        setStg('videoVolume') = VIDEO_VOLUME_MUTED;
        videoPlr.volume = getStg('videoVolume');

    // toggle the muted state
    setStg('videoVolumeMuted', !videoPlr.muted);
    videoPlr.muted = getStg('videoVolumeMuted');
}

/**
 * Sets the video volume in the main process settings
 */
async function setVideoVol() {
    // try to update the video volume setting
    try {
        await Promise.all([window['stgsAPI'].setStg('videoVolume', getStg('videoVolume')), window.stgsAPI.setStg('videoVolumeMuted', getStg('videoVolumeMuted'))]);
    }
    catch (_) {
        // notify the user that the video volume setting could not be updated
        // unrevertable since the old value was deleted...
        setContStatLabelText('Failed to update the video volume setting!');
    }
}

/**
 * Sets the video volume bar button and slider
 */
function setVideoVolBarBtnSldr() { 
    // check if the video is muted
    if (videoPlr.muted) {
        // set the volume bar icon to muted
        setIcon(videoVolBarIcon, ICON.VOLUME_MUTE);

        // set the video volume thumb and overlay
        setVideoVolThumb(0);
        setVideoVolOvrl(0);
    }
    else {
        // check if the video volume is greater than 0.6
        if (videoPlr.volume > 0.6)
            // set the volume bar icon
            setIcon(videoVolBarIcon, ICON.VOLUME_60_PCT);
        else {
            // check if the video volume is greater than 0.1
            if (videoPlr.volume > 0.1)
                // set the volume bar icon
                setIcon(videoVolBarIcon, ICON.VOLUME_10_PCT);
            else
                // set the volume bar icon
                setIcon(videoVolBarIcon, ICON.VOLUME_0_PCT);
        }

        // set the volume thumb and overlay
        setVideoVolThumb(videoPlr.volume * videoVolSldrMaxWidth);
        setVideoVolOvrl(videoPlr.volume * 100);
    }
}

/**
 * Sets the video volume slider overlay
 * 
 * @param {number} thumbLoc - The location of the vol thumb
 */
function setVideoVolOvrl(thumbLoc) {
    videoVolOvrl.style.background = `linear-gradient(to right, var(--vvooverlay-lgradientcolor) ${thumbLoc}%, transparent ${thumbLoc}%`;
}

/**
 * Sets the video volume slider thumb
 * 
 * @param {number} thumbLoc - The location of the vol thumb
 */
function setVideoVolThumb(thumbLoc) {
    videoVolThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the video volume slider
 */
export function setVideoVolSldrBox() {
    // get the new modifiable volume slider bounding box
    videoVolSldrBox = getModBox(videoVolSldr.getBoundingClientRect());
    videoVolSldrBox['right'] = videoVolSldrBox['left'] + videoVolSldrMaxWidth;
    videoVolSldrBox['width'] = videoVolSldrMaxWidth;
}

/**
 * Sets the playback rate
 * 
 * @param {number} value - The playback rate of the video
 */
function setPlbkRate(value) {
    // set the playback rate
    videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(value, PLAYBACK_RATE_MAX))];

    // set the playback rate bar button and slider
    setPlbkRateBarBtnSldr();
}

/**
 * Sets the playback rate slider text and thumb
 */
function setPlbkRateBarBtnSldr() {
    // set the playback rate value label and playback rate thumb
    plbkRateValueLabel.textContent = videoPlr.playbackRate;
    setPlbkRateThumb(plbkRateSldrMaxWidth / 6 * (PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + 2));
}

/**
 * Sets the playback rate slider thumb
 * 
 * @param {number} thumbLoc - The location of the playback rate thumb
 */
function setPlbkRateThumb(thumbLoc) {
    plbkRateThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the playback rate slider
 */
export function setPlbkRateSldrBox() {
    // get the new modifiable playback rate slider bounding box
    plbkRateSldrBox = getModBox(plbkRateSldr.getBoundingClientRect());
    plbkRateSldrBox['left'] = plbkRateSldrBox['right'] - plbkRateSldrMaxWidth;
    plbkRateSldrBox['width'] = plbkRateSldrMaxWidth;
}

/**
 * Sets the timeline slider thumb
 */
function setTmlnSldr() {
    setTmlnThumb(Math.max(0, Math.min((videoPlr.currentTime - tmln['startTime']) / tmln['dur'], 1) * tmlnSldrBox['width']));
}

/**
 * Sets the timeline slider overlay
 */
function setTmlnOvrl() {
    // get the tick line template and the tick text template
    const tickLineTmpl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const tickTextTmpl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    // get the location of the first tick and the number of ticks based on the duration
    const firstTick = Math.ceil(tmln['startTime'] / tmln['subIntv']) * tmln['subIntv'];
    const numTicks = ((Math.floor(tmln['endTime'] / tmln['subIntv']) * tmln['subIntv']) - firstTick) / tmln['subIntv'] + 1;

    // set the default tick line height
    tickLineTmpl.setAttribute('y1', TIMELINE_OVERLAY_SUB_TICK_LINE_TOP_DEF * tmlnOvrlUIScale);
    tickLineTmpl.setAttribute('y2', TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM_DEF * tmlnOvrlUIScale);

    // set the default tick text vertical location
    tickTextTmpl.setAttribute('y', TIMELINE_OVERLAY_TICK_TEXT_TOP_DEF * tmlnOvrlUIScale);
    tickTextTmpl.classList.add('timeline-text');

    // remove all timeline overlay ticks
    while (tmlnOvrl.firstElementChild) {
        tmlnOvrl.removeChild(tmlnOvrl.lastElementChild);
    }

    // iterate through each tick
    for (let i = 0; i < numTicks; i++) {
        // get the location of the tick in seconds
        const tickLoc = firstTick + (i * tmln['subIntv']);
        // get the percentage location of the tick within the timeline overlay
        const tickPct = (tickLoc - tmln['startTime']) / tmln['dur'];
        // get the tick line clone
        const tickLineClone = tickLineTmpl.cloneNode(true);

        // set the tick line horizontal location
        tickLineClone.setAttribute('x1', tickPct * tmlnSldrBox.width);
        tickLineClone.setAttribute('x2', tickPct * tmlnSldrBox.width);

        // check if the tick is a non-subinterval (larger) tick
        if (tickLoc % tmln['intv'] === 0) {
            // get the tick text clone
            const tickTextClone = tickTextTmpl.cloneNode(true);

            // set the tick line height to be larger
            tickLineClone.setAttribute('y1', TIMELINE_OVERLAY_TICK_LINE_TOP_DEF * tmlnOvrlUIScale);
            tickLineClone.setAttribute('y2', TIMELINE_OVERLAY_TICK_LINE_BOTTOM_DEF * tmlnOvrlUIScale);

            // set the tick text horizontal location
            tickTextClone.setAttribute('x', tickPct * tmlnSldrBox.width + TIMELINE_OVERLAY_TICK_TEXT_OFFSET);

            // set the tick text time label
            tickTextClone.textContent = getRdblDur(tickLoc);

            // append the tick text
            tmlnOvrl.appendChild(tickTextClone);
        }

        // append the tick line
        tmlnOvrl.appendChild(tickLineClone);      
    }
}

/**
 * Sets the timeline slider thumb
 * 
 * @param {number} thumbLoc - The location of the timeline thumb
 */
function setTmlnThumb(thumbLoc) {
    tmlnThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Sets the left clip thumb
 * 
 * @param {number} thumbLoc - The location of the left clip thumb
 */
function setClipLeftThumb(thumbLoc) {
    clipLeftThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Sets the right clip thumb
 * 
 * @param {number} thumbLoc - The location of the right clip thumb
 */
function setClipRightThumb(thumbLoc) {
    clipRightThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the timeline slider
 */
export function setTmlnSldrBox() {
    // get the new modifiable timeline slider bounding box
    tmlnSldrBox = getModBox(tmlnSldr.getBoundingClientRect());
    
    // check if a video is loaded
    if (isVideoLoaded) {
        // set the timeline slider thumb and overlay
        setTmlnSldr();
        setTmlnOvrl();
    }
}

/**
 * Sets the timeline state, including the start time, end time, duration, tick interval, tick subinterval, and clip length
 * 
 * @param {number} startTime - The new start time of the timeline
 * @param {number} endTime - The new end time of the timeline
 */
function setTmlnState(startTime, endTime) {
    // set the start time, end time, and duration
    tmln['startTime'] = startTime;
    tmln['endTime'] = endTime;
    tmln['dur'] = endTime - startTime;

    // check if the duration is greater than 7200 seconds, and set the predefined tick interval, tick subinterval, and clip length
    if (tmln['dur'] > 7200) {
        [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [3600, 900, 300];
    }
    else {
        // check if the duration is greater than 2400 seconds, and set the predefined tick interval, tick subinterval, and clip length
        if (tmln['dur'] > 2400) {
            [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [600, 150, 120];
        } 
        else {
            // check if the duration is greater than 960 seconds, and set the predefined tick interval, tick subinterval, and clip length
            if (tmln['dur'] > 960) {
                [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [300, 60, 60];
            } 
            else {
                // check if the duration is greater than 480 seconds, and set the predefined tick interval, tick subinterval, and clip length
                if (tmln['dur'] > 480) {
                    [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [120, 30, 50];
                } 
                else {
                    // check if the duration is greater than 240 seconds, and set the predefined tick interval, tick subinterval, and clip length
                    if (tmln['dur'] > 240) {
                        [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [60, 15, 30];
                    }
                    else {
                        // check if the duration is greater than 80 seconds, and set the predefined tick interval, tick subinterval, and clip length
                        if (tmln['dur'] > 80) {
                            [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [30, 10, 30];
                        }
                        else {
                            // check if the duration is greater than 40 seconds, and set the predefined tick interval, tick subinterval, and clip length
                            if (tmln['dur'] > 40) {
                                [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [10, 5, 20];
                            }
                            else {
                                [tmln['intv'], tmln['subIntv'], tmln['clipLen']] = [5, 1, 5];
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Syncs the seek and timeline thumbs to the video frame
 */
function syncSeekTmlnSldrs() {
    // set the playback sliders
    setSeekSldr();
    setTmlnSldr();

    // check if the video is not paused and not ended
    if (!videoPlr.paused && !videoPlr.ended) {
        // request the next animation frame
        animId = requestAnimationFrame(syncSeekTmlnSldrs);
    }
}

/**
 * Sets the state of the clip bar and components
 * 
 * @param {number} state - The new state of the clip bar and components
 */
export function setClipBarState(state) {
    switch (state) {
        // toggles the clip bar, thumbs, and icon
        case STATE.TOGGLE:
            // toggle the clip bar
            clipBar.classList.toggle('active');

            // if the clip bar is active
            if (clipBar.classList.contains('active')) {
                // set the clip toggle icon
                setIcon(clipTogIcon, ICON.COLLAPSE);

                // check if the clip length is less than the timeline duration
                if (tmln['clipLen'] < tmln['dur']) {
                    // get the new clip start and end times centered around the current video time
                    const newClipStartTime = videoPlr.currentTime - tmln['clipLen'] / 2;
                    const newClipEndTime = videoPlr.currentTime + tmln['clipLen'] / 2;
        
                    // set the clip start and end times to be within the timeline start and end times
                    tmln['clipStartTime'] = getTruncDec(newClipStartTime < tmln['startTime'] ? tmln['startTime'] : (newClipEndTime > tmln['endTime'] ? tmln['endTime'] - tmln['clipLen'] : newClipStartTime));
                    tmln['clipEndTime'] = getTruncDec(newClipStartTime < tmln['startTime'] ? tmln['startTime'] + tmln['clipLen'] : (newClipEndTime > tmln['endTime'] ? tmln['endTime'] : newClipEndTime));
                }
                else {
                    // set the clip start and end times to the timeline bounds
                    tmln['clipStartTime'] = tmln['startTime'];
                    tmln['clipEndTime'] = tmln['endTime'];
                }
        
                // set the clip thumbs
                setClipLeftThumb((tmln['clipStartTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);
                setClipRightThumb((tmln['clipEndTime'] - tmln['startTime']) / tmln['dur'] * tmlnSldrBox.width);
            }
            else {
                // set the clip toggle icon
                setIcon(clipTogIcon, ICON.EXPAND);
            }

            // toggle the clip thumbs
            clipLeftThumb.classList.toggle('active');
            clipRightThumb.classList.toggle('active');

            break;

        // sets the clip bar, thumbs, and icon inactive
        case STATE.INACTIVE:
            // set the clip bar inactive
            clipBar.classList.remove('active');
            
            // set the clip toggle icon
            setIcon(clipTogIcon, ICON.EXPAND);

            // set the clip thumbs inactive
            clipLeftThumb.classList.remove('active');
            clipRightThumb.classList.remove('active');

            break;
    }
}