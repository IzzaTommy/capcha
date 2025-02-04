/**
 * Module for initializing the directories section for the renderer process
 * 
 * @module rendererDirectoriesSection
 * @requires rendererVariables
 * @requires rendererGeneral
 */
import {
    CONTENT_STATUS_LABEL_TIMEOUT, NAV_BAR_TIMEOUT, BYTES_IN_GIGABYTE, GALLERY_MIN_GAP, PLAYBACK_RATE_MAPPING, 
    TIMELINE_GROW_FACTOR, TIMELINE_REDUCE_FACTOR, TIMELINE_MIN_ZOOM, 
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

    await atmpAsyncFunc(() => loadGall(true, true));  // boolean1 isCaps, boolean2 init
    await atmpAsyncFunc(() => loadGall(false, true));  // boolean1 isCaps, boolean2 init
}

/**
 * Initializes the content container 3 event listeners for the directories section
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function initContCtr3EL(isCaps) {
    // get the captures or clips variables
    const nameLabel = isCaps ? capsNameLabel : clipsNameLabel;
    const gameFltDirStgFld = isCaps ? capsGameFltDirStgFld : clipsGameFltDirStgFld;
    const metaFltDirStgFld = isCaps ? capsMetaFltDirStgFld : clipsMetaFltDirStgFld;
    const barBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const barIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // on click, open the appropriate directory
    nameLabel.addEventListener('click', () => {
        window.windowAPI.openDir(isCaps);
    });

    // on change, set the game filter setting and re-insert the video previews in the new order
    gameFltDirStgFld.addEventListener('change', async () => {
        gameFltDirStgFld.value = data['stgs'][gameFltDirStgFld.name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(gameFltDirStgFld.name, gameFltDirStgFld.value));
    
        removeAllVideoPrvw(isCaps);
        insertVideoPrvw(isCaps);
    });

    // on change, set the meta filter setting and re-insert the video previews in the new order
    metaFltDirStgFld.addEventListener('change', async () => {
        metaFltDirStgFld.value = data['stgs'][metaFltDirStgFld.name] = await atmpAsyncFunc(() => window.stgsAPI.setStg(metaFltDirStgFld.name, metaFltDirStgFld.value));
    
        removeAllVideoPrvw(isCaps);
        insertVideoPrvw(isCaps);
    });

    // on click, change the sort order
    barBtn.addEventListener('click', async () => {
        barBtn.classList.toggle('active');

        // change the icon, save the order setting, and re-insert the video previews
        if (barBtn.classList.contains('active')) {
            setIcon(barIcon, 'arrow-upward-alt');
            data['stgs'][ascStr] = await atmpAsyncFunc(() => window.stgsAPI.setStg(ascStr, true));

            removeAllVideoPrvw(isCaps);
            insertVideoPrvw(isCaps);
        }
        else {
            setIcon(barIcon, 'arrow-downward-alt');
            data['stgs'][ascStr] = await atmpAsyncFunc(() => window.stgsAPI.setStg(ascStr, false));

            removeAllVideoPrvw(isCaps);
            insertVideoPrvw(isCaps);
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
    const gameFltDirStgFld = isCaps ? capsGameFltDirStgFld : clipsGameFltDirStgFld;
    const metaFltDirStgFld = isCaps ? capsMetaFltDirStgFld : clipsMetaFltDirStgFld;
    const barBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const barIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const dirStr = isCaps ? 'capturesDirectory' : 'clipsDirectory';
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // set the directory label and filter values
    dirLabel2.textContent = data['stgs'][dirStr];
    gameFltDirStgFld.value = data['stgs'][gameFltDirStgFld.name];
    metaFltDirStgFld.value = data['stgs'][metaFltDirStgFld.name];

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
    leftBtn.addEventListener('click', () => {
        gall.scrollBy({left: -boxes[gallBoxStr].width, behavior: 'smooth'});
    });

    // on scroll, scroll the gallery by increments of the video preview
    gall.addEventListener('wheel', (pointer) => {
        // prevent scrolling vertically on section container 1
        pointer.preventDefault();

        // scroll the gallery by approximately the video preview width
        if (pointer.deltaY < 0) {
            gall.scrollBy({left: -videoPrvwCtrWidth});
        }
        else {
            gall.scrollBy({left: videoPrvwCtrWidth});
        }
    });

    // on scroll, toggle the gallery buttons
    gall.addEventListener('scroll', () => {
        togDirBtn(isCaps);
    });

    // on click, scroll the gallery right by approximately its width
    rightBtn.addEventListener('click', () => {
        gall.scrollBy({left: boxes[gallBoxStr].width, behavior: 'smooth'});
    });
}

/**
 * Loads the directory gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 * @param {boolean} init - If the function is run during initialization
 */
async function loadGall(isCaps, init) {
    // get the captures or clips variables
    const usageLabel3 = isCaps ? capsUsageLabel3 : clipsUsageLabel3;
    const statLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const dataStr = isCaps ? 'caps' : 'clips';

    // indicate that the gallery is loading
    statLabel.textContent = 'Loading...';
    statLabel.classList.add('active');

    removeAllVideoPrvw(isCaps);

    // get the size of the directory
    usageLabel3.textContent = `${Math.ceil(await atmpAsyncFunc(() => window.filesAPI.getDirSize(isCaps)) / BYTES_IN_GIGABYTE)} GB`;

    // get the video data
    data[dataStr] = await atmpAsyncFunc(() => window.filesAPI.getAllDirData(isCaps), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, init);

    // insert the video previews into the gallery
    insertVideoPrvw(isCaps);
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
    let numvideoPrvw;

    // get the new gallery bounding box
    boxes[gallBoxStr] = gall.getBoundingClientRect();

    // calculate and set the gap between the video previews based on the width of the gallery
    numvideoPrvw = Math.floor(boxes[gallBoxStr].width / (videoPrvwCtrWidth + GALLERY_MIN_GAP));

    gall.style.gap = `${(boxes[gallBoxStr].width - (numvideoPrvw * videoPrvwCtrWidth)) / (numvideoPrvw - 1)}px`;
}

/**
 * Removes all video previews from a gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function removeAllVideoPrvw(isCaps) {
    const gall = isCaps ? capsGall : clipsGall;

    // remove every existing video preview from the gallery
    while (gall.children.length > 1)
    {
        gall.removeChild(gall.lastElementChild);
    }
}

/**
 * Inserts video previews into a gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function insertVideoPrvw(isCaps) {
    // get the captures or clips variables
    const gall = isCaps ? capsGall : clipsGall;
    const statLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const dataStr = isCaps ? 'caps' : 'clips';
    const gameFltStr = isCaps ? 'capturesGameFilter' : 'clipsGameFilter';
    const metaFltStr = isCaps ? 'capturesMetaFilter' : 'clipsMetaFilter';
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';
    const curDate = new Date();
        
    // sort the video data depending on the meta data filter
    switch (data['stgs'][metaFltStr]) {
        case 'name':
            data['stgs'][ascStr] ? data[dataStr ].sort((a, b) => a['nameExt'].localeCompare(b['nameExt'])) : data[dataStr ].sort((a, b) => b['nameExt'].localeCompare(a['nameExt']));

            break;

        case 'date':
            data['stgs'][ascStr] ? data[dataStr ].sort((a, b) => a['created'] - b['created']) : data[dataStr ].sort((a, b) => b['created'] - a['created']);

            break;

        case 'size':
            data['stgs'][ascStr] ? data[dataStr ].sort((a, b) => a['size'] - b['size']) : data[dataStr ].sort((a, b) => b['size'] - a['size']);

            break;

        case 'duration':
            data['stgs'][ascStr] ? data[dataStr ].sort((a, b) => a['duration'] - b['duration']) : data[dataStr ].sort((a, b) => b['duration'] - a['duration']);

            break;
    }

    // indicate that no videos are found, or hide the label
    if (data[dataStr].length === 0) {
        statLabel.textContent = 'No Videos Found';
    }
    else {
        statLabel.classList.remove('active');

        for (const videoData of data[dataStr]) {
            // insert video preview depending on the game filter
            if (data['stgs'][gameFltStr] === 'all' || videoData['game'].toLowerCase() === data['stgs'][gameFltStr].toLowerCase()) {
                // get a clone of the video preview template
                const videoPrvwClone = videoPrvwTemplate.content.cloneNode(true);
                const videoPrvwCtr = videoPrvwClone.querySelector('.video-preview-ctr');
                const videoRenameBtn = videoPrvwClone.querySelector('.video-preview-rename-btn');
                const videoRenameIcon = videoPrvwClone.querySelector('.video-preview-rename-icon > use');
                const videoDeleteBtn = videoPrvwClone.querySelector('.video-preview-delete-btn');
                const videoDeleteIcon = videoPrvwClone.querySelector('.video-preview-delete-icon > use');

                // set the video source
                videoPrvwCtr.dataset.src = videoData['path'];
                // set the video thumbnail source
                videoPrvwClone.querySelector('.video-thumbnail-image').setAttribute('src', videoData['thumbnailPath']);
                // set the video duration
                videoPrvwClone.querySelector('.video-thumbnail-duration-label').textContent = getRdblDur(videoData['duration']);
                // set the video game
                videoPrvwClone.querySelector('.video-preview-game-label').textContent = `${videoData['game']}`;
                // set the video age
                videoPrvwClone.querySelector('.video-preview-age-label').textContent = `${getRdblAge((curDate - videoData['created']) / MSECONDS_IN_SECOND)}`;
                // set the video name with the extension
                videoPrvwClone.querySelector('.video-preview-name-label').textContent = videoData['nameExt'];

                // on click, open the video in the editor section
                videoPrvwCtr.addEventListener('click', () => {
                    // set the video player source
                    videoPlr.setAttribute('src', videoData['path']);

                    // change the active content section to the editor section
                    setActiveSect('editor');
                });

                videoRenameBtn.addEventListener('click', () => {
                });

                videoDeleteBtn.addEventListener('click', () => {
                });

                // append the video preview to the gallery
                gall.appendChild(videoPrvwClone);
            }
        }
    }

    // on scroll, toggle the caps gallery buttons
    togDirBtn(isCaps);
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
    if (gall.scrollLeft > 0) {
        leftBtn.classList.add('active');
    }
    else {
        leftBtn.classList.remove('active');
    }
    
    // if there is more to scroll right, enable the right button
    if (gall.scrollLeft < (gall.scrollWidth - Math.ceil(boxes[gallBoxStr].width))) {
        rightBtn.classList.add('active');
    }
    else {
        rightBtn.classList.remove('active');
    }
}