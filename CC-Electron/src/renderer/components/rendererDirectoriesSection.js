/**
 * Module for initializing the directories section for the renderer process
 * 
 * @module rendererDirectoriesSection
 * @requires rendererVariables
 * @requires rendererGeneral
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, TIME_PAD, DECIMAL_TRUNC, 
    NAVIGATION_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, VIDEO_PREVIEW_AGE_LABEL_DELAY, 
    PLAYBACK_CONTAINER_GROW, PLAYBACK_CONTAINER_REDUCE, PLAYBACK_CONTAINER_TIMEOUT, 
    VIDEO_VOLUME_MIN, VIDEO_VOLUME_MAX, VIDEO_VOLUME_GROW, VIDEO_VOLUME_REDUCE, VIDEO_VOLUME_MUTED, 
    PLAYBACK_RATE_MIN, PLAYBACK_RATE_MAX, PLAYBACK_RATE_GROW, PLAYBACK_RATE_REDUCE, PLAYBACK_RATE_DEF, PLAYBACK_RATE_SEGMENTS, PLAYBACK_RATE_MAPPING, PLAYBACK_RATE_MAPPING_OFFSET, 
    TIMELINE_ZOOM_MIN, TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_OVERLAY_SUB_TICK_LINE_TOP, TIMELINE_OVERLAY_SUB_TICK_LINE_BOTTOM, 
    TIMELINE_OVERLAY_TICK_LINE_TOP, TIMELINE_OVERLAY_TICK_LINE_BOTTOM, TIMELINE_OVERLAY_TICK_TEXT_TOP, TIMELINE_OVERLAY_TICK_TEXT_OFFSET, CLIP_LENGTH_MIN, 
    SPEAKER_VOLUME_MIN, SPEAKER_VOLUME_MAX, SPEAKER_VOLUME_GROW, SPEAKER_VOLUME_REDUCE, 
    MICROPHONE_VOLUME_GROW, MICROPHONE_VOLUME_REDUCE, MICROPHONE_VOLUME_MIN, MICROPHONE_VOLUME_MAX, 
    MSECONDS_IN_SECOND, SECONDS_IN_MINUTE, SECONDS_IN_HOUR, SECONDS_IN_DAY, 
    ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, 
    html, 
    initOvrl, initStatLabel, 
    titleBar, minBarBtn, maxBarBtn, closeBarBtn, 
    navBar, dirsBarBtn, stgsBarBtn, curRecLabelCtr, curRecTimeLabel, curRecGameLabel, recBarBtn, autoRecResLabel, 
    navTglBtn, navTglIcon, 
    contStatLabel, dirsSect, editSect, stgsSect, 
    capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, capsGameFltFld, capsMetaFltFld, capsBarBtn, capsBarIcon, 
    clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, clipsGameFltFld, clipsMetaFltFld, clipsBarBtn, clipsBarIcon, 
    videoPrvwCtrTmpl, videoPrvwCtrWidth, capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn, 
    editGameLabel, videoCtr, videoPlr, playPauseStatIcon, 
    plbkCtr, seekSldr, seekTrack, seekOvrl, seekThumb, 
    mediaBar, playPauseBarBtn, playPauseBarIcon, 
    videoVolBarBtn, videoVolBarIcon, videoVolSldrCtr, videoVolSldr, videoVolSldrWidth, videoVolOvrl, videoVolThumb, 
    curVideoTimeLabel, curVideoDurLabel, 
    plbkRateSldrCtr, plbkRateSldr, plbkRateSldrWidth, plbkRateThumb, plbkRateBarBtn, plbkRateValueLabel, 
    fscBarBtn, fscBarIcon, 
    tmlnSldr, tmlnOvrl, tmlnThumb, clipLeftThumb, clipRightThumb, 
    clipBar, viewBarBtn, createBarBtn, clipTglBtn, clipTglIcon, 
    mostTglSwtes, darkModeTglFld, darkModeTglIcon, 
    mostFlds, capsDirFld, capsLimitFld, capsDispFld, progsBoard, genStgTileTmpl, progsAddBtn, clipsDirFld, clipsLimitFld, clipsFrmFlds, clipsWidthFlds, clipsHeightFlds, 
    spkFld, spkVolSldrCtr, spkVolSldr, spkVolOvrl, spkVolThumb, micFld, micVolSldrCtr, micVolSldr, micVolOvrl, micVolThumb, 
    boxes, data, flags, states, 
    initRendVars 
} from './rendererVariables.js';
import { initRendGen, setInitStatLabel, setContStatLabel, getModBox, setActiveSect, setIcon, getParsedTime, getRdblAge, getRdblDur, getRdblRecDur, getPtrEventLoc, getPtrEventPct, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';

/**
 * @exports initRendDirsSect, loadGall, updateGall
 */
export { initRendDirsSect, loadGall, updateGall }

/**
 * Initializes the directories section
 */
async function initRendDirsSect() {
    initContCtr3EL(true);  // boolean1 isCaps
    initContCtr3EL(false);  // boolean1 isCaps

    initContCtr3(true);  // boolean1 isCaps
    initContCtr3(false);  // boolean1 isCaps

    initDirGallEL(true);  // boolean1 isCaps
    initDirGallEL(false);  // boolean1 isCaps

    await atmpAsyncFunc(() => loadGall(true, true));  // boolean1 isCaps, boolean2 isInit
    await atmpAsyncFunc(() => loadGall(false, true));  // boolean1 isCaps, boolean2 isInit
}

/**
 * Initializes the content container 3 event listeners for the directories section
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function initContCtr3EL(isCaps) {
    // get the captures or clips variables
    const nameLabel = isCaps ? capsNameLabel : clipsNameLabel;
    const gameFltFld = isCaps ? capsGameFltFld : clipsGameFltFld;
    const metaFltFld = isCaps ? capsMetaFltFld : clipsMetaFltFld;
    const barBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const barIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // on click, open the appropriate directory
    nameLabel.addEventListener('click', () => window['stgsAPI'].openDir(isCaps));

    // on change, set the game filter setting, then remove and re-insert the video preview containers in the new order
    gameFltFld.addEventListener('change', async () => {
        gameFltFld.value = data['stgs'][gameFltFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(gameFltFld.name, gameFltFld.value));
    
        delAllVideoPrvwCtrs(isCaps);
        insertVideoPrvwCtrs(isCaps);
    });

    // on change, set the meta filter setting, then remove and re-insert the video preview containers in the new order
    metaFltFld.addEventListener('change', async () => {
        metaFltFld.value = data['stgs'][metaFltFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(metaFltFld.name, metaFltFld.value));
    
        delAllVideoPrvwCtrs(isCaps);
        insertVideoPrvwCtrs(isCaps);
    });

    // on click, change the sort order
    barBtn.addEventListener('click', async () => {
        barBtn.classList.toggle('active');

        // change the icon, save the order setting, then remove and re-insert the video preview containers
        if (barBtn.classList.contains('active')) {
            setIcon(barIcon, 'arrow-upward-alt');
            data['stgs'][ascStr] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(ascStr, true));

            delAllVideoPrvwCtrs(isCaps);
            insertVideoPrvwCtrs(isCaps);
        }
        else {
            setIcon(barIcon, 'arrow-downward-alt');
            data['stgs'][ascStr] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(ascStr, false));

            delAllVideoPrvwCtrs(isCaps);
            insertVideoPrvwCtrs(isCaps);
        }
    });
}

/**
 * Initializes the content container 3 for the directories section
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function initContCtr3(isCaps) {
    // get the captures or clips variables
    const dirLabel2 = isCaps ? capsDirLabel2 : clipsDirLabel2;
    const metaFltFld = isCaps ? capsMetaFltFld : clipsMetaFltFld;
    const barBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const barIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const dirStr = isCaps ? 'capturesDirectory' : 'clipsDirectory';
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // set the directory label and filter values
    dirLabel2.textContent = data['stgs'][dirStr];
    metaFltFld.value = data['stgs'][metaFltFld.name]; // game filter is done after gallery is loaded

    // toggle the sort order and change the icon, depending on setting
    if (data['stgs'][ascStr] === true) {
        barBtn.classList.add('active');
        setIcon(barIcon, 'arrow-upward-alt');
    }
}

/**
 * Initializes the directory gallery event listeners
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function initDirGallEL(isCaps) {
    // get the captures or clips variables
    const leftBtn = isCaps ? capsLeftBtn : clipsLeftBtn;
    const gall = isCaps ? capsGall : clipsGall;
    const rightBtn = isCaps ? capsRightBtn : clipsRightBtn;
    const gallBoxStr = isCaps ? 'capsGallBox' : 'clipsGallBox';

    // on click, scroll the gallery left by approximately its width
    leftBtn.addEventListener('click', () => gall.scrollBy({ 'left': -boxes[gallBoxStr]['width'] }));

    // on scroll, scroll the gallery by increments of the video preview
    gall.addEventListener('wheel', (ptr) => {
        // prevent scrolling vertically on section container 1
        ptr.preventDefault();

        // scroll the gallery by approximately the video preview width
        gall.scrollBy({ 'left': ptr['deltaY'] < 0 ? -videoPrvwCtrWidth : videoPrvwCtrWidth }); 
    });

    // on scroll, toggle the gallery buttons
    gall.addEventListener('scroll', () => togDirBtn(isCaps));

    // on click, scroll the gallery right by approximately its width
    rightBtn.addEventListener('click', () => gall.scrollBy({ 'left': boxes[gallBoxStr]['width'] }));
}

/**
 * Loads the directory gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 * @param {boolean} isInit - If the function is run during initialization
 */
async function loadGall(isCaps, isInit) {
    // get the captures or clips variables
    const usageLabel3 = isCaps ? capsUsageLabel3 : clipsUsageLabel3;
    const statLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const dataStr = isCaps ? 'caps' : 'clips';

    // indicate that the gallery is loading
    statLabel.textContent = 'Loading...';
    statLabel.classList.add('active');

    delAllVideoPrvwCtrs(isCaps);

    // get the size of the directory
    usageLabel3.textContent = `${Math.ceil(await atmpAsyncFunc(() => window['stgsAPI'].getDirSize(isCaps)) / BYTES_IN_GIGABYTE)} GB`;

    // get the video data
    data[dataStr] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDirData(isCaps), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, isInit);

    // console.log(data[dataStr]);
    // console.log(data['stgs']);

    // update the game filter field based on the games in the gallery
    await atmpAsyncFunc(() => updateGameFltFld(isCaps));

    // insert the video preview containers  into the gallery
    insertVideoPrvwCtrs(isCaps);
}

/**
 * Updates the gallery size
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function updateGall(isCaps) {
    // get the captures or clips variables
    const gall = isCaps ? capsGall : clipsGall;
    const gallBoxStr = isCaps ? 'capsGallBox' : 'clipsGallBox';
    let numVideoPrvw;

    // get the new gallery bounding box
    boxes[gallBoxStr] = getModBox(gall.getBoundingClientRect());

    // calculate and set the gap between the video previews based on the width of the gallery
    numVideoPrvw= Math.floor(boxes[gallBoxStr]['width'] / (videoPrvwCtrWidth + GALLERY_MIN_GAP));

    gall.style.gap = `${(boxes[gallBoxStr]['width'] - (numVideoPrvw* videoPrvwCtrWidth)) / (numVideoPrvw- 1)}px`;
}

/**
 * Deletes all video preview containers from a gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function delAllVideoPrvwCtrs(isCaps) {
    // get the captures or clips variables
    const gall = isCaps ? capsGall : clipsGall;
    const intvsStr = isCaps ? 'capsIntvs' : 'clipsIntvs';

    // remove every existing video preview from the gallery and delete their age update intervals
    while (gall.children.length > 1) {
        clearInterval(states[intvsStr][gall.children.length - 2]);
        gall.removeChild(gall.lastElementChild);        
    }
}

/**
 * Inserts video preview containers into a gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function insertVideoPrvwCtrs(isCaps) {
    // get the captures or clips variables
    const gall = isCaps ? capsGall : clipsGall;
    const statLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const dataStr = isCaps ? 'caps' : 'clips';
    const gameFltStr = isCaps ? 'capturesGameFilter' : 'clipsGameFilter';
    const metaFltStr = isCaps ? 'capturesMetaFilter' : 'clipsMetaFilter';
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';
    const intvsStr = isCaps ? 'capsIntvs' : 'clipsIntvs';
    let curDate = new Date();

    // sort the video data depending on the meta data filter
    switch (data['stgs'][metaFltStr]) {
        case 'Name':
            data['stgs'][ascStr] ? data[dataStr].sort((a, b) => a['extName'].localeCompare(b['extName'])) : data[dataStr].sort((a, b) => b['extName'].localeCompare(a['extName']));

            break;

        case 'Date':
            data['stgs'][ascStr] ? data[dataStr].sort((a, b) => a['date'] - b['date']) : data[dataStr].sort((a, b) => b['date'] - a['date']);

            break;

        case 'Size':
            data['stgs'][ascStr] ? data[dataStr].sort((a, b) => a['size'] - b['size']) : data[dataStr].sort((a, b) => b['size'] - a['size']);

            break;

        case 'Duration':
            data['stgs'][ascStr] ? data[dataStr].sort((a, b) => a['dur'] - b['dur']) : data[dataStr].sort((a, b) => b['dur'] - a['dur']);

            break;
    }

    // indicate that no videos are found, or hide the label
    if (data[dataStr]['length'] === 0) {
        statLabel.textContent = 'No Videos Found';
    }
    else {
        statLabel.classList.remove('active');

        // for (const [index, videoData] of data[dataStr]) {
        for (const [index, videoData] of data[dataStr].entries()) {
            // insert video preview depending on the game filter
            if (data['stgs'][gameFltStr] === 'All' || videoData['game'] === data['stgs'][gameFltStr]) {
                // get a clone of the video preview container template
                const videoPrvwCtrClone = videoPrvwCtrTmpl.content.cloneNode(true);
                const videoPrvwCtr = videoPrvwCtrClone.querySelector('.video-preview-ctr');
                const videoPrvwAgeLabel = videoPrvwCtrClone.querySelector('.video-preview-age-label')

                // set the video source
                videoPrvwCtr.dataset.src = videoData['path'];
                // set the video thumbnail source
                videoPrvwCtrClone.querySelector('.video-thumbnail-image').setAttribute('src', videoData['tbnlPath']);
                // set the video duration
                videoPrvwCtrClone.querySelector('.video-thumbnail-duration-label').textContent = getRdblDur(videoData['dur']);
                // set the video game
                videoPrvwCtrClone.querySelector('.video-preview-game-label').textContent = `${videoData['game']}`;
                // set the video age
                videoPrvwAgeLabel.textContent = `${getRdblAge((curDate - videoData['date']) / MSECONDS_IN_SECOND)}`;
                // set the video name with the extension
                videoPrvwCtrClone.querySelector('.video-preview-name-label').textContent = videoData['extName'];

                // set the interval for updating the age periodically
                states[intvsStr][index] = setInterval(() => {
                    // get the new date
                    curDate = new Date();

                    // set the video age
                    videoPrvwAgeLabel.textContent = `${getRdblAge((curDate - videoData['date']) / MSECONDS_IN_SECOND)}`;
                }, VIDEO_PREVIEW_AGE_LABEL_DELAY);

                // on click, open the video in the editor section
                videoPrvwCtr.addEventListener('click', () => {
                    // set the video frame length (to go frame by frame)
                    states['videoFrameLen'] = getTruncDec(1 / videoData['fps']);

                    // set the video player source
                    videoPlr.setAttribute('src', videoData['path']);

                    // set the editor game label
                    editGameLabel.textContent = `${videoData['game']}`;

                    // change the active content section to the editor section
                    setActiveSect('editor');
                });

                // on click, ...
                videoPrvwCtrClone.querySelector('.video-preview-rename-btn').addEventListener('click', () => {
                });

                // on click, ...
                videoPrvwCtrClone.querySelector('.video-preview-delete-btn').addEventListener('click', () => {
                });

                // append the video preview to the gallery
                gall.appendChild(videoPrvwCtrClone);
            }
        }
    }

    // on scroll, toggle the caps gallery buttons
    togDirBtn(isCaps);
}

/**
 * Updates the game filter field with the games present in the gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function updateGameFltFld(isCaps) {
    // get the captures or clips variables
    const gameFltFld = isCaps ? capsGameFltFld : clipsGameFltFld;
    const dataStr = isCaps ? 'caps' : 'clips';
    // get the unique set of games in the gallery
    const uniqGames = [...new Set(data[dataStr].map(videoData => videoData['game']))];
    // boolean if the game filter setting needs to be updated, if the old game filter doesn't exist
    let doUpdate = true;

    // iterate through each game
    for (const game of uniqGames) {
        // create a new setting field option
        const fldOption = document.createElement('option');

        // assign the name of the game to the value and text
        fldOption.value = game;
        fldOption.text = game;

        // append the child to the game filter setting field
        gameFltFld.appendChild(fldOption);

        // if the game filter's game is present, do not update
        if (data['stgs'][gameFltFld.name] === game) {
            doUpdate = false;
        }
    }

    // check if the filter is not 'all' (no game named 'all') and if an update is needed
    if (data['stgs'][gameFltFld.name] !== 'All' && doUpdate) {
        gameFltFld.value = data['stgs'][gameFltFld.name] = await atmpAsyncFunc(() => window['stgsAPI'].setStg(gameFltFld.name, 'All'));
    }
    // else, set the value of the game filter field
    else {
        gameFltFld.value = data['stgs'][gameFltFld.name];
    }
}

/**
 * Toggles the directory button on or off based on available scroll width
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function togDirBtn(isCaps) {
    // get the captures or clips variables
    const leftBtn = isCaps ? capsLeftBtn : clipsLeftBtn;
    const gall = isCaps ? capsGall : clipsGall;
    const rightBtn = isCaps ? capsRightBtn : clipsRightBtn;
    const gallBoxStr = isCaps ? 'capsGallBox' : 'clipsGallBox';

    // if there is more to scroll left, enable the left button
    gall.scrollLeft > 0 ? leftBtn.classList.add('active') : leftBtn.classList.remove('active');
    
    // if there is more to scroll right, enable the right button
    gall.scrollLeft < (gall.scrollWidth - Math.ceil(boxes[gallBoxStr]['width'])) ? rightBtn.classList.add('active') : rightBtn.classList.remove('active');
}