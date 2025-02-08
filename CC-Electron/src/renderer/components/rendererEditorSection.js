/**
 * Module for initializing the editor section for the renderer process
 * 
 * @module rendererEditorSection
 * @requires rendererVariables
 * @requires rendererGeneral
 * @requires rendererDirectoriesSection
 * @requires rendererSettingsSection
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, SPEAKER_VOLUME_GROW_VALUE, SPEAKER_VOLUME_REDUCE_VALUE, 
    MICROPHONE_VOLUME_GROW_VALUE, MICROPHONE_VOLUME_REDUCE_VALUE, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, 
    PLAYBACK_CONTAINER_GROW_VALUE, PLAYBACK_CONTAINER_REDUCE_VALUE, PLAYBACK_CONTAINER_TIMEOUT, 
    VIDEO_VOLUME_MIN, VIDEO_VOLUME_MAX, VIDEO_VOLUME_GROW_VALUE, VIDEO_VOLUME_REDUCE_VALUE, VIDEO_VOLUME_MUTED, 
    PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_DEF, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_ZOOM_MIN, TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, CLIP_LENGTH_MIN, 
    MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, stgsBarBtn, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwTemplate, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    editGameLabel, videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrWidth, videoVolOvrl, videoVolThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
    mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
    mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolStgSldrCtr, spkVolStgSldr, spkVolStgOvrl, spkVolStgThumb, micStgFld, micVolStgSldrCtr, micVolStgSldr, micVolStgOvrl, micVolStgThumb, 
    boxes, data, flags, states, 
    initRendVars 
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, getModBox, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
import { initRendDirsSect, loadGall, updateGall } from './rendererDirectoriesSection.js';
import { initRendStgsSect, pseudoSetVol, setVol, setVolStgSldr, setVolStgOvrl, setVolStgThumb, updateVolStgSldr } from './rendererSettingsSection.js';

/**
 * @exports initRendEditSect, setVideoPlayerState, setSeekSldr, setSeekTrack, setSeekOvrl, setSeekThumb, updateSeekSldr, setVideoVol, setVideoVolBtnSldr, setVideoVolOvrl, setVideoVolThumb, updateVideoVolSldr, setPlbkRateBtnSldr, setPlbkRateThumb, updatePlbkRateSldr, setTmlnSldr, setTmlnOvrl, setTmlnThumb, updateTmlnSldr, setClipLeftThumb, setClipRightThumb, syncSeekTmlnSldrs
 */
export { initRendEditSect, setVideoPlayerState, setSeekSldr, setSeekTrack, setSeekOvrl, setSeekThumb, updateSeekSldr, setVideoVol, setVideoVolBtnSldr, setVideoVolOvrl, setVideoVolThumb, updateVideoVolSldr, setPlbkRateBtnSldr, setPlbkRateThumb, updatePlbkRateSldr, setTmlnSldr, setTmlnOvrl, setTmlnThumb, updateTmlnSldr, setClipLeftThumb, setClipRightThumb, syncSeekTmlnSldrs }

/**
 * Initializes the editor section
 */
function initRendEditSect() {
    initVideoCtrEL();
    initVideoCtr();

    initTmlnSldrEL();

    initClipCtrEL();
}

/**
 * Initializes the video container event listeners
 */
function initVideoCtrEL() {
    // on keydown, check and execute premapped hotkeys
    document.addEventListener('keydown', (event) => {
        // check if a video is loaded
        if (flags['isVideoLoaded']) {
            switch (event.key) {
                // spacebar - toggle the video player state
                case ' ':
                    setVideoPlayerState('toggle');

                    break;
                
                // left arrow - decrease the volume, playback rate, or current time
                case 'ArrowLeft':
                    if (flags['isVideoVolBarBtnHover'] || flags['isVideoVolSldrCtrHover']) {
                        // set the volume
                        pseudoSetVideoVol(videoPlr.volume - VIDEO_VOLUME_REDUCE_VALUE);
                        setVideoVol();

                        // set the volume slider
                        setVideoVolBtnSldr();
                    }
                    else {
                        if (flags['isPlbkRateBarBtnHover'] || flags['isPlbkRateSldrCtrHover']) {
                            // set the playback rate
                            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE);
                
                            // set the playback rate slider
                            setPlbkRateBtnSldr();
                        }
                        else {
                            videoPlr.currentTime -= PLAYBACK_CONTAINER_REDUCE_VALUE;

                            // check if clipping is active
                            if (clipBar.classList.contains('active')) {
                                // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                                if (videoPlr.currentTime < states['tmln'].getClipStartTime() || videoPlr.currentTime >= states['tmln'].getClipEndTime()) {
                                    videoPlr.currentTime = states['tmln'].getClipStartTime();
                        
                                    // pause the video and change the icon
                                    setVideoPlayerState('pause');
                        
                                    // set the playback sliders
                                    setSeekSldr();
                                    setTmlnSldr();
                                }
                        
                                // set the video current time label
                                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                            }
                            else {
                                // check if the video is out of the tmln bounds, set it back the start
                                if (videoPlr.currentTime < states['tmln'].getStartTime() || videoPlr.currentTime >= states['tmln'].getEndTime()) {
                                    videoPlr.currentTime = states['tmln'].getStartTime();

                                    // pause the video and change the icon
                                    setVideoPlayerState('pause');

                                    // set the playback sliders
                                    setSeekSldr();
                                    setTmlnSldr();
                                }

                                // set the video current time label
                                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                            }

                            // set the playback sliders
                            setSeekSldr();
                            setTmlnSldr();
                        }
                    }

                    break;

                // right arrow - increase the volume, playback rate, or current time
                case 'ArrowRight':
                    if (flags['isVideoVolBarBtnHover'] || flags['isVideoVolSldrCtrHover']) {
                        // set the volume
                        pseudoSetVideoVol(videoPlr.volume + VIDEO_VOLUME_GROW_VALUE);
                        setVideoVol();

                        // set the volume slider
                        setVideoVolBtnSldr();
                    }
                    else {
                        if (flags['isPlbkRateBarBtnHover'] || flags['isPlbkRateSldrCtrHover']) {
                            // set the playback rate
                            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE);
   
                            // set the playback rate slider
                            setPlbkRateBtnSldr();
                        }
                        else {
                            videoPlr.currentTime += PLAYBACK_CONTAINER_GROW_VALUE;

                            // check if clipping is active
                            if (clipBar.classList.contains('active')) {
                                // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                                if (videoPlr.currentTime < states['tmln'].getClipStartTime() || videoPlr.currentTime >= states['tmln'].getClipEndTime()) {
                                    videoPlr.currentTime = states['tmln'].getClipStartTime();
                        
                                    // pause the video and change the icon
                                    setVideoPlayerState('pause');
                        
                                    // set the playback sliders
                                    setSeekSldr();
                                    setTmlnSldr();
                                }
                        
                                // set the video current time label
                                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                            }
                            else {
                                // check if the video is out of the tmln bounds, set it back the start
                                if (videoPlr.currentTime < states['tmln'].getStartTime() || videoPlr.currentTime >= states['tmln'].getEndTime()) {
                                    videoPlr.currentTime = states['tmln'].getStartTime();

                                    // pause the video and change the icon
                                    setVideoPlayerState('pause');

                                    // set the playback sliders
                                    setSeekSldr();
                                    setTmlnSldr();
                                }

                                // set the video current time label
                                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                            }

                            // set the playback sliders
                            setSeekSldr();
                            setTmlnSldr();
                        }
                    }
            
                    break;

                // minus - decrease the playback rate
                case '-':
                    // set the playback rate
                    setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE);

                    // set the playback rate slider
                    setPlbkRateBtnSldr();

                    break;

                // equals - increase the playback rate
                case '=':
                    // set the playback rate
                    setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE);
                            
                    // set the playback rate slider
                    setPlbkRateBtnSldr();

                    break;

                // m - mute the volume
                case 'm':
                    // toggle the volume muted state
                    pseudoTogVideoVolMute();
                    setVideoVol();

                    // set the volume slider
                    setVideoVolBtnSldr();

                    break;

                // escape - unload the video
                case 'Escape':
                    // set the active content section to the directories section
                    setActiveSect('directories');

                    break;
            }
        }
        else {
            switch (event.key) {
                // left arrow - decrease the speaker or microphone volume
                case 'ArrowLeft':
                    if (flags['isSpkVolStgSldrCtrHover']) {
                        // set the speaker volume
                        pseudoSetVol(data['stgs']['speakerVolume'] - SPEAKER_VOLUME_REDUCE_VALUE, true);  // boolean1 isSpk
                        setVol(true);  // boolean1 isSpk

                        // set the speaker volume slider
                        setVolStgSldr(true);  // boolean1 isSpk
                    }
                    else {
                        if (flags['isMicVolStgSldrCtrHover']) {
                            // set the microphone volume
                            pseudoSetVol(data['stgs']['microphoneVolume'] - MICROPHONE_VOLUME_REDUCE_VALUE, false);  // boolean1 isSpk
                            setVol(false);  // boolean1 isSpk

                            // set the microphone volume slider
                            setVolStgSldr(false);  // boolean1 isSpk
                        }
                    }

                    break;

                // right arrow - increase the speaker or microphone volume
                case 'ArrowRight':
                    if (flags['isSpkVolStgSldrCtrHover']) {
                        // set the speaker volume
                        pseudoSetVol(data['stgs']['speakerVolume'] + SPEAKER_VOLUME_GROW_VALUE, true);  // boolean1 isSpk
                        setVol(true);  // boolean1 isSpk

                        // set the speaker volume slider
                        setVolStgSldr(true);  // boolean1 isSpk
                    }
                    else {
                        if (flags['isMicVolStgSldrCtrHover']) {
                            // set the microphone volume
                            pseudoSetVol(data['stgs']['microphoneVolume'] + MICROPHONE_VOLUME_GROW_VALUE, false);  // boolean1 isSpk
                            setVol(false);  // boolean1 isSpk

                            // set the microphone volume slider
                            setVolStgSldr(false);  // boolean1 isSpk
                        }
                    }
            
                    break;
            }
        }
    });

    // on fullscreen change, change the icon and resize the seek, volume, and playback rate sliders
    videoCtr.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            setIcon(fscBarIcon, 'fullscreen-exit');

            updateSeekSldr();
            updateVideoVolSldr();
            updatePlbkRateSldr();
        }
        else {
            setIcon(fscBarIcon, 'fullscreen');

            updateSeekSldr();
            updateVideoVolSldr();
            updatePlbkRateSldr();
        }
    });

    // on load of meta data, set the editor to default state
    videoPlr.addEventListener('loadedmetadata', () => {
        // reset the timeline state
        states['tmln'].updateTime(0, videoPlr.duration);

        // update the playback and playback rate sliders
        setSeekSldr();
        setPlbkRateBtnSldr();
        setTmlnSldr();
        setTmlnOvrl();

        // set the video current time label to 0
        curVideoTimeLabel.textContent = '0:00';
        curVideoDurLabel.textContent = `/${getRdblDur(videoPlr.duration)}`;

        // set the video loaded flag
        flags['isVideoLoaded'] = true;

        // auto play the video and change the icon
        setVideoPlayerState('play');
    });

    // on time update, check the video player time and update the playback sliders
    videoPlr.addEventListener('timeupdate', () => {
        // check if the video is loaded (editor section is active)
        if (flags['isVideoLoaded']) {
            // not necessary?
            if (!flags['isTmlnSldrDrag'] && !flags['isSeekSldrDrag'] && !flags['isClipLeftThumbDrag'] && !flags['isClipRightThumbDrag']) {
                // check if clipping is active
                if (clipBar.classList.contains('active')) {
                    // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                    if (videoPlr.currentTime < states['tmln'].getClipStartTime() || videoPlr.currentTime >= states['tmln'].getClipEndTime()) {
                        videoPlr.currentTime = states['tmln'].getClipStartTime();
            
                        // pause the video and change the icon
                        setVideoPlayerState('pause');
            
                        // set the seek sldr and tmln sldr
                        setSeekSldr();
                        setTmlnSldr();
                    }
                }
                else {
                    // reset the video, change the icon, and pause the video, depending on if the video is outside of the tmln bounds
                    if (videoPlr.currentTime < states['tmln'].getStartTime() || videoPlr.currentTime >= states['tmln'].getEndTime()) {
                        videoPlr.currentTime = states['tmln'].getStartTime();
            
                        // pause the video and change the icon
                        setVideoPlayerState('pause');
            
                        // set the seek sldr and tmln sldr
                        setSeekSldr();
                        setTmlnSldr();
                    }
                }

                // set the video current time label
                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
            }
        }
    });

    // on mouseenter, show the playback container and start the timeout for hiding
    videoPlr.addEventListener('mouseenter', () => {
        // show the playback container
        plbkCtr.classList.add('active');

        flags['isVideoPlrHover'] = true;

        // restart the timeout for hiding the playback container
        states['plbkCtrTmo'] = setTimeout(() => {
            // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
            if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
                plbkCtr.classList.remove('active');
        }, PLAYBACK_CONTAINER_TIMEOUT);
    });

    // on mousemove, show the playback container and reset the timeout for hiding
    videoPlr.addEventListener('mousemove', () => {
        // show the playback container
        plbkCtr.classList.add('active');

        // remove the old timeout
        clearTimeout(states['plbkCtrTmo']);
        
        // reset the timeout for hiding
        states['plbkCtrTmo'] = setTimeout(() => {
            // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
            if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
                plbkCtr.classList.remove('active');
        }, PLAYBACK_CONTAINER_TIMEOUT);
    });

    // on click, toggle the video state
    videoPlr.addEventListener('click', () => setVideoPlayerState('toggle'));

    // on play, start animation frames to sync the slider thumbs' movement to each frame of the video
    videoPlr.addEventListener('play', () => states['animID'] = requestAnimationFrame(syncSeekTmlnSldrs));

    // on pause, show the playback container and cancel animation frames
    videoPlr.addEventListener('pause', () => {
        // show the playback container
        plbkCtr.classList.add('active');

        // cancel the syncing to prevent unnecessary computations while paused
        cancelAnimationFrame(states['animID']);
    });

    // on mouseleave, conditionally hide the playback ctr and remove the timeout for disappearing
    videoPlr.addEventListener('mouseleave', () => {
        flags['isVideoPlrHover'] = false;

        // remove the old timeout
        clearTimeout(states['plbkCtrTmo']);

        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
            plbkCtr.classList.remove('active');
    })

    // on mouseenter, show the playback container
    plbkCtr.addEventListener('mouseenter', () => {   
        // show the playback container
        plbkCtr.classList.add('active');

        flags['isPlbkCtrHover'] = true;
    });

    // on mouseleave, conditionally hide the playback ctr and remove the timeout for disappearing
    plbkCtr.addEventListener('mouseleave', () => {
        flags['isPlbkCtrHover'] = false;

        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
            plbkCtr.classList.remove('active');
    });

    // on mousemove, show a hover highlight based on the pointer location
    seekSldr.addEventListener('mousemove', (ptr) => {
        setSeekTrack(getPtrEventPct(ptr, boxes['seekSldrBox']) * 100);
    });

    // on mousedown, set the current time based on the pointer location
    seekSldr.addEventListener('mousedown', (ptr) => { 
        // set current time based on click location
        videoPlr.currentTime = videoPlr.duration * getPtrEventPct(ptr, boxes['seekSldrBox']);

        // set the playback sliders
        setSeekSldr();
        setTmlnSldr();

        flags['isSeekSldrDrag'] = true; 
        flags['isPrevPaused'] = videoPlr.paused;
    });

    // on mouseleave, hide the hover hightlight
    seekSldr.addEventListener('mouseleave', () => {
        setSeekTrack(0);
    });

    // on mouseleave, hide the volume and playback rate sliders if they are not dragging
    mediaBar.addEventListener('mouseleave', () => {
        if (!flags['isVideoVolSldrDrag'])
            videoVolSldr.classList.remove('active');

        if (!flags['isPlbkRateSldrDrag'])
            plbkRateSldr.classList.remove('active');
    });

    // on click, toggle the video state and change the icon
    playPauseBarBtn.addEventListener('click', () => setVideoPlayerState('toggle'));

    // on mouseenter, show the volume slider and update it if needed
    videoVolBarBtn.addEventListener('mouseenter', () => {
        // show the volume slider
        videoVolSldr.classList.add('active');

        flags['isVideoVolBarBtnHover'] = true
    });

    // on click, mute/unmute the volume and change the icon
    videoVolBarBtn.addEventListener('click', async () => {
        // toggles the volume muted state
        pseudoTogVideoVolMute();
        setVideoVol();

        // set the volume slider
        setVideoVolBtnSldr();
    });

    // on wheel, increase or decrease the volume
    videoVolBarBtn.addEventListener('wheel', async (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the volume
        if (ptr.deltaY < 0) {
            // set the volume
            pseudoSetVideoVol(videoPlr.volume + VIDEO_VOLUME_GROW_VALUE);
            setVideoVol();

            // set the volume slider
            setVideoVolBtnSldr();
        }
        // else, decrease the volume
        else {
            // set the volume
            pseudoSetVideoVol(videoPlr.volume - VIDEO_VOLUME_REDUCE_VALUE);
            setVideoVol();

            // set the volume slider
            setVideoVolBtnSldr();
        }
    });

    // on mouseleave, disable the hover flag
    videoVolBarBtn.addEventListener('mouseleave', () => flags['isVideoVolBarBtnHover'] = false);

    // on mouseenter, enable the hover flag
    videoVolSldrCtr.addEventListener('mouseenter', () => flags['isVideoVolSldrCtrHover'] = true);

    // on wheel, increase or decrease the volume
    videoVolSldrCtr.addEventListener('wheel', (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the volume
        if (ptr.deltaY < 0) {
            // set the volume
            pseudoSetVideoVol(videoPlr.volume + VIDEO_VOLUME_GROW_VALUE);
            setVideoVol();

            // set the volume slider
            setVideoVolBtnSldr();
        }
        // else, decrease the volume
        else {
            // set the volume
            pseudoSetVideoVol(videoPlr.volume - VIDEO_VOLUME_REDUCE_VALUE);
            setVideoVol();

            // set the volume slider
            setVideoVolBtnSldr();
        }
    });

    // on mouseleave, disable the hover flag
    videoVolSldrCtr.addEventListener('mouseleave', () => flags['isVideoVolSldrCtrHover'] = false);

    // on mousedown, enable the dragging flag and set the volume based on the pointer location
    videoVolSldr.addEventListener('mousedown', (ptr) => {
        // set the volume
        pseudoSetVideoVol(getPtrEventPct(ptr, boxes['videoVolSldrBox']));

        // set the volume slider
        setVideoVolBtnSldr();

        flags['isVideoVolSldrDrag'] = true;
    });

    // on mouseenter, enable the hover flag
    plbkRateSldrCtr.addEventListener('mouseenter', () => flags['isPlbkRateSldrCtrHover'] = true);

    // on wheel, increase or decrease the playback rate
    plbkRateSldrCtr.addEventListener('wheel', (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the playback rate
        if (ptr.deltaY < 0) {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE);
            
            // set the playback rate slider
            setPlbkRateBtnSldr();
        }
        // else, decrease the playback rate
        else {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE);
            
            // set the playback rate slider
            setPlbkRateBtnSldr();
        }
    });

    // on mouseleave, disable the hover flag
    plbkRateSldrCtr.addEventListener('mouseleave', () => flags['isPlbkRateSldrCtrHover'] = false);

    // on mousedown, enable the dragging flag and set the playback rate based on the pointer location
    plbkRateSldr.addEventListener('mousedown', (ptr) => { 
        // set the playback rate
        setPlbkRate(Math.round(getPtrEventLoc(ptr, boxes['plbkRateSldrBox']) / (boxes['plbkRateSldrBox'].width / PLAYBACK_RATE_SEGMENTS) - PLAYBACK_RATE_MAPPING_OFFSET));

        // set the playback rate slider
        setPlbkRateBtnSldr();

        flags['isPlbkRateSldrDrag'] = true;
    });

    // on mouseenter, show the playback rate slider
    plbkRateBarBtn.addEventListener('mouseenter', () => {
        // show the playback rate slider
        plbkRateSldr.classList.add('active');

        flags['isPlbkRateBarBtnHover'] = true
    });

    // on click, revert to the default playback speed
    plbkRateBarBtn.addEventListener('click', () => {
        // set the default playback rate
        videoPlr.playbackRate = PLAYBACK_RATE_DEF;

        // set the playback rate slider
        setPlbkRateBtnSldr();
    });

    // on wheel, increase or decrease the playback rate
    plbkRateBarBtn.addEventListener('wheel', (ptr) => {
        // prevent the default scrolling on the container
        ptr.preventDefault();

        // if scrolling 'up', increase the playback rate
        if (ptr.deltaY < 0) {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE);
            
            // set the playback rate slider
            setPlbkRateBtnSldr();
        }
        // else, decrease the playback rate
        else {
            // set the playback rate
            setPlbkRate(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE);
            
            // set the playback rate slider
            setPlbkRateBtnSldr();
        }
    });

    // on mouseleave, disable the hover flag
    plbkRateBarBtn.addEventListener('mouseleave', () => flags['isPlbkRateBarBtnHover'] = false);

    // on click, toggle the video player fullscreen
    fscBarBtn.addEventListener('click', () => document.fullscreenElement !== null ? document.exitFullscreen() : videoCtr.requestFullscreen());
}

/**
 * Initializes the video ctr
 */
function initVideoCtr() {
    // set the initial volume and muted state
    videoPlr.volume = data['stgs']['videoVolume'];
    videoPlr.muted = data['stgs']['videoVolumeMuted'];

    // set the volume slider
    setVideoVolBtnSldr();

    // standby will pause the video but hide the play pause icon overlay
    setVideoPlayerState('standby');
}

/**
 * Initializes the timeline slider event listeners
 */
function initTmlnSldrEL() {
    // on mousemove, match seek slider and timeline slider position and set video time
    document.addEventListener('mousemove', (ptr) => {
        // check if the seek slider is dragging
        if (flags['isSeekSldrDrag']) {
            // pause the video and change the icon
            setVideoPlayerState('pause');

            // get the time based on pointer location on the seek slider
            videoPlr.currentTime = Math.max(0, Math.min(getPtrEventPct(ptr, boxes['seekSldrBox']), 1)) * videoPlr.duration;

            // set the playback sliders
            setSeekSldr();
            setTmlnSldr(); 

            // set the video current time label
            curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
        }
        else {
            // check if the volume slider is dragging
            if (flags['isVideoVolSldrDrag']) {
                // set the volume
                pseudoSetVideoVol(getPtrEventPct(ptr, boxes['videoVolSldrBox']));

                // set the vol slider
                setVideoVolBtnSldr();
            }
            else {
                // check if the playback rate slider is dragging
                if (flags['isPlbkRateSldrDrag']) {
                    // set the playback rate
                    setPlbkRate(Math.round(getPtrEventLoc(ptr, boxes['plbkRateSldrBox']) / (boxes['plbkRateSldrBox'].width / 6) - 2));

                    // set the playback rate slider
                    setPlbkRateBtnSldr();
                }
                else {
                    // check if the timeline slider is dragging
                    if (flags['isTmlnSldrDrag']) {
                        // pause the video and change the icon
                        setVideoPlayerState('pause');

                        // get the time based on pointer location on the timeline slider
                        videoPlr.currentTime = Math.max(0, Math.min(getPtrEventPct(ptr, boxes['tmlnSldrBox']), 1)) * states['tmln'].getDuration() + states['tmln'].getStartTime();

                        // set the playback sliders
                        setSeekSldr();
                        setTmlnSldr();

                        // set the video current time label
                        curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                    }
                    else {
                        // check if the left clip thumb is dragging
                        if (flags['isClipLeftThumbDrag']) {
                            // get the new clip start time
                            const newClipStartTime = Math.max(0, Math.min(getPtrEventPct(ptr, boxes['tmlnSldrBox']), 1)) * states['tmln'].getDuration() + states['tmln'].getStartTime();

                            // update the clip start time to be at minimum 5s before the clip end time
                            states['tmln'].updateClipStartTime(getTruncDec(newClipStartTime < states['tmln'].getClipEndTime() - 5 ? newClipStartTime : Math.max(states['tmln'].getStartTime(), states['tmln'].getClipEndTime() - 5), 6));

                            // set the left clip thumb
                            setClipLeftThumb((states['tmln'].getClipStartTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                            // update the current time to be within the clip bounds
                            if (videoPlr.currentTime < states['tmln'].getClipStartTime()) {
                                videoPlr.currentTime = states['tmln'].getClipStartTime();

                                // set the playback sliders
                                setSeekSldr();
                                setTmlnSldr();

                                // set the video current time label
                                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                            }
                        }
                        else {
                            if (flags['isClipRightThumbDrag']) {
                                // get the new clip end time
                                let newClipEndTime = Math.max(0, Math.min(getPtrEventPct(ptr, boxes['tmlnSldrBox']), 1)) * states['tmln'].getDuration() + states['tmln'].getStartTime();

                                // update the clip end time to be at minimum 5s after the clip start time
                                states['tmln'].updateClipEndTime(getTruncDec(newClipEndTime > states['tmln'].getClipStartTime() + 5 ? newClipEndTime : Math.min(states['tmln'].getEndTime(), states['tmln'].getClipStartTime() + 5), 6));

                                // set the right clip thumb
                                setClipRightThumb((states['tmln'].getClipEndTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                                // update the current time to be within the clip bounds
                                if (videoPlr.currentTime >= states['tmln'].getClipEndTime()) {
                                    videoPlr.currentTime = states['tmln'].getClipStartTime();

                                    // set the playback sliders
                                    setSeekSldr();
                                    setTmlnSldr();

                                    // set the video current time label
                                    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                                }
                            }
                            else {
                                if (flags['isSpkVolStgSldrDrag']) {
                                    // set the speaker volume
                                    pseudoSetVol(getPtrEventPct(ptr, boxes['spkVolStgSldrBox']), true);  // boolean1 isSpk

                                    // set the speaker volume slider
                                    setVolStgSldr(true);  // boolean1 isSpk
                                }
                                else {
                                    if (flags['isMicVolStgSldrDrag']) {
                                        // set the microphone volume
                                        pseudoSetVol(getPtrEventPct(ptr, boxes['micVolStgSldrBox']), false);  // boolean1 isSpk

                                        // set the microphone volume slider
                                        setVolStgSldr(false);  // boolean1 isSpk
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // on mouseup, validate the sldr input and change the video time
    document.addEventListener('mouseup', async () => { 
        // if either playback slider is dragging
        if (flags['isTmlnSldrDrag'] === true || flags['isSeekSldrDrag'] === true) {
            flags['isTmlnSldrDrag'] = flags['isSeekSldrDrag'] = false;

            // hide the playback container if neither the video player or playback container are hovered
            if (!flags['isVideoPlrHover'] && !flags['isPlbkCtrHover'])
                plbkCtr.classList.remove('active');
            else {
                // if only the video player is hovered, reset the timeout
                if (flags['isVideoPlrHover']) {
                    // remove the old timeout
                    clearTimeout(states['plbkCtrTmo']);

                    // restart the timeout for hiding the playback container
                    states['plbkCtrTmo'] = setTimeout(() => {
                        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
                        if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
                            plbkCtr.classList.remove('active');
                    }, PLAYBACK_CONTAINER_TIMEOUT);
                }
            }

            // check if clipping is active
            if (clipBar.classList.contains('active')) {
                // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                if (videoPlr.currentTime < states['tmln'].getClipStartTime() || videoPlr.currentTime >= states['tmln'].getClipEndTime()) {
                    videoPlr.currentTime = states['tmln'].getClipStartTime();
        
                    // pause the video and change the icon
                    setVideoPlayerState('pause');
        
                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                }
                else {
                    // check if the video was not previously paused
                    if (!flags['isPrevPaused'])
                        // play the video and change the icon
                        setVideoPlayerState('play');
                }
        
                // set the video current time label
                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
            }
            else {
                // check if the video is out of the timeline bounds, set it back the start
                if (videoPlr.currentTime < states['tmln'].getStartTime() || videoPlr.currentTime >= states['tmln'].getEndTime()) {
                    videoPlr.currentTime = states['tmln'].getStartTime();

                    // pause the video and change the icon
                    setVideoPlayerState('pause');

                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                }
                else {
                    // check if the video was not previously paused
                    if (!flags['isPrevPaused'])
                        // play the video and change the icon
                        setVideoPlayerState('play');
                }

                // set the video current time label
                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
            }
        }
        else {
            // if the volume or playback rate sliders are dragging
            if (flags['isVideoVolSldrDrag']) {
                flags['isVideoVolSldrDrag'] = false;

                setVideoVol();

                // hide the playback container if neither the video player or playback container are hovered
                if (!flags['isVideoPlrHover'] && !flags['isPlbkCtrHover'])
                    plbkCtr.classList.remove('active');
                else {
                    // if only the video player is hovered, reset the timeout
                    if (flags['isVideoPlrHover']) {
                        // remove the old timeout
                        clearTimeout(states['plbkCtrTmo']);

                        // restart the timeout for hiding the playback container
                        states['plbkCtrTmo'] = setTimeout(() => {
                            // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
                            if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
                                plbkCtr.classList.remove('active');
                        }, PLAYBACK_CONTAINER_TIMEOUT);
                    }
                }


                if (!flags['isVideoVolBarBtnHover'] && !flags['isVideoVolSldrCtrHover'] && !flags['isPlbkCtrHover'])
                    videoVolSldr.classList.remove('active');

                if (!flags['isPlbkRateBarBtnHover'] && !flags['isPlbkRateSldrCtrHover'] && !flags['isPlbkCtrHover'])
                    plbkRateSldr.classList.remove('active');
            }
            else {
                if (flags['isPlbkRateSldrDrag']) {
                    flags['isPlbkRateSldrDrag'] = false;

                    // hide the playback container if neither the video player or playback container are hovered
                    if (!flags['isVideoPlrHover'] && !flags['isPlbkCtrHover'])
                        plbkCtr.classList.remove('active');
                    else {
                        // if only the video player is hovered, reset the timeout
                        if (flags['isVideoPlrHover']) {
                            // remove the old timeout
                            clearTimeout(states['plbkCtrTmo']);
    
                            // restart the timeout for hiding the playback container
                            states['plbkCtrTmo'] = setTimeout(() => {
                                // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
                                if (!videoPlr.paused && !flags['isSeekSldrDrag'] && !flags['isVideoVolSldrDrag'] && !flags['isPlbkRateSldrDrag'])
                                    plbkCtr.classList.remove('active');
                            }, PLAYBACK_CONTAINER_TIMEOUT);
                        }
                    }
    
                    if (!flags['isVideoVolBarBtnHover'] && !flags['isVideoVolSldrCtrHover'] && !flags['isPlbkCtrHover'])
                        videoVolSldr.classList.remove('active');
    
                    if (!flags['isPlbkRateBarBtnHover'] && !flags['isPlbkRateSldrCtrHover'] && !flags['isPlbkCtrHover'])
                        plbkRateSldr.classList.remove('active');
                }
                else {
                    // set the clip left thumb dragging flag to false
                    if (flags['isClipLeftThumbDrag'])
                        flags['isClipLeftThumbDrag'] = false; 
                    else {
                        // set the clip right thumb dragging flag to false
                        if (flags['isClipRightThumbDrag'])
                            flags['isClipRightThumbDrag'] = false; 
                        else {
                            // if the speaker volume slider is dragging, set the speaker volume setting
                            if (flags['isSpkVolStgSldrDrag']) {
                                flags['isSpkVolStgSldrDrag'] = false;

                                setVol(true);  // boolean1 isSpk

                                await atmpAsyncFunc(() => window['stgsAPI'].setStg('speakerVolume', data['stgs']['speakerVolume']));
                            }
                            else {
                                // if the microphone volume slider is dragging, set the microphone volume setting
                                if (flags['isMicVolStgSldrDrag']) {
                                    flags['isMicVolStgSldrDrag'] = false;

                                    setVol(false);  // boolean1 isSpk

                                    await atmpAsyncFunc(() => window['stgsAPI'].setStg('microphoneVolume', data['stgs']['microphoneVolume']))
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

        // the new start/end times, duration, and percentage
        let newStartTime, newEndTime, newDur, percentage;

        // check if the scroll is within the timeline slider
            if (ptr.clientX >= boxes['tmlnSldrBox']['left'] && ptr.clientX <= boxes['tmlnSldrBox']['right']) {
            // get the click percentage on the timeline slider
            percentage = getPtrEventPct(ptr, boxes['tmlnSldrBox']);
            
            // check if the pointer scrolled up (zoom in)
            if (ptr.deltaY < 0) {
                // check if the timeline is not at minimum zoom
                if (states['tmln'].getDuration() > TIMELINE_ZOOM_MIN) {
                    // calculate the new start/end times and duration
                    newStartTime = states['tmln'].getStartTime() + (TIMELINE_REDUCE_FACTOR * states['tmln'].getDuration() * percentage);
                    newEndTime = states['tmln'].getEndTime() - (TIMELINE_REDUCE_FACTOR * states['tmln'].getDuration() * (1 - percentage));
                    newDur = newEndTime - newStartTime;
                    
                    // check if the new duration is less than the minimum zoom, set it to the minimum
                    states['tmln'].updateTime(
                        getTruncDec((newDur < TIMELINE_ZOOM_MIN) ? newStartTime - (TIMELINE_ZOOM_MIN - newDur) * percentage : newStartTime, 6),
                        getTruncDec((newDur < TIMELINE_ZOOM_MIN) ? newStartTime - (TIMELINE_ZOOM_MIN - newDur) * percentage + TIMELINE_ZOOM_MIN : newEndTime, 6)
                    );
                    
                    // check if the video time is out of the timeline, put it back in bounds
                    if (videoPlr.currentTime < states['tmln'].getStartTime())
                        videoPlr.currentTime = states['tmln'].getStartTime();
                    else {
                        if (videoPlr.currentTime > states['tmln'].getEndTime())
                            videoPlr.currentTime = states['tmln'].getEndTime();
                    }

                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                    setTmlnOvrl();

                    // check if clipping is active
                    if (clipBar.classList.contains('active')) {
                        // check if the clip start time is within the timeline start time
                        if (states['tmln'].getClipStartTime() < states['tmln'].getStartTime())
                        {
                            states['tmln'].updateClipStartTime(states['tmln'].getStartTime());

                            // make sure the clip end time is at minimum 5s after the clip start time
                            if (states['tmln'].getClipEndTime() < states['tmln'].getClipStartTime() + CLIP_LENGTH_MIN)
                                states['tmln'].updateClipEndTime(states['tmln'].getClipStartTime() + CLIP_LENGTH_MIN);
                        }

                        // check if the clip end time is within the timeline end time
                        if (states['tmln'].getClipEndTime() >= states['tmln'].getEndTime()) {
                            states['tmln'].updateClipEndTime(states['tmln'].getEndTime());

                            // make sure the clip start time is at minimum 5s before the clip end time
                            if (states['tmln'].getClipStartTime() > states['tmln'].getClipEndTime() - CLIP_LENGTH_MIN)
                                states['tmln'].updateClipStartTime(states['tmln'].getClipEndTime() - CLIP_LENGTH_MIN);
                        }
                    }

                    // set the clip thumbs
                    setClipLeftThumb((states['tmln'].getClipStartTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
                    setClipRightThumb((states['tmln'].getClipEndTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                    // set the video current time label
                    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                }
            } 
            else {
                // check if the tmln is not at maximum zoom
                if (states['tmln'].getDuration() < videoPlr.duration) {
                    // calculate the new start and end times
                    newStartTime = states['tmln'].getStartTime() - (TIMELINE_GROW_FACTOR * states['tmln'].getDuration() * percentage);
                    newEndTime = states['tmln'].getEndTime() + (TIMELINE_GROW_FACTOR * states['tmln'].getDuration() * (1 - percentage));
                    
                    // check if zoom out would bring the timeline out of bounds
                    if (newStartTime < 0)
                        // reallocate grow factor to the end time if needed
                        states['tmln'].updateTime(
                            0, 
                            getTruncDec(Math.min(videoPlr.duration, Math.abs(newStartTime) + newEndTime), 6)
                        );
                    else
                        // reallocate grow factor to the start time if needed
                        states['tmln'].updateTime(
                            getTruncDec(newEndTime > videoPlr.duration ? Math.max(0, newStartTime - (newEndTime - videoPlr.duration)) : newStartTime, 6),
                            getTruncDec(Math.min(videoPlr.duration, newEndTime), 6)
                        );
                             
                    // check if the video time is out of the timeline, put it back in bounds
                    if (videoPlr.currentTime < states['tmln'].getStartTime())
                        videoPlr.currentTime = states['tmln'].getStartTime();
                    else {
                        if (videoPlr.currentTime > states['tmln'].getEndTime())
                            videoPlr.currentTime = states['tmln'].getEndTime();
                    }

                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                    setTmlnOvrl();

                    // check if clipping is active
                    if (clipBar.classList.contains('active')) {
                        // check if the clip start time is within the timeline start time
                        if (states['tmln'].getClipStartTime() < states['tmln'].getStartTime())
                        {
                            states['tmln'].updateClipStartTime(states['tmln'].getStartTime());

                            // make sure the clip end time is at minimum 5s after the clip start time
                            if (states['tmln'].getClipEndTime() < states['tmln'].getClipStartTime() + 5)
                                states['tmln'].updateClipEndTime(states['tmln'].getClipStartTime() + 5);
                        }

                        // check if the clip end time is within the timeline end time
                        if (states['tmln'].getClipEndTime() >= states['tmln'].getEndTime()) {
                            states['tmln'].updateClipEndTime(states['tmln'].getEndTime());

                            // make sure the clip start time is at minimum 5s before the clip end time
                            if (states['tmln'].getClipStartTime() > states['tmln'].getClipEndTime() - 5)
                                states['tmln'].updateClipStartTime(states['tmln'].getClipEndTime() - 5);
                        }
                    }

                    // set the clip thumbs
                    setClipLeftThumb((states['tmln'].getClipStartTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
                    setClipRightThumb((states['tmln'].getClipEndTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                    // set the video current time label
                    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                }
            }
        }
    });

    // on mousedown, set the timeline slider dragging / previously paused flags, and the current time
    tmlnSldr.addEventListener('mousedown', (ptr) => { 
        // get the time based on click location on the timeline slider
        videoPlr.currentTime = states['tmln'].getDuration() * getPtrEventPct(ptr, boxes['tmlnSldrBox']) + states['tmln'].getStartTime();

        // set the playback sliders
        setSeekSldr();
        setTmlnSldr();

        flags['isTmlnSldrDrag'] = true; 
        flags['isPrevPaused'] = videoPlr.paused;
    });

    // on mousedown, set the clip left thumb drag and previously paused flags
    clipLeftThumb.addEventListener('mousedown', (event) => {
        // prevent mousedown event on timeline slider from firing
        event.stopPropagation();

        flags['isClipLeftThumbDrag'] = true; 
    });

    // on mousedown, set the clip left thumb drag and previously paused flags
    clipRightThumb.addEventListener('mousedown', (event) => {
        // prevent mousedown event on tmln sldr from firing
        event.stopPropagation();

        flags['isClipRightThumbDrag'] = true; 
    });
}

/**
 * Initializes the clip container event listeners
 */
function initClipCtrEL() {
    // on click, preview the clip
    viewBarBtn.addEventListener('click', () => {
        // set the video time to the clip start time
        videoPlr.currentTime = states['tmln'].getClipStartTime();

        // play the video and change the icon
        setVideoPlayerState('play');
    });

    // on click, create the clip and reload the clip gallery
    createBarBtn.addEventListener('click', async () => {
        await atmpAsyncFunc(() => window['genAPI'].createClip(videoPlr.getAttribute('src'), states['tmln'].getClipStartTime(), states['tmln'].getClipEndTime()));

        await atmpAsyncFunc(() => loadGall(false, false));
    });

    // on click, change the clip toggle button state
    clipTglBtn.addEventListener('click', () => {
        let newClipStartTime, newClipEndTime;

        clipBar.classList.toggle('active');

        // change the icon and save the setting, depending on if the clip bar is active
        if (clipBar.classList.contains('active')) {
            // change the icon
            setIcon(clipTglIcon, 'arrow-back-ios');

            // set the clip thumbs to active
            clipLeftThumb.classList.add('active');
            clipRightThumb.classList.add('active');

            // ensure the clip bounds are centered around the current time and within the timeline bounds
            if (states['tmln'].getClipLength() < states['tmln'].getDuration()) {
                newClipStartTime = videoPlr.currentTime - states['tmln'].getClipLength() / 2;
                newClipEndTime = videoPlr.currentTime + states['tmln'].getClipLength() / 2;
    
                states['tmln'].updateClipStartTime(getTruncDec(newClipStartTime < states['tmln'].getStartTime() ? states['tmln'].getStartTime() : (newClipEndTime > states['tmln'].getEndTime() ? states['tmln'].getEndTime() - states['tmln'].getClipLength() : newClipStartTime), 6));
                states['tmln'].updateClipEndTime(getTruncDec(newClipStartTime < states['tmln'].getStartTime() ? states['tmln'].getStartTime() + states['tmln'].getClipLength() : (newClipEndTime > states['tmln'].getEndTime() ? states['tmln'].getEndTime() : newClipEndTime), 6));
            }
            else {
                states['tmln'].updateClipStartTime(states['tmln'].getStartTime());
                states['tmln'].updateClipEndTime(states['tmln'].getEndTime());
            }
    
            // set the clip thumbs
            setClipLeftThumb((states['tmln'].getClipStartTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
            setClipRightThumb((states['tmln'].getClipEndTime() - states['tmln'].getStartTime()) / states['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
        }
        else {
            setIcon(clipTglIcon, 'arrow-forward-ios');

            clipLeftThumb.classList.remove('active');
            clipRightThumb.classList.remove('active');
        }
    });
}

/**
 * Sets the video player state
 * 
 * @param {string} action - The action to take on the video player state
 */
function setVideoPlayerState(action) {
    switch (action) {
        case 'play':
            // play the video, change the icon to pause, hide the overlay
            setIcon(playPauseBarIcon, 'pause-solid');
            playPauseStatIcon.classList.remove('active');
            videoPlr.play();

            break;

        case 'pause':
            // pause the video, change the icon to play, show the overlay
            setIcon(playPauseBarIcon, 'play-arrow-solid');
            playPauseStatIcon.classList.add('active');
            videoPlr.pause();

            break;

        case 'toggle':
            // play/pause the video, change the icon to the opposite, toggle the overlay
            if (videoPlr.paused || videoPlr.ended) {
                setIcon(playPauseBarIcon, 'pause-solid');
                playPauseStatIcon.classList.remove('active');
                videoPlr.play();
            }
            else {
                setIcon(playPauseBarIcon, 'play-arrow-solid');
                playPauseStatIcon.classList.add('active');
                videoPlr.pause();
            }

            break;
        case 'standby':
            // pause the video, change the icon to pause, hide the overlay
            setIcon(playPauseBarIcon, 'pause-solid');
            playPauseStatIcon.classList.remove('active');
            videoPlr.pause();

            break;
    }
}

/**
 * Sets the seek slider thumb and overlay
 */
function setSeekSldr() {
    setSeekThumb(videoPlr.currentTime / videoPlr.duration * boxes['seekSldrBox']['width']);
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
function updateSeekSldr() {
    // get the new seek slider bounding box
    boxes['seekSldrBox'] = getModBox(seekSldr.getBoundingClientRect());
}

/**
 * Sets the volume of the video in the settings cache ONLY
 * 
 * @param {number} value - The new volume of the video
 */
function pseudoSetVideoVol(value) {
    videoPlr.volume = data['stgs']['videoVolume'] = Math.max(VIDEO_VOLUME_MIN, Math.min(value, VIDEO_VOLUME_MAX));
    videoPlr.muted = data['stgs']['videoVolumeMuted'] = videoPlr.volume === VIDEO_VOLUME_MIN;
}

/**
 * Sets the volume of the video in the main process settings
 */
async function setVideoVol() {
    await Promise.all([atmpAsyncFunc(() => window['stgsAPI'].setStg('videoVolume', data['stgs']['videoVolume'])), atmpAsyncFunc(() => window.stgsAPI.setStg('videoVolumeMuted', data['stgs']['videoVolumeMuted']))]);
}

/**
 * Toggles the volume muted state and saves the state in the settings cache ONLY
 */
function pseudoTogVideoVolMute() {
    // set the vol to 0.1 in case the video gets unmuted
    if (videoPlr.volume === VIDEO_VOLUME_MIN)
        videoPlr.volume = data['stgs']['videoVolume'] = VIDEO_VOLUME_MUTED;

    // toggle the muted state
    videoPlr.muted = data['stgs']['videoVolumeMuted'] = !videoPlr.muted;
}

/**
 * Sets the volume button and slider thumb and overlay
 */
function setVideoVolBtnSldr() { 
    // if the video is muted, move the slider to the left and set the muted icon
    if (videoPlr.muted) {
        setIcon(videoVolBarIcon, 'volume-off-solid');

        setVideoVolThumb(0);
        setVideoVolOvrl(0);
    }
    else {
        // else, set the correct volume icon
        if (videoPlr.volume > 0.6)
            setIcon(videoVolBarIcon, 'volume-up-solid');
        else {
            if (videoPlr.volume > 0.1)
                setIcon(videoVolBarIcon, 'volume-down-solid');
            else
                setIcon(videoVolBarIcon, 'volume-mute-solid');
        }

        // set the volume thumb and overlay (trailing bar)
        setVideoVolThumb(videoPlr.volume * videoVolSldrWidth);
        setVideoVolOvrl(videoPlr.volume * 100);
    }
}

/**
 * Sets the volume slider overlay
 * 
 * @param {number} thumbLoc - The location of the vol thumb
 */
function setVideoVolOvrl(thumbLoc) {
    videoVolOvrl.style.background = `linear-gradient(to right, var(--vvooverlay-lgradientcolor) ${thumbLoc}%, transparent ${thumbLoc}%`;
}

/**
 * Sets the volume slider thumb
 * 
 * @param {number} thumbLoc - The location of the vol thumb
 */
function setVideoVolThumb(thumbLoc) {
    videoVolThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the volume slider
 */
function updateVideoVolSldr() {
    // get the new volume slider bounding box
    boxes['videoVolSldrBox'] = getModBox(videoVolSldr.getBoundingClientRect());
    boxes['videoVolSldrBox']['right'] += videoVolSldrWidth;
    boxes['videoVolSldrBox']['width'] = videoVolSldrWidth;
}

/**
 * Sets the playback rate of the video
 * 
 * @param {number} value - The playback rate of the video
 */
function setPlbkRate(value) {
    videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(value, PLAYBACK_RATE_MAX))];
}

/**
 * Sets the playback rate slider text and thumb
 */
function setPlbkRateBtnSldr() {
    plbkRateValueLabel.textContent = videoPlr.playbackRate;
    setPlbkRateThumb(plbkRateSldrWidth / 6 * (PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + 2));
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
function updatePlbkRateSldr() {
    boxes['plbkRateSldrBox'] = getModBox(plbkRateSldr.getBoundingClientRect());
    boxes['plbkRateSldrBox']['left'] -= plbkRateSldrWidth;
    boxes['plbkRateSldrBox']['width'] = plbkRateSldrWidth;
}

/**
 * Sets the timeline slider thumb
 */
function setTmlnSldr() {
    setTmlnThumb(Math.max(0, Math.min((videoPlr.currentTime - states['tmln'].getStartTime()) / states['tmln'].getDuration(), 1) * boxes['tmlnSldrBox'].width));
}

/**
 * Sets the timeline overlay
 */
function setTmlnOvrl() {
    // get the location of the first tick in seconds and the number of ticks based on the duration
    const firstTick = Math.ceil(states['tmln'].getStartTime() / states['tmln'].getSubInterval()) * states['tmln'].getSubInterval();
    const numTicks = ((Math.floor(states['tmln'].getEndTime() / states['tmln'].getSubInterval()) * states['tmln'].getSubInterval()) - firstTick) / states['tmln'].getSubInterval() + 1;

    // get the tick line template and the tick text template
    const tickLineTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const tickTextTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // the tick line clone, tick text clone, tick location, and tick percentage
    let tickLineClone, tickTextClone, tickLocation, tickPercentage;

    // set the default tick line height
    tickLineTemplate.setAttribute('y1', 15);
    tickLineTemplate.setAttribute('y2', 30);

    // set the default tick text vertical location
    tickTextTemplate.setAttribute('y', 45);
    tickTextTemplate.classList.add('timeline-text');

    // remove all timeline overlay ticks
    while (tmlnOvrl.firstElementChild)
    {
        tmlnOvrl.removeChild(tmlnOvrl.lastElementChild);
    }

    // iterate through each tick
    for (let i = 0; i < numTicks; i++)
    {
        // get the location of the tick in seconds
        tickLocation = firstTick + (i * states['tmln'].getSubInterval());
        // get the percentage location of the tick within the timeline overlay
        tickPercentage = (tickLocation - states['tmln'].getStartTime()) / states['tmln'].getDuration();

        // get the tick line clone
        tickLineClone = tickLineTemplate.cloneNode(true);

        // set the tick line horizontal location
        tickLineClone.setAttribute('x1', tickPercentage * boxes['tmlnSldrBox'].width);
        tickLineClone.setAttribute('x2', tickPercentage * boxes['tmlnSldrBox'].width);

        // check if the tick is an interval (larger) tick
        if (tickLocation % states['tmln'].getInterval() === 0) {
            // set the tick line height to be larger
            tickLineClone.setAttribute('y1', 10);
            tickLineClone.setAttribute('y2', 50);

            // get the tick text clone
            tickTextClone = tickTextTemplate.cloneNode(true);

            // set the tick text horizontal location
            tickTextClone.setAttribute('x', tickPercentage * boxes['tmlnSldrBox'].width + 5);
            // set the tick text time label
            tickTextClone.textContent = getRdblDur(tickLocation);

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
 * @param {number} thumbLoc - The location of the tmln thumb
 */
function setTmlnThumb(thumbLoc) {
    tmlnThumb.style.transform = `translateX(${thumbLoc}px)`;
}

/**
 * Updates the timeline slider
 */
function updateTmlnSldr() {
    // get the new timeline slider bounding box
    boxes['tmlnSldrBox'] = getModBox(tmlnSldr.getBoundingClientRect());
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
 * Syncs the seek and tmln thumbs to the video frame
 */
function syncSeekTmlnSldrs() {
    // set the playback sliders
    setSeekSldr();
    setTmlnSldr();

    // request the next animation frame if the video is playing
    if (!videoPlr.paused && !videoPlr.ended)
        states['animID'] = requestAnimationFrame(syncSeekTmlnSldrs);
}