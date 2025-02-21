/**
 * Module for initializing the directories section for the renderer process
 * 
 * @module rendererDirectoriesSection
 * @requires rendererGeneral
 * @requires rendererEditorSection
 * @requires rendererSettingsSection
 */
import { SECTION, MSECONDS_IN_SECOND, ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, getStyle, setSectState, setIcon, getModBox, getRdblDur, getRdblAge, getTruncDec, atmpAsyncFunc } from './rendererGeneral.js';
import { setEditProgLabelText, setVideoFrameLen, setVideoPlrSrc } from './rendererEditorSection.js';
import { getStg, setStg } from './rendererSettingsSection.js';

// directories section constants
// byte sizing, gallery gap, and video preview age label update delay
const BYTES_IN_GIGABYTE = 1073741824;
const GAME_FILTER_DEF = 'All';
const GALLERY_MIN_GAP = 5;
const VIDEO_PREVIEW_AGE_LABEL_DELAY = 600000;

// directories section variables
let capsNameLabel, capsDirLabel2, capsUsageLabel3, capsTotalLabel3, 
capsProgFltFld, capsMetaFltFld, 
capsBarBtn, capsBarIcon, 
clipsNameLabel, clipsDirLabel2, clipsUsageLabel3, clipsTotalLabel3, 
clipsProgFltFld, clipsMetaFltFld, 
clipsBarBtn, clipsBarIcon, 
videoPrvwCtrTmpl, videoPrvwCtrWidth, 
capsLeftBtn, capsGall, capsStatLabel, capsRightBtn, 
clipsLeftBtn, clipsGall, clipsStatLabel, clipsRightBtn;

// directories section boxes
let capsGallBox, clipsGallBox;

// directories captures and clips videos and counts
let caps, clips, capsCounts, clipsCounts;

/**
 * Initializes the directories section variables
 */
export function initRendDirsSectVars() {
    // captures name label, directory label 2, usage label 3, total label 3
    capsNameLabel = document.getElementById('name-label-captures');
    capsDirLabel2 = document.getElementById('directory-label2-captures');
    capsUsageLabel3 = document.getElementById('usage-label3-captures');
    capsTotalLabel3 = document.getElementById('total-label3-captures');

    // captures program and meta filters
    capsProgFltFld = document.querySelector(`.directory-setting-field[name='capturesProgramFilter']`);
    capsMetaFltFld = document.querySelector(`.directory-setting-field[name='capturesMetaFilter']`);

    // captures bar button and icon
    capsBarBtn = document.getElementById('bar-btn-captures');
    capsBarIcon = document.querySelector('#bar-icon-captures > use');

    // clips name label, directory label 2, usage label 3, total label 3
    clipsNameLabel = document.getElementById('name-label-clips');
    clipsDirLabel2 = document.getElementById('directory-label2-clips');
    clipsUsageLabel3 = document.getElementById('usage-label3-clips');
    clipsTotalLabel3 = document.getElementById('total-label3-clips');

    // clips program and meta filters
    clipsProgFltFld = document.querySelector(`.directory-setting-field[name='clipsProgramFilter']`);
    clipsMetaFltFld = document.querySelector(`.directory-setting-field[name='clipsMetaFilter']`);
    
    // clips bar button and icon
    clipsBarBtn = document.getElementById('bar-btn-clips');
    clipsBarIcon = document.querySelector('#bar-icon-clips > use');

    // video preview container template and width
    videoPrvwCtrTmpl = document.getElementById('template-video-preview-ctr');
    videoPrvwCtrWidth = getStyle('--vtnimage-height') * 16 / 9 + 2 * getStyle('--vpctr-padding');

    // captures left and right button, gallery, and status label
    capsLeftBtn = document.getElementById('left-btn-captures');
    capsGall = document.getElementById('gallery-captures');
    capsStatLabel = document.getElementById('status-label-captures');
    capsRightBtn = document.getElementById('right-btn-captures');

    // clips left and right button, gallery, and status label
    clipsLeftBtn = document.getElementById('left-btn-clips');
    clipsGall = document.getElementById('gallery-clips');
    clipsStatLabel = document.getElementById('status-label-clips');
    clipsRightBtn = document.getElementById('right-btn-clips');

    // captures and clips gallery boxes
    capsGallBox = getModBox(capsGall.getBoundingClientRect());
    clipsGallBox = getModBox(clipsGall.getBoundingClientRect()); 

    // captures and clips videos and counts
    caps = null;
    clips = null;
    capsCounts = {
        'normal': null, 
        'corr': null, 
        'total': null, 
        'size': null
    };
    clipsCounts = {
        'normal': null, 
        'corr': null, 
        'total': null, 
        'size': null
    };
}

/**
 * Initializes the directories section
 */
export async function initRendDirsSect() {
    // initialize the content container 3 event listeners for captures and clips
    initContCtr3EL(true);  // boolean1 isCaps
    initContCtr3EL(false);  // boolean1 isCaps

    // initialize the content container 3 for captures and clips
    initContCtr3(true);  // boolean1 isCaps
    initContCtr3(false);  // boolean1 isCaps

    // initialize the directory gallery event listeners for captures and clips
    initDirGallEL(true);  // boolean1 isCaps
    initDirGallEL(false);  // boolean1 isCaps

    // add all videos to the gallery for captures and clips
    await atmpAsyncFunc(() => addAllVideos(true, true));  // boolean1 isCaps, boolean2 isInit
    await atmpAsyncFunc(() => addAllVideos(false, true));  // boolean1 isCaps, boolean2 isInit
}

/**
 * Initializes the content container 3 event listeners
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function initContCtr3EL(isCaps) {
    // get the captures or clips variables
    const nameLabel = isCaps ? capsNameLabel : clipsNameLabel;
    const progFltFld = isCaps ? capsProgFltFld : clipsProgFltFld;
    const metaFltFld = isCaps ? capsMetaFltFld : clipsMetaFltFld;
    const barBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const barIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // on click, open the right directory
    nameLabel.addEventListener('click', () => window['stgsAPI'].openDir(isCaps));

    // on change, set the program filter setting, then remove and re-insert the video preview containers in the new order
    progFltFld.addEventListener('change', async () => {
        setStg(progFltFld.name, await atmpAsyncFunc(() => window['stgsAPI'].setStg(progFltFld.name, progFltFld.value)));
        progFltFld.value = getStg(progFltFld.name);
    
        // remove all the video preview containers from the gallery
        remAllVideoPrvwCtrs(isCaps);

        // add all the video preview containers into the gallery
        addAllVideoPrvwCtrs(isCaps);
    });

    // on change, set the meta filter setting, then remove and re-insert the video preview containers in the new order
    metaFltFld.addEventListener('change', async () => {
        setStg(metaFltFld.name, await atmpAsyncFunc(() => window['stgsAPI'].setStg(metaFltFld.name, metaFltFld.value)));
        metaFltFld.value = getStg(metaFltFld.name);
    
        // remove all the video preview containers from the gallery
        remAllVideoPrvwCtrs(isCaps);

        // add the video preview containers into the gallery
        addAllVideoPrvwCtrs(isCaps);
    });

    // on click, change the sort order
    barBtn.addEventListener('click', async () => {
        barBtn.classList.toggle('active');

        // change the icon, save the order setting, then remove and re-insert the video preview containers
        if (barBtn.classList.contains('active')) {
            setIcon(barIcon, 'arrow-upward-alt');
            setStg(ascStr, await atmpAsyncFunc(() => window['stgsAPI'].setStg(ascStr, true)));

            // remove all the video preview containers from the gallery
            remAllVideoPrvwCtrs(isCaps);

            // add the video preview containers into the gallery
            addAllVideoPrvwCtrs(isCaps);
        }
        else {
            setIcon(barIcon, 'arrow-downward-alt');
            setStg(ascStr, await atmpAsyncFunc(() => window['stgsAPI'].setStg(ascStr, false)));

            // remove all the video preview containers from the gallery
            remAllVideoPrvwCtrs(isCaps);

            // add the video preview containers into the gallery
            addAllVideoPrvwCtrs(isCaps);
        }
    });
}

/**
 * Initializes the content container 3
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

    // set the directory label and meta filter
    dirLabel2.textContent = getStg(dirStr);
    metaFltFld.value = getStg(metaFltFld.name); // program filter is done later as the gallery is loaded

    // toggle the sort order and change the icon, depending on setting
    if (getStg(ascStr) === true) {
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
    const gallBox = isCaps ? capsGallBox : clipsGallBox;

    // on click, scroll the gallery left by approximately its width
    leftBtn.addEventListener('click', () => gall.scrollBy({ 'left': -gallBox['width'] }));

    // on scroll, scroll the gallery by increments of the video preview
    gall.addEventListener('wheel', (ptr) => {
        // prevent scrolling vertically on the section container
        ptr.preventDefault();

        // scroll the gallery by approximately the video preview width
        gall.scrollBy({ 'left': ptr['deltaY'] < 0 ? -videoPrvwCtrWidth : videoPrvwCtrWidth }); 
    });

    // on scroll, toggle the gallery buttons
    gall.addEventListener('scroll', () => setDirBtnState(isCaps));

    // on click, scroll the gallery right by approximately its width
    rightBtn.addEventListener('click', () => gall.scrollBy({ 'left': gallBox['width'] }));
}

/**
 * Sets the usage label 3 text
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function setUsageLabel3Text(isCaps) {
    // get the captures or clips variables
    const usageLabel3 = isCaps ? capsUsageLabel3 : clipsUsageLabel3;
    const counts = isCaps ? capsCounts : clipsCounts;

    // set the video counts and size of the directory
    usageLabel3.textContent = `${counts ['total']} Video${counts ['total'] !== 1 ? 's' : ''} (${counts ['normal']} Normal, ${counts ['corr']} Corrupted) - ${Math.ceil(counts ['size'] / BYTES_IN_GIGABYTE)} GB`;
}

/**
 * Sets the total label 3 text
 * 
 * @param {string} text - The new text of the label
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export function setTotalLabel3Text(text, isCaps) {
    // get the captures or clips variable
    const totalLabel3 = isCaps ? capsTotalLabel3 : clipsTotalLabel3;

    totalLabel3.textContent = text;
}

/**
 * Updates the program filter field with the programs present in the gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function setProgFltFld(isCaps) {
    // get the captures or clips variables
    const progFltFld = isCaps ? capsProgFltFld : clipsProgFltFld;
    const videos = isCaps ? caps : clips;
    // get the unique set of programs in the gallery
    const uniqProgs = [...new Set(videos.map(video => video['data']['prog']))];
    // boolean if the program filter setting needs to be updated, if the old program filter doesn't exist
    let doUpdate = true;

    // remove every existing program filter except 'All'
    while (progFltFld.children.length > 1) {
        progFltFld.removeChild(progFltFld.lastElementChild);        
    }

    // iterate through each program
    for (const prog of uniqProgs) {
        // create a new setting field option
        const fldOption = document.createElement('option');

        // assign the name of the program to the value and text
        fldOption.value = prog;
        fldOption.text = prog;

        // append the child to the program filter setting field
        progFltFld.appendChild(fldOption);

        // if the program filter's program is present, do not update
        if (getStg(progFltFld.name) === prog) {
            doUpdate = false;
        }
    }

    // check if the filter is not 'All' (no program named 'All') and if an update is needed
    if (getStg(progFltFld.name) !== GAME_FILTER_DEF && doUpdate) {
        progFltFld.value = getStg(progFltFld.name) = await atmpAsyncFunc(() => window['stgsAPI'].setStg(progFltFld.name, GAME_FILTER_DEF));
    }
    // else, set the value of the program filter field
    else {
        progFltFld.value = getStg(progFltFld.name);
    }
}

/**
 * Toggles the directory button on or off based on available scroll width
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function setDirBtnState(isCaps) {
    // get the captures or clips variables
    const leftBtn = isCaps ? capsLeftBtn : clipsLeftBtn;
    const gall = isCaps ? capsGall : clipsGall;
    const rightBtn = isCaps ? capsRightBtn : clipsRightBtn;
    const gallBox = isCaps ? capsGallBox : clipsGallBox;

    // if there is more to scroll left, enable the left button
    gall.scrollLeft > 0 ? leftBtn.classList.add('active') : leftBtn.classList.remove('active');
    
    // if there is more to scroll right, enable the right button
    gall.scrollLeft < (gall.scrollWidth - Math.ceil(gallBox['width'])) ? rightBtn.classList.add('active') : rightBtn.classList.remove('active');
}

/**
 * Updates the gallery size
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export function setGallBox(isCaps) {
    // get the captures or clips variable
    const gall = isCaps ? capsGall : clipsGall;
    let gallBox, numVideoPrvw;

    // get the new modifiable gallery bounding box
    isCaps ? capsGallBox = getModBox(capsGall.getBoundingClientRect()) : clipsGallBox = getModBox(clipsGall.getBoundingClientRect());

    // get the captures or clips variable
    gallBox = isCaps ? capsGallBox : clipsGallBox;

    // calculate the gap between the video previews based on the width of the gallery
    numVideoPrvw= Math.floor(gallBox['width'] / (videoPrvwCtrWidth + GALLERY_MIN_GAP));

    // set the gap
    gall.style.gap = `${(gallBox['width'] - (numVideoPrvw * videoPrvwCtrWidth)) / (numVideoPrvw - 1)}px`;
}

/**
 * Adds a video to the gallery, including creating and adding a video preview container
 * 
 * @param {Object} video - The video data
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export async function addVideo(video, isCaps) {
    // get the captures or clips variables
    const videos = isCaps ? caps : clips;
    const counts = isCaps ? capsCounts : clipsCounts;

    // update the total count
    counts['total'] += 1;

    // if the video is corrupted, update the corrupted count
    if (video === null) {
        counts['corr'] += 1;
    }
    else {
        // add the video to the captures or clips array
        videos.push(video);

        // update the size
        counts['size'] += video['data']['size'];

        // update the normal count
        counts['normal'] += 1;

        // create the video preview container
        createVideoPrvwCtr(video);

        // update the program filter field based on the programs in the gallery
        await atmpAsyncFunc(() => setProgFltFld(isCaps));

        // remove all the video preview containers from the gallery
        remAllVideoPrvwCtrs(isCaps);

        // add the video preview containers into the gallery
        addAllVideoPrvwCtrs(isCaps);
    }

    // set the usage label
    setUsageLabel3Text(isCaps);
}

/**
 * Adds all the videos to the gallery, including creating and adding video preview containers
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 * @param {boolean} isInit - If the function is run during initialization
 */
export async function addAllVideos(isCaps, isInit) {
    // get the captures or clips variables
    const statLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const counts = isCaps ? capsCounts : clipsCounts;

    // if this function is not run during initialization, indicate that the gallery is loading on the directory status label
    if (!isInit) {
        statLabel.textContent = 'Loading...';
        statLabel.classList.add('active');
    }

    // delete all the current videos
    delAllVideos(isCaps);

    // get the captures or clips and counts
    isCaps ? [caps, counts['normal'], counts['corr'], counts['total'], counts['size']] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDirData(isCaps), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, isInit)
    : [clips, counts['normal'], counts['corr'], counts['total'], counts['size']] = await atmpAsyncFunc(() => window['stgsAPI'].getAllDirData(isCaps), ASYNC_ATTEMPTS, ASYNC_DELAY_IN_MSECONDS, isInit);

    // create all the video preview containers
    createAllVideoPrvwCtrs(isCaps);

    // update the program filter field based on the programs in the videos
    await atmpAsyncFunc(() => setProgFltFld(isCaps));

    // remove all the video preview containers from the gallery
    remAllVideoPrvwCtrs(isCaps);

    // add the video preview containers into the gallery
    addAllVideoPrvwCtrs(isCaps);

    // set the usage label
    setUsageLabel3Text(isCaps);
}

/**
 * Deletes a video from the gallery, including its video preview container
 * 
 * @param {string} extName - The name of the video including the extension
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export async function delVideo(extName, isCaps) {
    // get the captures or clips variables
    const gall = isCaps ? capsGall : clipsGall;
    const videos = isCaps ? caps : clips;
    const counts = isCaps ? capsCounts : clipsCounts;
    const index = videos.findIndex(video => video['data']['extName'] === extName);

    // update the total count
    counts['total'] -= 1;

    // if the index is found
    if (index !== -1) {
        // update the normal count
        counts['normal'] -= 1;

        // update the size
        counts['size'] -= videos[index]['data']['size'];

        // clear the age update interval
        clearInterval(videos[index]['intvId']);

        // remove the node from the gallery
        gall.removeChild(videos[index]['node']);

        // remove the video from the array
        videos.splice(index, 1);
    }
    else {
        // otherwise, update the corrupted count
        counts['corr'] -= 1;
    }

    // update the program filter field based on the programs in the gallery
    await atmpAsyncFunc(() => setProgFltFld(isCaps));

    // set the usage label
    setUsageLabel3Text(isCaps);
}

/**
 * Deletes all the videos from the gallery, including the video preview containers
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function delAllVideos(isCaps) {
    // get the captures or clips variable
    let videos = isCaps ? caps : clips;

    // if there are videos, clear every age update interval
    if (videos !== null) {
        for (const video of videos) { 
            clearInterval(video['intvId']);
        }
    }

    // set the videos data to null
    isCaps ? caps = null : clips = null;

    // remove all the video preview containers
    remAllVideoPrvwCtrs(isCaps);
}

/**
 * Creates a video preview container for the video
 * 
 * @param {Object} video - The video data
 */
function createVideoPrvwCtr(video) {
    // get the current date
    let curDate = new Date();

    // get a clone of the video preview container template
    const videoPrvwCtrClone = videoPrvwCtrTmpl.content.cloneNode(true);
    const videoPrvwCtr = videoPrvwCtrClone.querySelector('.video-preview-ctr');
    const videoPrvwAgeLabel = videoPrvwCtrClone.querySelector('.video-preview-age-label')

    // set the video source
    videoPrvwCtr.dataset.src = video['data']['path'];
    // set the video thumbnail source
    videoPrvwCtrClone.querySelector('.video-thumbnail-image').setAttribute('src', video['data']['tbnlPath']);
    // set the video duration
    videoPrvwCtrClone.querySelector('.video-thumbnail-duration-label').textContent = getRdblDur(video['data']['dur']);
    // set the video program
    videoPrvwCtrClone.querySelector('.video-preview-program-label').textContent = `${video['data']['prog']}`;
    // set the video age
    videoPrvwAgeLabel.textContent = `${getRdblAge((curDate - video['data']['date']) / MSECONDS_IN_SECOND)}`;
    // set the video name with the extension
    videoPrvwCtrClone.querySelector('.video-preview-name-label').textContent = video['data']['extName'];

    // on click, open the video in the editor section
    videoPrvwCtr.addEventListener('click', () => {
        // set the video frame length (to go frame by frame)
        setVideoFrameLen(getTruncDec(1 / video['data']['fps']));

        // set the video player source
        setVideoPlrSrc(video['data']['path']);

        // set the editor program label
        setEditProgLabelText(`${video['data']['prog']}`);

        // change the active content section to the editor section
        setSectState(SECTION.EDITOR);
    });

    // on click, ...
    videoPrvwCtrClone.querySelector('.video-preview-rename-btn').addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // on click, ...
    videoPrvwCtrClone.querySelector('.video-preview-delete-btn').addEventListener('click', (event) => {
        event.stopPropagation();
        // delVideoPrvwCtr(video['data']['extName'], true);
    });

    // set the video element node
    video['node'] = videoPrvwCtr;

    // set the interval for updating the age periodically
    video['intvId'] = setInterval(() => {
        // get the new date
        curDate = new Date();

        // set the video age
        videoPrvwAgeLabel.textContent = `${getRdblAge((curDate - video['data']['date']) / MSECONDS_IN_SECOND)}`;
    }, VIDEO_PREVIEW_AGE_LABEL_DELAY);
}

/**
 * Creates all video preview containers
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function createAllVideoPrvwCtrs(isCaps) {
    // get the captures or clips variable
    const videos = isCaps ? caps : clips;

    // iterate through each video and create a video preview container
    videos.forEach(video => createVideoPrvwCtr(video));
}

/**
 * Adds all the video preview containers into a gallery, based on the program and meta filters
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function addAllVideoPrvwCtrs(isCaps) {
    // get the captures or clips variables
    const gall = isCaps ? capsGall : clipsGall;
    const statLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const videos = isCaps ? caps : clips;
    const progFltStr = isCaps ? 'capturesProgramFilter' : 'clipsProgramFilter';
    const metaFltStr = isCaps ? 'capturesMetaFilter' : 'clipsMetaFilter';
    const ascStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // sort the video data depending on the meta data filter
    switch (getStg(metaFltStr)) {
        case 'Name':
            getStg(ascStr) ? videos.sort((a, b) => a['data']['extName'].localeCompare(b['data']['extName'])) : videos.sort((a, b) => b['data']['extName'].localeCompare(a['data']['extName']));

            break;

        case 'Date':
            getStg(ascStr) ? videos.sort((a, b) => a['data']['date'] - b['data']['date']) : videos.sort((a, b) => b['data']['date'] - a['data']['date']);

            break;

        case 'Size':
            getStg(ascStr) ? videos.sort((a, b) => a['data']['size'] - b['data']['size']) : videos.sort((a, b) => b['data']['size'] - a['data']['size']);

            break;

        case 'Duration':
            getStg(ascStr) ? videos.sort((a, b) => a['data']['dur'] - b['data']['dur']) : videos.sort((a, b) => b['data']['dur'] - a['data']['dur']);

            break;
    }

    // check if there are no videos
    if (videos.length === 0) {
        // set the directory status label
        statLabel.textContent = 'No Videos Found';
    }
    else {
        // set the directory status label
        statLabel.classList.remove('active');

        // iterate through each video
        for (const video of videos) {
            // insert video preview depending on the program filter
            if (getStg(progFltStr) === GAME_FILTER_DEF || video['data']['prog'] === getStg(progFltStr)) {
                gall.appendChild(video['node']);
            }
        }
    }

    // reset the scroll to the left
    gall.scrollLeft = 0;

    // toggle the directory buttons
    setDirBtnState(isCaps);
}

/**
 * Removes all the video preview containers from a gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function remAllVideoPrvwCtrs(isCaps) {
    // get the captures or clips variable
    const gall = isCaps ? capsGall : clipsGall;

    // remove every existing video preview from the gallery (do not need to delete intervals yet)
    while (gall.children.length > 1) {
        gall.removeChild(gall.lastElementChild);        
    }
}