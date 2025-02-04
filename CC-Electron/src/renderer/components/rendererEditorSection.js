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
    CONTENT_STATUS_LABEL_TIMEOUT, NAV_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, PLAYBACK_CONTAINER_TIMEOUT, PLAYBACK_GROW_VALUE, PLAYBACK_REDUCE_VALUE, 
    VOLUME_MIN, VOLUME_MAX, VOLUME_GROW_VALUE, VOLUME_REDUCE_VALUE, VOLUME_MUTED, 
    PLAYBACK_RATE_DEF, PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_MIN_ZOOM, CLIP_MIN_LENGTH, SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, dirsBarIcon, stgsBarBtn, stgsBarIcon, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, recBarIcon, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltDirStgFld, capsMetaFltDirStgFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltDirStgFld, clipsMetaFltDirStgFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwTemplate, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    volBarBtn, volBarIcon, volSldrCtr, volSldr, volSldrWidth, volOvrl, volThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, viewBarIcon, crtBarBtn, crtBarIcon, clipTglBtn, clipTglIcon, 
    mostStgTglSwtes, darkModeStgTglFld, darkModeStgTglIcon, 
    mostStgFlds, capsDirStgFld, capsLimitStgFld, capsDispStgFld, clipsDirStgFld, clipsLimitStgFld, clipsFrmStgFlds, clipsWidthStgFlds, clipsHeightStgFlds, 
    spkStgFld, spkVolSldr, spkVolSldrWidth, spkVolOvrl, spkVolThumb, micStgFld, micVolSldr, micVolSldrWidth, micVolOvrl, micVolThumb, 
    boxes, data, flags, state, 
    initRendVars 
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
import { initRendDirsSect, loadGall, updateGall } from './rendererDirectoriesSection.js';
import { initRendStgsSect, setSpkVolSldr, setSpkVolOvrl, setSpkVolThumb, updateSpkVolSldr, setMicVolSldr, setMicVolOvrl, setMicVolThumb, updateMicVolSldr } from './rendererSettingsSection.js';

/**
 * @exports initRendEditSect, setVideoPlayerState, setSeekSldr, setSeekTrack, setSeekOvrl, setSeekThumb, updateSeekSldr, setVolSldr, setVolOvrl, setVolThumb, updateVolSldr, setPlbkRateSldr, setPlbkRateThumb, updatePlbkRateSldr, setTmlnSldr, setTmlnOvrl, setTmlnThumb, updateTmlnSldr, setClipLeftThumb, setClipRightThumb, syncSeekTmlnSldrs
 */
export { initRendEditSect, setVideoPlayerState, setSeekSldr, setSeekTrack, setSeekOvrl, setSeekThumb, updateSeekSldr, setVolSldr, setVolOvrl, setVolThumb, updateVolSldr, setPlbkRateSldr, setPlbkRateThumb, updatePlbkRateSldr, setTmlnSldr, setTmlnOvrl, setTmlnThumb, updateTmlnSldr, setClipLeftThumb, setClipRightThumb, syncSeekTmlnSldrs }

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
        if (flags['videoLoaded']) {
            switch (event.key) {
                // spacebar - toggle the video player state
                case ' ':
                    setVideoPlayerState('toggle');

                    break;
                
                // left arrow - decrease the volume, playback rate, or current time
                case 'ArrowLeft':
                    if (flags['volBarBtnHover'] || flags['volSldrCtrHover']) {
                        videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(videoPlr.volume - VOLUME_REDUCE_VALUE, VOLUME_MAX));
                        videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

                        // set the volume slider
                        setVolSldr();
                    }
                    else {
                        if (flags['plbkRateBarBtnHover'] || flags['plbkRateSldrCtrHover']) {
                            videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_MAX))];
                
                            // set the playback rate slider
                            setPlbkRateSldr();
                        }
                        else {
                            videoPlr.currentTime -= PLAYBACK_REDUCE_VALUE;

                            // check if clipping is active
                            if (clipBar.classList.contains('active')) {
                                // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                                if (videoPlr.currentTime < state['tmln'].getClipStartTime() || videoPlr.currentTime >= state['tmln'].getClipEndTime()) {
                                    videoPlr.currentTime = state['tmln'].getClipStartTime();
                        
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
                                if (videoPlr.currentTime < state['tmln'].getStartTime() || videoPlr.currentTime >= state['tmln'].getEndTime()) {
                                    videoPlr.currentTime = state['tmln'].getStartTime();

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
                    if (flags['volBarBtnHover'] || flags['volSldrCtrHover']) {
                        videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(videoPlr.volume + VOLUME_GROW_VALUE, VOLUME_MAX));
                        videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

                        // set the volume slider
                        setVolSldr();
                    }
                    else {
                        if (flags['plbkRateBarBtnHover'] || flags['plbkRateSldrCtrHover']) {
                            videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_REDUCE_VALUE, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_MAX))];
                    
                            // set the playback rate slider
                            setPlbkRateSldr();
                        }
                        else {
                            videoPlr.currentTime += PLAYBACK_GROW_VALUE;

                            // check if clipping is active
                            if (clipBar.classList.contains('active')) {
                                // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                                if (videoPlr.currentTime < state['tmln'].getClipStartTime() || videoPlr.currentTime >= state['tmln'].getClipEndTime()) {
                                    videoPlr.currentTime = state['tmln'].getClipStartTime();
                        
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
                                if (videoPlr.currentTime < state['tmln'].getStartTime() || videoPlr.currentTime >= state['tmln'].getEndTime()) {
                                    videoPlr.currentTime = state['tmln'].getStartTime();

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
                    videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_MAX))];

                    // set the playback rate slider
                    setPlbkRateSldr();

                    break;

                // equals - increase the playback rate
                case '=':
                    videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_MAX))];

                    // set the playback rate slider
                    setPlbkRateSldr();

                    break;

                // m - mute the volume
                case 'm':
                    // set the vol to 0.1 in case the video gets unmuted
                    if (videoPlr.volume === VOLUME_MIN) {
                        videoPlr.volume = data['stgs']['volume'] = VOLUME_MUTED;
                    }

                    // toggle the muted state
                    videoPlr.muted = data['stgs']['volumeMuted'] = !videoPlr.muted;

                    // set the volume slider
                    setVolSldr();

                    break;

                // escape - unload the video
                case 'Escape':
                    // set the active content section to the directories section
                    setActiveSect('directories');

                    break;
            }
        }
    });

    // on fullscreen change, change the icon and resize the seek, volume, and playback rate sliders
    videoCtr.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            setIcon(fscBarIcon, 'fullscreen-exit');

            updateSeekSldr();
            updateVolSldr();
            updatePlbkRateSldr();
        }
        else {
            setIcon(fscBarIcon, 'fullscreen');

            updateSeekSldr();
            updateVolSldr();
            updatePlbkRateSldr();
        }
    });

    // on load of meta data, set the editor to default state
    videoPlr.addEventListener('loadedmetadata', () => {
        // reset the timeline state
        state['tmln'].updateTime(0, videoPlr.duration);

        // update the playback and playback rate sliders
        setSeekSldr();
        setPlbkRateSldr();
        setTmlnSldr();
        setTmlnOvrl();

        // set the video current time label to 0
        curVideoTimeLabel.textContent = '0:00';
        curVideoDurLabel.textContent = `/${getRdblDur(videoPlr.duration)}`;

        // set the video loaded flag
        flags['videoLoaded'] = true;

        // auto play the video and change the icon
        setVideoPlayerState('play');
    });

    // on time update, check the video player time and update the playback sliders
    videoPlr.addEventListener('timeupdate', () => {
        // check if the video is loaded (editor section is active)
        if (flags['videoLoaded']) {
            // not necessary?
            if (!flags['tmlnSldrDrag'] && !flags['seekSldrDrag'] && !flags['clipLeftThumbDrag'] && !flags['clipRightThumbDrag']) {
                // check if clipping is active
                if (clipBar.classList.contains('active')) {
                    // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                    if (videoPlr.currentTime < state['tmln'].getClipStartTime() || videoPlr.currentTime >= state['tmln'].getClipEndTime()) {
                        videoPlr.currentTime = state['tmln'].getClipStartTime();
            
                        // pause the video and change the icon
                        setVideoPlayerState('pause');
            
                        // set the seek sldr and tmln sldr
                        setSeekSldr();
                        setTmlnSldr();
                    }
                }
                else {
                    // reset the video, change the icon, and pause the video, depending on if the video is outside of the tmln bounds
                    if (videoPlr.currentTime < state['tmln'].getStartTime() || videoPlr.currentTime >= state['tmln'].getEndTime()) {
                        videoPlr.currentTime = state['tmln'].getStartTime();
            
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

        flags['videoPlrHover'] = true;

        // restart the timeout for hiding the playback container
        state['plbkCtrTmo'] = setTimeout(() => {
            // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
            if (!videoPlr.paused && !flags['seekSldrDrag'] && !flags['volSldrDrag'] && !flags['plbkRateSldrDrag']) {
                plbkCtr.classList.remove('active');
            }
        }, PLAYBACK_CONTAINER_TIMEOUT);
    });

    // on mousemove, show the playback container and reset the timeout for hiding
    videoPlr.addEventListener('mousemove', () => {
        // show the playback container
        plbkCtr.classList.add('active');

        // remove the old timeout
        clearTimeout(state['plbkCtrTmo']);
        
        // reset the timeout for hiding
        state['plbkCtrTmo'] = setTimeout(() => {
            // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
            if (!videoPlr.paused && !flags['seekSldrDrag'] && !flags['volSldrDrag'] && !flags['plbkRateSldrDrag']) {
                plbkCtr.classList.remove('active');
            }
        }, PLAYBACK_CONTAINER_TIMEOUT);
    });

    // on click, toggle the video state
    videoPlr.addEventListener('click', () => {
        setVideoPlayerState('toggle');
    });

    // on play, start animation frames to move the playback sliders smoothly
    videoPlr.addEventListener('play', () => {
        // sync the slider thumbs' movement to each frame of the video
        state['animID'] = requestAnimationFrame(syncSeekTmlnSldrs);
    });

    // on pause, show the playback container and cancel animation frames
    videoPlr.addEventListener('pause', () => {
        // show the playback container
        plbkCtr.classList.add('active');

        // cancel the syncing to prevent unnecessary computations while paused
        cancelAnimationFrame(state['animID']);
    });

    // on mouseleave, conditionally hide the playback ctr and remove the timeout for disappearing
    videoPlr.addEventListener('mouseleave', () => {
        flags['videoPlrHover'] = false;

        // remove the old timeout
        clearTimeout(state['plbkCtrTmo']);

        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !flags['seekSldrDrag'] && !flags['volSldrDrag'] && !flags['plbkRateSldrDrag']) {
            plbkCtr.classList.remove('active');
        }
    })

    // on mouseenter, show the playback container
    plbkCtr.addEventListener('mouseenter', () => {   
        // show the playback container
        plbkCtr.classList.add('active');

        flags['plbkCtrHover'] = true;
    });

    // on mouseleave, conditionally hide the playback ctr and remove the timeout for disappearing
    plbkCtr.addEventListener('mouseleave', () => {
        flags['plbkCtrHover'] = false;

        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
        if (!videoPlr.paused && !flags['seekSldrDrag'] && !flags['volSldrDrag'] && !flags['plbkRateSldrDrag']) {
            plbkCtr.classList.remove('active');
        }
    });

    // on mousemove, show a hover highlight based on the pointer location
    seekSldr.addEventListener('mousemove', (pointer) => {
        setSeekTrack(getPtrEventPct(pointer, boxes['seekSldrBox']) * 100);
    });

    // on mousedown, set the current time based on the pointer location
    seekSldr.addEventListener('mousedown', (pointer) => { 
        // set current time based on click location
        videoPlr.currentTime = videoPlr.duration * getPtrEventPct(pointer, boxes['seekSldrBox']);

        // set the playback sliders
        setSeekSldr();
        setTmlnSldr();

        flags['seekSldrDrag'] = true; 
        flags['prevPaused'] = videoPlr.paused;
    });

    // on mouseleave, hide the hover hightlight
    seekSldr.addEventListener('mouseleave', () => {
        setSeekTrack(0);
    });

    // on mouseleave, hide the volume and playback rate sliders if they are not dragging
    mediaBar.addEventListener('mouseleave', () => {
        if (!flags['volSldrDrag']) {
            volSldr.classList.remove('active');
        }

        if (!flags['plbkRateSldrDrag']) {
            plbkRateSldr.classList.remove('active');
        }
    });

    // on click, toggle the video state and change the icon
    playPauseBarBtn.addEventListener('click', () => setVideoPlayerState('toggle'));

    // on mouseenter, show the volume slider and update it if needed
    volBarBtn.addEventListener('mouseenter', () => {
        // show the volume slider
        volSldr.classList.add('active');

        flags['volBarBtnHover'] = true

        if (flags['updateVolSldr']) {
            // wait for the transition to finish, then update the box size
            setTimeout(() => {
                boxes['volSldrBox'] = volSldr.getBoundingClientRect();
                flags['updateVolSldr'] = false;
            }, 200);
        }
    });

    // on click, mute/unmute the volume and change the icon
    volBarBtn.addEventListener('click', () => {
        // set the volume to 0.1 in case the video gets unmuted
        if (videoPlr.volume === VOLUME_MIN) {
            videoPlr.volume = data['stgs']['volume'] = VOLUME_MUTED;
        }

        // toggle the muted state
        videoPlr.muted = data['stgs']['volumeMuted'] = !videoPlr.muted;

        // set the volume slider
        setVolSldr();
    });

    // on wheel, increase or decrease the volume
    volBarBtn.addEventListener('wheel', (pointer) => {
        // prevent the default scrolling on the container
        pointer.preventDefault();

        // if scrolling 'up', increase the volume
        if (pointer.deltaY < 0) {
            videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(videoPlr.volume + VOLUME_GROW_VALUE, VOLUME_MAX));
            videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

            // set the volume slider
            setVolSldr();
        }
        // else, decrease the volume
        else {
            videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(videoPlr.volume - VOLUME_REDUCE_VALUE, VOLUME_MAX));
            videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

            // set the volume slider
            setVolSldr();
        }
    });

    // on mouseleave, disable the hover flag
    volBarBtn.addEventListener('mouseleave', () => flags['volBarBtnHover'] = false);

    // on mouseenter, enable the hover flag
    volSldrCtr.addEventListener('mouseenter', () => flags['volSldrCtrHover'] = true);

    // on wheel, increase or decrease the volume
    volSldrCtr.addEventListener('wheel', (pointer) => {
        // prevent the default scrolling on the container
        pointer.preventDefault();

        // if scrolling 'up', increase the volume
        if (pointer.deltaY < 0) {
            videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(videoPlr.volume + VOLUME_GROW_VALUE, VOLUME_MAX));
            videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

            // set the volume slider
            setVolSldr();
        }
        // else, decrease the volume
        else {
            videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(videoPlr.volume - VOLUME_REDUCE_VALUE, VOLUME_MAX));
            videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

            // set the volume slider
            setVolSldr();
        }
    });

    // on mouseleave, disable the hover flag
    volSldrCtr.addEventListener('mouseleave', () => flags['volSldrCtrHover'] = false);

    // on mousedown, enable the dragging flag
    volSldr.addEventListener('mousedown', () => flags['volSldrDrag'] = true);

    // on click, set the volume based on the pointer location
    volSldr.addEventListener('click', (pointer) => {
        videoPlr.volume = data['stgs']['volume'] = Math.max(VOLUME_MIN, Math.min(getPtrEventPct(pointer, boxes['volSldrBox']), VOLUME_MAX));
        videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === VOLUME_MIN;

        // set the volume slider
        setVolSldr();
    });

    // on mouseenter, enable the hover flag
    plbkRateSldrCtr.addEventListener('mouseenter', () => flags['plbkRateSldrCtrHover'] = true);

    // on wheel, increase or decrease the playback rate
    plbkRateSldrCtr.addEventListener('wheel', (pointer) => {
        // prevent the default scrolling on the container
        pointer.preventDefault();

        // if scrolling 'up', increase the playback rate
        if (pointer.deltaY < 0) {
            videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_MAX))];
            
            // set the playback rate slider
            setPlbkRateSldr();
        }
        // else, decrease the playback rate
        else {
            videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_MAX))];
            
            // set the playback rate slider
            setPlbkRateSldr();
        }
    });

    // on mouseleave, disable the hover flag
    plbkRateSldrCtr.addEventListener('mouseleave', () => flags['plbkRateSldrCtrHover'] = false);

    // on mousedown, enable the dragging flag
    plbkRateSldr.addEventListener('mousedown', () => flags['plbkRateSldrDrag'] = true);

    // on click, set the playback rate
    plbkRateSldr.addEventListener('click', (pointer) => {
        // update the video playback rate
        videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(Math.round(getPtrEventLoc(pointer, boxes['plbkRateSldrBox']) / (boxes['plbkRateSldrBox'].width / PLAYBACK_RATE_SEGMENTS) - PLAYBACK_RATE_MAPPING_OFFSET), PLAYBACK_RATE_MAX))];

        // set the playback rate sldr
        setPlbkRateSldr();
    });

    // on click, revert to the default playback speed
    plbkRateBarBtn.addEventListener('click', () => {
        // set the default playback rate
        videoPlr.playbackRate = PLAYBACK_RATE_DEF;

        // set the playback rate slider
        setPlbkRateSldr();
    });

    // on mouseenter, show the playback rate slider
    plbkRateBarBtn.addEventListener('mouseenter', () => {
        // show the playback rate slider
        plbkRateSldr.classList.add('active');

        flags['plbkRateBarBtnHover'] = true

        // wait for the transition to finish, then update the box size
        if (flags['updatePlbkRateSldr']) {
            // wait for the transition to finish, then cap the box
            setTimeout(() => {
                boxes['plbkRateSldrBox'] = plbkRateSldr.getBoundingClientRect();
                flags['updatePlbkRateSldr'] = false;
            }, 200);
        }
    });

    // on wheel, increase or decrease the playback rate
    plbkRateBarBtn.addEventListener('wheel', (pointer) => {
        // prevent the default scrolling on the container
        pointer.preventDefault();

        // if scrolling 'up', increase the playback rate
        if (pointer.deltaY < 0) {
            videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + PLAYBACK_RATE_GROW_VALUE, PLAYBACK_RATE_MAX))];
            
            // set the playback rate slider
            setPlbkRateSldr();
        }
        // else, decrease the playback rate
        else {
            videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(PLAYBACK_RATE_MIN, Math.min(PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] - PLAYBACK_RATE_REDUCE_VALUE, PLAYBACK_RATE_MAX))];
            
            // set the playback rate slider
            setPlbkRateSldr();
        }
    });

    // on mouseleave, disable the hover flag
    plbkRateBarBtn.addEventListener('mouseleave', () => flags['plbkRateBarBtnHover'] = false);

    // on click, toggle the video player fullscreen
    fscBarBtn.addEventListener('click', () => document.fullscreenElement !== null ? document.exitFullscreen() : videoCtr.requestFullscreen());
}

/**
 * Initializes the video ctr
 */
function initVideoCtr() {
    // set the initial volume and muted state
    videoPlr.volume = data['stgs']['volume'];
    videoPlr.muted = data['stgs']['volumeMuted'];

    // set the volume slider
    setVolSldr();

    // standby will pause the video but hide the play pause icon overlay
    setVideoPlayerState('standby');
}

/**
 * Initializes the timeline slider event listeners
 */
function initTmlnSldrEL() {
    // on mousemove, match seek slider and timeline slider position and set video time
    document.addEventListener('mousemove', (pointer) => {
        // check if the seek slider is dragging
        if (flags['seekSldrDrag']) {
            // pause the video and change the icon
            setVideoPlayerState('pause');

            // get the time based on pointer location on the seek slider
            videoPlr.currentTime = Math.max(0, Math.min(getPtrEventPct(pointer, boxes['seekSldrBox']), 1)) * videoPlr.duration;

            // set the playback sliders
            setSeekSldr();
            setTmlnSldr(); 

            // set the video current time label
            curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
        }
        else {
            // check if the volume slider is dragging
            if (flags['volSldrDrag']) {
                // update the video volume and settings cache
                videoPlr.volume = data['stgs']['volume'] = Math.max(0, Math.min(getPtrEventPct(pointer, boxes['volSldrBox']), 1));
                videoPlr.muted = data['stgs']['volumeMuted'] = videoPlr.volume === 0;

                // set the vol slider
                setVolSldr();
            }
            else {
                // check if the playback rate slider is dragging
                if (flags['plbkRateSldrDrag']) {
                    // update the video playback rate
                    videoPlr.playbackRate = PLAYBACK_RATE_MAPPING[Math.max(-2, Math.min(Math.round(getPtrEventLoc(pointer, boxes['plbkRateSldrBox']) / (boxes['plbkRateSldrBox'].width / 6) - 2), 4))];

                    // set the playback rate slider
                    setPlbkRateSldr();
                }
                else {
                    // check if the timeline slider is dragging
                    if (flags['tmlnSldrDrag']) {
                        // pause the video and change the icon
                        setVideoPlayerState('pause');

                        // get the time based on pointer location on the timeline slider
                        videoPlr.currentTime = Math.max(0, Math.min(getPtrEventPct(pointer, boxes['tmlnSldrBox']), 1)) * state['tmln'].getDuration() + state['tmln'].getStartTime();

                        // set the playback sliders
                        setSeekSldr();
                        setTmlnSldr();

                        // set the video current time label
                        curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                    }
                    else {
                        // check if the left clip thumb is dragging
                        if (flags['clipLeftThumbDrag']) {
                            // get the new clip start time
                            const newClipStartTime = Math.max(0, Math.min(getPtrEventPct(pointer, boxes['tmlnSldrBox']), 1)) * state['tmln'].getDuration() + state['tmln'].getStartTime();

                            // update the clip start time to be at minimum 5s before the clip end time
                            state['tmln'].updateClipStartTime(getTruncDec(newClipStartTime < state['tmln'].getClipEndTime() - 5 ? newClipStartTime : Math.max(state['tmln'].getStartTime(), state['tmln'].getClipEndTime() - 5), 6));

                            // set the left clip thumb
                            setClipLeftThumb((state['tmln'].getClipStartTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                            // update the current time to be within the clip bounds
                            if (videoPlr.currentTime < state['tmln'].getClipStartTime()) {
                                videoPlr.currentTime = state['tmln'].getClipStartTime();

                                // set the playback sliders
                                setSeekSldr();
                                setTmlnSldr();

                                // set the video current time label
                                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                            }
                        }
                        else {
                            if (flags['clipRightThumbDrag']) {
                                // get the new clip end time
                                let newClipEndTime = Math.max(0, Math.min(getPtrEventPct(pointer, boxes['tmlnSldrBox']), 1)) * state['tmln'].getDuration() + state['tmln'].getStartTime();

                                // update the clip end time to be at minimum 5s after the clip start time
                                state['tmln'].updateClipEndTime(getTruncDec(newClipEndTime > state['tmln'].getClipStartTime() + 5 ? newClipEndTime : Math.min(state['tmln'].getEndTime(), state['tmln'].getClipStartTime() + 5), 6));

                                // set the right clip thumb
                                setClipRightThumb((state['tmln'].getClipEndTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                                // update the current time to be within the clip bounds
                                if (videoPlr.currentTime >= state['tmln'].getClipEndTime()) {
                                    videoPlr.currentTime = state['tmln'].getClipStartTime();

                                    // set the playback sliders
                                    setSeekSldr();
                                    setTmlnSldr();

                                    // set the video current time label
                                    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                                }
                            }
                            else {
                                if (flags['spkVolSldrDrag']) {
                                    data['stgs']['speakerVolume'] = Math.max(SPEAKER_VOLUME_MIN, Math.min(getPtrEventPct(pointer, boxes['spkVolSldrBox']), SPEAKER_VOLUME_MAX));

                                    // set the speaker volume slider
                                    setSpkVolSldr();
                                }
                                else {
                                    if (flags['micVolSldrDrag']) {
                                        data['stgs']['microphoneVolume'] = Math.max(MICROPHONE_VOLUME_MIN, Math.min(getPtrEventPct(pointer, boxes['micVolSldrBox']), MICROPHONE_VOLUME_MAX));

                                        // set the microphone volume slider
                                        setMicVolSldr();
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
        if (flags['tmlnSldrDrag'] === true || flags['seekSldrDrag'] === true) {
            flags['tmlnSldrDrag'] = false; 
            flags['seekSldrDrag'] = false;

            // hide the playback container if neither the video player or playback container are hovered
            if (!flags['videoPlrHover'] && !flags['plbkCtrHover']) {
                plbkCtr.classList.remove('active');
            }
            else {
                // if only the video player is hovered, reset the timeout
                if (flags['videoPlrHover']) {
                    // remove the old timeout
                    clearTimeout(state['plbkCtrTmo']);

                    // restart the timeout for hiding the playback container
                    state['plbkCtrTmo'] = setTimeout(() => {
                        // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
                        if (!videoPlr.paused && !flags['seekSldrDrag'] && !flags['volSldrDrag'] && !flags['plbkRateSldrDrag']) {
                            plbkCtr.classList.remove('active');
                        }
                    }, PLAYBACK_CONTAINER_TIMEOUT);
                }
            }

            // check if clipping is active
            if (clipBar.classList.contains('active')) {
                // reset the video, change the icon, and pause the video, depending on if the video is outside of the clip bounds
                if (videoPlr.currentTime < state['tmln'].getClipStartTime() || videoPlr.currentTime >= state['tmln'].getClipEndTime()) {
                    videoPlr.currentTime = state['tmln'].getClipStartTime();
        
                    // pause the video and change the icon
                    setVideoPlayerState('pause');
        
                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                }
                else {
                    // check if the video was not previously paused
                    if (!flags['prevPaused']) {
                        // play the video and change the icon
                        setVideoPlayerState('play');
                    }
                }
        
                // set the video current time label
                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
            }
            else {
                // check if the video is out of the timeline bounds, set it back the start
                if (videoPlr.currentTime < state['tmln'].getStartTime() || videoPlr.currentTime >= state['tmln'].getEndTime()) {
                    videoPlr.currentTime = state['tmln'].getStartTime();

                    // pause the video and change the icon
                    setVideoPlayerState('pause');

                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                }
                else {
                    // check if the video was not previously paused
                    if (!flags['prevPaused']) {
                        // play the video and change the icon
                        setVideoPlayerState('play');
                    }
                }

                // set the video current time label
                curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
            }
        }
        else {
            // if the volume or playback rate sliders are dragging
            if (flags['volSldrDrag'] || flags['plbkRateSldrDrag']) {
                flags['volSldrDrag'] = false;
                flags['plbkRateSldrDrag'] = false;

                // hide the playback container if neither the video player or playback container are hovered
                if (!flags['videoPlrHover'] && !flags['plbkCtrHover']) {
                    plbkCtr.classList.remove('active');
                }
                else {
                    // if only the video player is hovered, reset the timeout
                    if (flags['videoPlrHover']) {
                        // remove the old timeout
                        clearTimeout(state['plbkCtrTmo']);

                        // restart the timeout for hiding the playback container
                        state['plbkCtrTmo'] = setTimeout(() => {
                            // if the video is not paused and none of the video container sliders are dragging, then hide the playback container
                            if (!videoPlr.paused && !flags['seekSldrDrag'] && !flags['volSldrDrag'] && !flags['plbkRateSldrDrag']) {
                                plbkCtr.classList.remove('active');
                            }
                        }, PLAYBACK_CONTAINER_TIMEOUT);
                    }
                }

                if (!flags['volBarBtnHover'] && !flags['volSldrCtrHover'] && !flags['plbkCtrHover']) {
                    volSldr.classList.remove('active');
                }

                if (!flags['plbkRateBarBtnHover'] && !flags['plbkRateSldrCtrHover'] && !flags['plbkCtrHover']) {
                    plbkRateSldr.classList.remove('active');
                }
            }
            else {
                // set the clip left thumb dragging flag to false
                if (flags['clipLeftThumbDrag']) {
                    flags['clipLeftThumbDrag'] = false; 
                }
                else {
                    // set the clip right thumb dragging flag to false
                    if (flags['clipRightThumbDrag']) {
                        flags['clipRightThumbDrag'] = false; 
                    }
                    else {
                        // if the speaker volume slider is dragging, set the speaker volume setting
                        if (flags['spkVolSldrDrag']) {
                            flags['spkVolSldrDrag'] = false;

                            await atmpAsyncFunc(() => window.stgsAPI.setStg('speakerVolume', data['stgs']['speakerVolume']));

                        }
                        else {
                            // if the microphone volume slider is dragging, set the microphone volume setting
                            if (flags['micVolSldrDrag']) {
                                flags['micVolSldrDrag'] = false;

                                await atmpAsyncFunc(() => window.stgsAPI.setStg('microphoneVolume', data['stgs']['microphoneVolume']))
                            } 
                        }
                    }
                }
            }
        }
    });

    // on wheel, "zoom" in/out of the timeline
    tmlnSldr.addEventListener('wheel', (pointer) => {
        // prevent the scrolling of the container
        pointer.preventDefault();

        // the new start/end times, duration, and percentage
        let newStartTime, newEndTime, newDur, percentage;

        // check if the scroll is within the timeline slider
            if (pointer.clientX >= boxes['tmlnSldrBox'].left && pointer.clientX <= boxes['tmlnSldrBox'].right) {
            // get the click percentage on the timeline slider
            percentage = getPtrEventPct(pointer, boxes['tmlnSldrBox']);
            
            // check if the pointer scrolled up ("zoom in")
            if (pointer.deltaY < 0) {
                // check if the timeline is not at minimum zoom
                if (state['tmln'].getDuration() > TIMELINE_MIN_ZOOM) {
                    // calculate the new start/end times and duration
                    newStartTime = state['tmln'].getStartTime() + (TIMELINE_REDUCE_FACTOR * state['tmln'].getDuration() * percentage);
                    newEndTime = state['tmln'].getEndTime() - (TIMELINE_REDUCE_FACTOR * state['tmln'].getDuration() * (1 - percentage));
                    newDur = newEndTime - newStartTime;
                    
                    // check if the new duration is less than the minimum zoom, set it to the minimum
                    state['tmln'].updateTime(
                        getTruncDec((newDur < TIMELINE_MIN_ZOOM) ? newStartTime - (TIMELINE_MIN_ZOOM - newDur) * percentage : newStartTime, 6),
                        getTruncDec((newDur < TIMELINE_MIN_ZOOM) ? newStartTime - (TIMELINE_MIN_ZOOM - newDur) * percentage + TIMELINE_MIN_ZOOM : newEndTime, 6)
                    );
                    
                    // check if the video time is out of the timeline, put it back in bounds
                    if (videoPlr.currentTime < state['tmln'].getStartTime()) {
                        videoPlr.currentTime = state['tmln'].getStartTime();
                    } 
                    else {
                        if (videoPlr.currentTime > state['tmln'].getEndTime()) {
                            videoPlr.currentTime = state['tmln'].getEndTime();
                        }
                    }

                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                    setTmlnOvrl();

                    // check if clipping is active
                    if (clipBar.classList.contains('active')) {
                        // check if the clip start time is within the timeline start time
                        if (state['tmln'].getClipStartTime() < state['tmln'].getStartTime())
                        {
                            state['tmln'].updateClipStartTime(state['tmln'].getStartTime());

                            // make sure the clip end time is at minimum 5s after the clip start time
                            if (state['tmln'].getClipEndTime() < state['tmln'].getClipStartTime() + CLIP_MIN_LENGTH) {
                                state['tmln'].updateClipEndTime(state['tmln'].getClipStartTime() + CLIP_MIN_LENGTH);
                            }
                        }

                        // check if the clip end time is within the timeline end time
                        if (state['tmln'].getClipEndTime() >= state['tmln'].getEndTime()) {
                            state['tmln'].updateClipEndTime(state['tmln'].getEndTime());

                            // make sure the clip start time is at minimum 5s before the clip end time
                            if (state['tmln'].getClipStartTime() > state['tmln'].getClipEndTime() - CLIP_MIN_LENGTH) {
                                state['tmln'].updateClipStartTime(state['tmln'].getClipEndTime() - CLIP_MIN_LENGTH);
                            }
                        }
                    }

                    // set the clip thumbs
                    setClipLeftThumb((state['tmln'].getClipStartTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
                    setClipRightThumb((state['tmln'].getClipEndTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                    // set the video current time label
                    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                }
            } 
            else {
                // check if the tmln is not at maximum zoom
                if (state['tmln'].getDuration() < videoPlr.duration) {
                    // calculate the new start and end times
                    newStartTime = state['tmln'].getStartTime() - (TIMELINE_GROW_FACTOR * state['tmln'].getDuration() * percentage);
                    newEndTime = state['tmln'].getEndTime() + (TIMELINE_GROW_FACTOR * state['tmln'].getDuration() * (1 - percentage));
                    
                    // check if "zoom out" would bring the timeline out of bounds
                    if (newStartTime < 0) {
                        // reallocate grow factor to the end time if needed
                        state['tmln'].updateTime(
                            0, 
                            getTruncDec(Math.min(videoPlr.duration, Math.abs(newStartTime) + newEndTime), 6)
                        );
                    } 
                    else {
                        // reallocate grow factor to the start time if needed
                        state['tmln'].updateTime(
                            getTruncDec(newEndTime > videoPlr.duration ? Math.max(0, newStartTime - (newEndTime - videoPlr.duration)) : newStartTime, 6),
                            getTruncDec(Math.min(videoPlr.duration, newEndTime), 6)
                        );
                    }
                             
                    // check if the video time is out of the timeline, put it back in bounds
                    if (videoPlr.currentTime < state['tmln'].getStartTime()) {
                        videoPlr.currentTime = state['tmln'].getStartTime();
                    } 
                    else {
                        if (videoPlr.currentTime > state['tmln'].getEndTime()) {
                            videoPlr.currentTime = state['tmln'].getEndTime();
                        }
                    }

                    // set the playback sliders
                    setSeekSldr();
                    setTmlnSldr();
                    setTmlnOvrl();

                    // check if clipping is active
                    if (clipBar.classList.contains('active')) {
                        // check if the clip start time is within the timeline start time
                        if (state['tmln'].getClipStartTime() < state['tmln'].getStartTime())
                        {
                            state['tmln'].updateClipStartTime(state['tmln'].getStartTime());

                            // make sure the clip end time is at minimum 5s after the clip start time
                            if (state['tmln'].getClipEndTime() < state['tmln'].getClipStartTime() + 5) {
                                state['tmln'].updateClipEndTime(state['tmln'].getClipStartTime() + 5);
                            }
                        }

                        // check if the clip end time is within the timeline end time
                        if (state['tmln'].getClipEndTime() >= state['tmln'].getEndTime()) {
                            state['tmln'].updateClipEndTime(state['tmln'].getEndTime());

                            // make sure the clip start time is at minimum 5s before the clip end time
                            if (state['tmln'].getClipStartTime() > state['tmln'].getClipEndTime() - 5) {
                                state['tmln'].updateClipStartTime(state['tmln'].getClipEndTime() - 5);
                            }
                        }
                    }

                    // set the clip thumbs
                    setClipLeftThumb((state['tmln'].getClipStartTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
                    setClipRightThumb((state['tmln'].getClipEndTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);

                    // set the video current time label
                    curVideoTimeLabel.textContent = getRdblDur(videoPlr.currentTime);
                }
            }
        }
    });

    // on mousedown, set the timeline slider dragging / previously paused flags, and the current time
    tmlnSldr.addEventListener('mousedown', (pointer) => { 
        // get the time based on click location on the timeline slider
        videoPlr.currentTime = state['tmln'].getDuration() * getPtrEventPct(pointer, boxes['tmlnSldrBox']) + state['tmln'].getStartTime();

        // set the playback sliders
        setSeekSldr();
        setTmlnSldr();

        flags['tmlnSldrDrag'] = true; 
        flags['prevPaused'] = videoPlr.paused;
    });

    // on mousedown, set the clip left thumb drag and previously paused flags
    clipLeftThumb.addEventListener('mousedown', (event) => {
        // prevent mousedown event on timeline slider from firing
        event.stopPropagation();

        flags['clipLeftThumbDrag'] = true; 
    });

    // on mousedown, set the clip left thumb drag and previously paused flags
    clipRightThumb.addEventListener('mousedown', (event) => {
        // prevent mousedown event on tmln sldr from firing
        event.stopPropagation();

        flags['clipRightThumbDrag'] = true; 
    });
}

/**
 * Initializes the clip container event listeners
 */
function initClipCtrEL() {
    // on click, preview the clip
    viewBarBtn.addEventListener('click', () => {
        // set the video time to the clip start time
        videoPlr.currentTime = state['tmln'].getClipStartTime();

        // play the video and change the icon
        setVideoPlayerState('play');
    });

    // on click, create the clip and reload the clip gallery
    crtBarBtn.addEventListener('click', async () => {
        await atmpAsyncFunc(() => window.clipAPI.createClip(videoPlr.getAttribute('src'), state['tmln'].getClipStartTime(), state['tmln'].getClipEndTime()));

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
            if (state['tmln'].getClipLength() < state['tmln'].getDuration()) {
                newClipStartTime = videoPlr.currentTime - state['tmln'].getClipLength() / 2;
                newClipEndTime = videoPlr.currentTime + state['tmln'].getClipLength() / 2;
    
                state['tmln'].updateClipStartTime(getTruncDec(newClipStartTime < state['tmln'].getStartTime() ? state['tmln'].getStartTime() : (newClipEndTime > state['tmln'].getEndTime() ? state['tmln'].getEndTime() - state['tmln'].getClipLength() : newClipStartTime), 6));
                state['tmln'].updateClipEndTime(getTruncDec(newClipStartTime < state['tmln'].getStartTime() ? state['tmln'].getStartTime() + state['tmln'].getClipLength() : (newClipEndTime > state['tmln'].getEndTime() ? state['tmln'].getEndTime() : newClipEndTime), 6));
            }
            else {
                state['tmln'].updateClipStartTime(state['tmln'].getStartTime());
                state['tmln'].updateClipEndTime(state['tmln'].getEndTime());
            }
    
            // set the clip thumbs
            setClipLeftThumb((state['tmln'].getClipStartTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
            setClipRightThumb((state['tmln'].getClipEndTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
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
    setSeekThumb(videoPlr.currentTime / videoPlr.duration * boxes['seekSldrBox'].width);
    setSeekOvrl(videoPlr.currentTime / videoPlr.duration * 100);
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
function setSeekOvrl(thumbLocation) {
    seekOvrl.style.background = `linear-gradient(to right, var(--soverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
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
function updateSeekSldr() {
    // get the new seek slider bounding box
    boxes['seekSldrBox'] = seekSldr.getBoundingClientRect();

    // if the video is loaded, set the seek slider
    if (flags['videoLoaded']) {
        setSeekSldr();
    }
}

/**
 * Sets the volume slider thumb and overlay
 */
function setVolSldr() { 
    // if the video is muted, move the slider to the left and set the muted icon
    if (videoPlr.muted) {
        setIcon(volBarIcon, 'volume-off-solid');

        setVolThumb(0);
        setVolOvrl(0);
    }
    else {
        // else, set the correct volume icon
        if (videoPlr.volume > 0.6) {
            setIcon(volBarIcon, 'volume-up-solid');
        }
        else {
            if (videoPlr.volume > 0.1) {
                setIcon(volBarIcon, 'volume-down-solid');
            }
            else {
                setIcon(volBarIcon, 'volume-mute-solid');
            }
        }

        // set the volume thumb and overlay (trailing bar)
        setVolThumb(videoPlr.volume * volSldrWidth);
        setVolOvrl(videoPlr.volume * 100);
    }
}

/**
 * Sets the volume slider overlay
 * 
 * @param {number} thumbLocation - The location of the vol thumb
 */
function setVolOvrl(thumbLocation) {
    volOvrl.style.background = `linear-gradient(to right, var(--vooverlay-lgradientcolor) ${thumbLocation}%, transparent ${thumbLocation}%`;
}

/**
 * Sets the volume slider thumb
 * 
 * @param {number} thumbLocation - The location of the vol thumb
 */
function setVolThumb(thumbLocation) {
    volThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the volume slider
 */
function updateVolSldr() {
    flags['updateVolSldr'] = true;
}

/**
 * Sets the playback rate slider text and thumb
 */
function setPlbkRateSldr() {
    plbkRateValueLabel.textContent = videoPlr.playbackRate;
    setPlbkRateThumb(plbkRateSldrWidth / 6 * (PLAYBACK_RATE_MAPPING[videoPlr.playbackRate] + 2));
}

/**
 * Sets the playback rate slider thumb
 * 
 * @param {number} thumbLocation - The location of the playback rate thumb
 */
function setPlbkRateThumb(thumbLocation) {
    plbkRateThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the playback rate slider
 */
function updatePlbkRateSldr() {
    flags['updatePlbkRateSldr'] = true;
}

/**
 * Sets the timeline slider thumb
 */
function setTmlnSldr() {
    setTmlnThumb(Math.max(0, Math.min((videoPlr.currentTime - state['tmln'].getStartTime()) / state['tmln'].getDuration(), 1) * boxes['tmlnSldrBox'].width));
}

/**
 * Sets the timeline overlay
 */
function setTmlnOvrl() {
    // the tick line clone, tick text clone, tick location, and tick percentage
    let tickLineClone, tickTextClone, tickLocation, tickPercentage;

    // get the location of the first tick in seconds and the number of ticks based on the duration
    const firstTick = Math.ceil(state['tmln'].getStartTime() / state['tmln'].getSubInterval()) * state['tmln'].getSubInterval();
    const numTicks = ((Math.floor(state['tmln'].getEndTime() / state['tmln'].getSubInterval()) * state['tmln'].getSubInterval()) - firstTick) / state['tmln'].getSubInterval() + 1;

    // get the tick line template and the tick text template
    const tickLineTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    const tickTextTemplate = document.createElementNS('http://www.w3.org/2000/svg', 'text');

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
        tickLocation = firstTick + (i * state['tmln'].getSubInterval());
        // get the percentage location of the tick within the timeline overlay
        tickPercentage = (tickLocation - state['tmln'].getStartTime()) / state['tmln'].getDuration();

        // get the tick line clone
        tickLineClone = tickLineTemplate.cloneNode(true);

        // set the tick line horizontal location
        tickLineClone.setAttribute('x1', tickPercentage * boxes['tmlnSldrBox'].width);
        tickLineClone.setAttribute('x2', tickPercentage * boxes['tmlnSldrBox'].width);

        // check if the tick is an interval (larger) tick
        if (tickLocation % state['tmln'].getInterval() === 0) {
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
 * @param {number} thumbLocation - The location of the tmln thumb
 */
function setTmlnThumb(thumbLocation) {
    tmlnThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Updates the timeline slider
 */
function updateTmlnSldr() {
    // get the new timeline slider bounding box
    boxes['tmlnSldrBox'] = tmlnSldr.getBoundingClientRect();

    // set the timeline marker viewbox
    tmlnOvrl.setAttribute('viewbox', `0 0 ${boxes['tmlnSldrBox'].width} 60`);

    // if the video is loaded, set the new timeline overlay and thumb position
    if (flags['videoLoaded']) {
        setTmlnOvrl();
        setTmlnSldr();

        // check if clipping is active
        if (clipBar.classList.contains('active')) {
            // set the clip thumbs
            setClipLeftThumb((state['tmln'].getClipStartTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
            setClipRightThumb((state['tmln'].getClipEndTime() - state['tmln'].getStartTime()) / state['tmln'].getDuration() * boxes['tmlnSldrBox'].width);
        }
    }
}

/**
 * Sets the left clip thumb
 * 
 * @param {number} thumbLocation - The location of the left clip thumb
 */
function setClipLeftThumb(thumbLocation) {
    clipLeftThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Sets the right clip thumb
 * 
 * @param {number} thumbLocation - The location of the right clip thumb
 */
function setClipRightThumb(thumbLocation) {
    clipRightThumb.style.transform = `translateX(${thumbLocation}px)`;
}

/**
 * Syncs the seek and tmln thumbs to the video frame
 */
function syncSeekTmlnSldrs() {
    // set the playback sliders
    setSeekSldr();
    setTmlnSldr();

    // request the next animation frame if the video is playing
    if (!videoPlr.paused && !videoPlr.ended) {
        state['animID'] = requestAnimationFrame(syncSeekTmlnSldrs);
    }
}