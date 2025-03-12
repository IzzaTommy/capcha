/**
 * Module for initializing the directories section for the renderer process
 * 
 * @module rendererDirectoriesSection
 * @requires rendererGeneral
 * @requires rendererEditorSection
 * @requires rendererSettingsSection
 */
import { STATE, SECTION, MSECONDS_IN_SECOND, setConfOvrlState, setConfCtrState, getConfNameFldValue, getConfFormatFldValue, setContStatLabelText, setSectState, setIcon, getModBox, getRdblDur, getRdblAge, getTruncDec } from './rendererGeneral.js';
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

// promise
let confProm;

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
    videoPrvwCtrWidth = parseInt(window.getComputedStyle(videoPrvwCtrTmpl).getPropertyValue('height')) * 16 / 9 + 2 * parseInt(window.getComputedStyle(videoPrvwCtrTmpl).getPropertyValue('padding'));

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
    caps = [];
    clips = [];
    capsCounts = {
        'normal': -1, 
        'size': -1
    };
    clipsCounts = {
        'normal': -1, 
        'size': -1
    };

    // confirmation promise
    confProm = null;
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
    initVideosGallEL(true);  // boolean1 isCaps
    initVideosGallEL(false);  // boolean1 isCaps

    // try to add all videos to the captures gallery
    try {
        await addAllVideos(true, true);  // boolean1 isCaps, boolean2 isInit
    }
    catch (_) {
        // notify the user that the captures gallery could not be loaded
        setContStatLabelText('Failed to load the captures gallery!');
    }

    // try to add all videos to the clips gallery
    try {
        await addAllVideos(false, true);  // boolean1 isCaps, boolean2 isInit
    }
    catch (_) {
        // notify the user that the clips gallery could not be loaded
        setContStatLabelText('Failed to load the clips gallery!');
    }
}

/**
 * Initializes the content container 3 event listeners
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function initContCtr3EL(isCaps) {
    // get the captures or clips variables
    const videosNameLabel = isCaps ? capsNameLabel : clipsNameLabel;
    const videosProgFltFld = isCaps ? capsProgFltFld : clipsProgFltFld;
    const videosMetaFltFld = isCaps ? capsMetaFltFld : clipsMetaFltFld;
    const videosBarBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const videosBarIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const videosAscStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // on click, open the captures or clips directory
    videosNameLabel.addEventListener('click', async () => { 
        // try to open the directory
        try {
            await window['stgsAPI'].openDir(isCaps);
        }
        catch (_) {
            // notify the user that the directory failed to open
            setContStatLabelText('Failed to open the directory!');
        }
    });

    // on change, set the program filter setting, then remove and re-insert the video preview containers in the new order
    videosProgFltFld.addEventListener('change', async () => {
        // try to update the setting
        try {
            setStg(videosProgFltFld.name, await window['stgsAPI'].setStg(videosProgFltFld.name, videosProgFltFld.value));
            videosProgFltFld.value = getStg(videosProgFltFld.name);
        
            // remove all the video preview containers from the gallery
            remAllVideoPrvwCtrs(isCaps);
    
            // add all the video preview containers into the gallery
            addAllVideoPrvwCtrs(isCaps);
        }
        catch (_) {
            // notify the user that the program filter could not be changed
            setContStatLabelText('Failed to change the program filter!');

            // revert the change
            videosProgFltFld.value = getStg(videosProgFltFld.name);
        }
    });

    // on change, set the meta filter setting, then remove and re-insert the video preview containers in the new order
    videosMetaFltFld.addEventListener('change', async () => {
        // try to update the setting
        try {
            setStg(videosMetaFltFld.name, await window['stgsAPI'].setStg(videosMetaFltFld.name, videosMetaFltFld.value));
            videosMetaFltFld.value = getStg(videosMetaFltFld.name);
        
            // remove all the video preview containers from the gallery
            remAllVideoPrvwCtrs(isCaps);
    
            // add all the video preview containers into the gallery
            addAllVideoPrvwCtrs(isCaps);
        }
        catch (_) {
            // notify the user that the meta filter could not be changed
            setContStatLabelText('Failed to change the meta filter!');

            // revert the change
            videosMetaFltFld.value = getStg(videosMetaFltFld.name);
        }
    });

    // on click, change the sort order
    videosBarBtn.addEventListener('click', async () => {
        // try to set the setting and update the settings cache
        try {
            setStg(videosAscStr, await window['stgsAPI'].setStg(videosAscStr, !videosBarBtn.classList.contains('active')));
        
            // check if the setting changed
            if (getStg(videosAscStr) !== videosBarBtn.classList.contains('active')) {
                // change the toggle icon and state
                if (videosBarBtn.classList.contains('active')) {
                    setIcon(videosBarIcon, 'arrow-downward-alt');
                    videosBarBtn.classList.remove('active');
                }
                else {
                    setIcon(videosBarIcon, 'arrow-upward-alt');
                    videosBarBtn.classList.add('active');
                }

                // remove all the video preview containers from the gallery
                remAllVideoPrvwCtrs(isCaps);

                // add all the video preview containers into the gallery
                addAllVideoPrvwCtrs(isCaps);
            }
        }
        catch (_) {
            // notify the user that the order could not be updated
            setContStatLabelText('Failed to update the sorting order!');
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
    const videosDirLabel2 = isCaps ? capsDirLabel2 : clipsDirLabel2;
    const videosMetaFltFld = isCaps ? capsMetaFltFld : clipsMetaFltFld;
    const videosBarBtn = isCaps ? capsBarBtn : clipsBarBtn;
    const videosBarIcon = isCaps ? capsBarIcon : clipsBarIcon;
    const videosDirStr = isCaps ? 'capturesDirectory' : 'clipsDirectory';
    const videosAscStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // set the directory label and meta filter
    videosDirLabel2.textContent = getStg(videosDirStr);
    videosMetaFltFld.value = getStg(videosMetaFltFld.name); // program filter is done later as the gallery is loaded

    // toggle the sort order and change the icon, depending on setting
    if (getStg(videosAscStr) === true) {
        videosBarBtn.classList.add('active');
        setIcon(videosBarIcon, 'arrow-upward-alt');
    }
}

/**
 * Initializes the videos gallery event listeners
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function initVideosGallEL(isCaps) {
    // get the captures or clips variables
    const videosLeftBtn = isCaps ? capsLeftBtn : clipsLeftBtn;
    const videosGall = isCaps ? capsGall : clipsGall;
    const videosRightBtn = isCaps ? capsRightBtn : clipsRightBtn;
    const videosGallBox = isCaps ? capsGallBox : clipsGallBox;

    // on click, scroll the gallery left by approximately its width
    videosLeftBtn.addEventListener('click', () => videosGall.scrollBy({ 'left': -videosGallBox['width'] }));

    // on scroll, scroll the gallery by increments of the video preview
    videosGall.addEventListener('wheel', (ptr) => {
        // prevent scrolling vertically on the section container
        ptr.preventDefault();

        // scroll the gallery by approximately the video preview width
        videosGall.scrollBy({ 'left': ptr['deltaY'] < 0 ? -videoPrvwCtrWidth : videoPrvwCtrWidth }); 
    });

    // on scroll, toggle the gallery buttons
    videosGall.addEventListener('scroll', () => setVideosBtnState(isCaps));

    // on click, scroll the gallery right by approximately its width
    videosRightBtn.addEventListener('click', () => videosGall.scrollBy({ 'left': videosGallBox['width'] }));
}

/**
 * Sets the videos usage label 3 text
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function setVideosUsageLabel3Text(isCaps) {
    // get the captures or clips variables
    const videosUsageLabel3 = isCaps ? capsUsageLabel3 : clipsUsageLabel3;
    const videosCounts = isCaps ? capsCounts : clipsCounts;

    // set the video counts and size of the directory
    videosUsageLabel3.textContent = `${videosCounts['normal']} Video${videosCounts['normal'] !== 1 ? 's' : ''} - ${Math.ceil(videosCounts['size'] / BYTES_IN_GIGABYTE)} GB`;
}

/**
 * Sets the videos total label 3 text
 * 
 * @param {string} text - The new text of the label
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export function setVideosTotalLabel3Text(text, isCaps) {
    // get the captures or clips variable
    const videosTotalLabel3 = isCaps ? capsTotalLabel3 : clipsTotalLabel3;

    videosTotalLabel3.textContent = text;
}

/**
 * Updates the videos program filter field with the programs present in the gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
async function setVideosProgFltFld(isCaps) {
    // get the captures or clips variables
    const videosProgFltFld = isCaps ? capsProgFltFld : clipsProgFltFld;
    const videos = isCaps ? caps : clips;
    // get the unique set of programs in the gallery
    const uniqProgNames = [...new Set(videos.map(video => video['data']['prog']))];
    // boolean if the program filter setting needs to be updated, if the old program filter doesn't exist
    let doUpdate = true;

    // remove every existing program filter except 'All'
    while (videosProgFltFld.children.length > 1) {
        videosProgFltFld.removeChild(videosProgFltFld.lastElementChild);        
    }

    // iterate through each program
    for (const progName of uniqProgNames) {
        // create a new setting field option
        const fldOption = document.createElement('option');

        // assign the name of the program to the value and text
        fldOption.value = progName;
        fldOption.text = progName;

        // append the child to the program filter setting field
        videosProgFltFld.appendChild(fldOption);

        // if the program filter's program is present, do not update
        if (getStg(videosProgFltFld.name) === progName) {
            doUpdate = false;
        }
    }

    // check if the filter is not 'All' (no program named 'All') and if an update is needed
    if (getStg(videosProgFltFld.name) !== GAME_FILTER_DEF && doUpdate) {
        // try to update the setting
        try {
            videosProgFltFld.value = getStg(videosProgFltFld.name) = await window['stgsAPI'].setStg(videosProgFltFld.name, GAME_FILTER_DEF);
        }
        catch (_) {
            // notify the user that program filter could not be updated
            setContStatLabelText('Failed to update the program filter!');
        }
    }
    // else, set the value of the program filter field
    else {
        videosProgFltFld.value = getStg(videosProgFltFld.name);
    }
}

/**
 * Toggles the videos button on or off based on available scroll width
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function setVideosBtnState(isCaps) {
    // get the captures or clips variables
    const videosLeftBtn = isCaps ? capsLeftBtn : clipsLeftBtn;
    const videosGall = isCaps ? capsGall : clipsGall;
    const videosRightBtn = isCaps ? capsRightBtn : clipsRightBtn;
    const videosGallBox = isCaps ? capsGallBox : clipsGallBox;

    // if there is more to scroll left, enable the left button
    videosGall.scrollLeft > 0 ? videosLeftBtn.classList.add('active') : videosLeftBtn.classList.remove('active');
    
    // if there is more to scroll right, enable the right button
    videosGall.scrollLeft < (videosGall.scrollWidth - Math.ceil(videosGallBox['width'])) ? videosRightBtn.classList.add('active') : videosRightBtn.classList.remove('active');
}

/**
 * Updates the videos gallery size
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export function setVideosGallBox(isCaps) {
    // get the captures or clips variable
    const videosGall = isCaps ? capsGall : clipsGall;
    let videosGallBox, numVideoPrvw;

    // get the new modifiable gallery bounding box
    isCaps ? capsGallBox = getModBox(capsGall.getBoundingClientRect()) : clipsGallBox = getModBox(clipsGall.getBoundingClientRect());

    // get the captures or clips variable
    videosGallBox = isCaps ? capsGallBox : clipsGallBox;

    // calculate the gap between the video previews based on the width of the gallery
    numVideoPrvw= Math.floor(videosGallBox['width'] / (videoPrvwCtrWidth + GALLERY_MIN_GAP));

    // set the gap
    videosGall.style.gap = `${(videosGallBox['width'] - (numVideoPrvw * videoPrvwCtrWidth)) / (numVideoPrvw - 1)}px`;
}

/**
 * Adds a video to the gallery, including creating and adding a video preview container
 * 
 * @param {Object} video - The video (data)
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export async function addVideo(video, isCaps) {
    // set the confirmation container state to adding
    // the overlay is assumed to be active due to creating a clip, stopping recording, or renaming a video
    setConfCtrState(STATE.ADDING);

    // get the captures or clips variables
    const videos = isCaps ? caps : clips;
    const videosCounts = isCaps ? capsCounts : clipsCounts;

    // add the video to the captures or clips array
    videos.push(video);

    // update the normal count
    videosCounts['normal'] += 1;

    // update the size
    videosCounts['size'] += video['data']['size'];

    // create the video preview container
    createVideoPrvwCtr(video);

    // update the program filter field based on the programs in the gallery
    await setVideosProgFltFld(isCaps);

    // remove all the video preview containers from the gallery
    remAllVideoPrvwCtrs(isCaps);

    // add all the video preview containers into the gallery
    addAllVideoPrvwCtrs(isCaps);

    // set the usage label
    setVideosUsageLabel3Text(isCaps);

    // set the confirmation overlay state to inactive
    setConfOvrlState(STATE.INACTIVE);
}

/**
 * Adds all the videos to the gallery, including creating and adding video preview containers
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 * @param {boolean} isInit - If the function is run during initialization
 */
export async function addAllVideos(isCaps, isInit) {
    // get the captures or clips variables
    const videosStatLabel = isCaps ? capsStatLabel : clipsStatLabel;
    let videos = isCaps ? caps : clips;
    const videosCounts = isCaps ? capsCounts : clipsCounts;

    // if this function is not run during initialization, indicate that the gallery is loading on the directory status label
    if (!isInit) {
        videosStatLabel.textContent = 'Loading...';
        videosStatLabel.classList.add('active');

        // remove all the video preview containers from the gallery
        remAllVideoPrvwCtrs(isCaps);

        // if there are videos, clear every age update interval
        for (const video of videos) { 
            clearInterval(video['intvId']);
        }
    }

    // try to get the captures or clips and counts
    try {
        isCaps ? [caps, videosCounts['normal'], videosCounts['size']] = await window['stgsAPI'].getAllVideos(isCaps)  //isinit
        : [clips, videosCounts['normal'], videosCounts['size']] = await window['stgsAPI'].getAllVideos(isCaps);  //isinit
    }
    catch (_) {
        // notify the user that the captures or clips could not be retrieved
        setContStatLabelText('Failed to get the videos!');
    }

    // get the new captures or clips variable
    videos = isCaps ? caps : clips;

    // iterate through each video and create a video preview container
    videos.forEach(video => createVideoPrvwCtr(video));

    // update the program filter field based on the programs in the videos
    await setVideosProgFltFld(isCaps);

    // add all the video preview containers into the gallery
    addAllVideoPrvwCtrs(isCaps);

    // set the usage label
    setVideosUsageLabel3Text(isCaps);
}

/**
 * Deletes a video from the gallery, including its video preview container
 * 
 * @param {string} videoFullName - The name of the video including the extension
 * @param {boolean} isCaps - If the call is for captures or clips
 */
export async function delVideo(videoFullName, isCaps) {
    // get the captures or clips variables
    const videosGall = isCaps ? capsGall : clipsGall;
    const videosStatLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const videos = isCaps ? caps : clips;
    const videosCounts = isCaps ? capsCounts : clipsCounts;
    const index = videos.findIndex(video => video['data']['fullName'] === videoFullName);

    // update the normal count
    videosCounts['normal'] -= 1;

    // update the size
    videosCounts['size'] -= videos[index]['data']['size'];

    // clear the age update interval
    clearInterval(videos[index]['intvId']);

    // remove the node from the gallery
    videosGall.removeChild(videos[index]['node']);

    // remove the video from the array
    videos.splice(index, 1);

    // update the program filter field based on the programs in the gallery
    await setVideosProgFltFld(isCaps);

    // set the usage label
    setVideosUsageLabel3Text(isCaps);

    // check if there are no videos
    if (videos.length === 0) {
        // set the directory status label
        videosStatLabel.textContent = 'No Videos Found';
    }
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
    videoPrvwCtrClone.querySelector('.video-preview-name-label').textContent = video['data']['fullName'];

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

    // on click, rename the video
    videoPrvwCtrClone.querySelector('.video-preview-rename-btn').addEventListener('click', async (ptr) => {
        // prevent the click from propagating to the video preview container
        ptr.stopPropagation();

        // set the confirmation container state to renaming mode
        setConfCtrState(STATE.RENAME, video['data']['name'], video['data']['ext']);

        // set the confirmation overlay state to active
        setConfOvrlState(STATE.ACTIVE);

        // create a new promise that is resolved/rejected based on the user action in the confirmation overlay
        confProm = new Promise((resolve, reject) => {
            rsvConfProm = resolve;
            rejConfProm = reject;
        });

        // try to await the user action
        try {
            await confProm;

            // try to rename the video
            try {
                // set the confirmation container state to renaming
                setConfCtrState(STATE.RENAMING);

                // set the confirmation overlay state to active
                setConfOvrlState(STATE.ACTIVE);

                // send a request to main to delete the video
                await window['stgsAPI'].renVideo(video['data']['path'], getConfNameFldValue(), getConfFormatFldValue());
            }
            catch (_) {
                // notify the user than the video could not be renamed
                setContStatLabelText('Failed to rename the video!');

                // set the confirmation overlay state to inactive
                setConfOvrlState(STATE.INACTIVE);
            }
        }
        catch (_) {
            // DO NOTHING
            // notify the user than the action was cancelled
            // setContStatLabelText('Action cancelled!');
        }
    });

    // on click, delete the video
    videoPrvwCtrClone.querySelector('.video-preview-delete-btn').addEventListener('click', async (ptr) => {
        // prevent the click from propagating to the video preview container
        ptr.stopPropagation();
        
        // set the confirmation container state to renaming mode
        setConfCtrState(STATE.DELETE);

        // set the confirmation overlay state to active
        setConfOvrlState(STATE.ACTIVE);

        // create a new promise that is resolved/rejected based on the user action in the confirmation overlay
        confProm = new Promise((resolve, reject) => {
            rsvConfProm = resolve;
            rejConfProm = reject;
        });

        // try to await the user action
        try {
            await confProm;

            // try to delete the video
            try {
                // send a request to main to delete the video
                await window['stgsAPI'].delVideo(video['data']['path']);
            }
            catch (_) {
                // notify the user than the video could not be deleted
                setContStatLabelText('Failed to delete the video!');
            }
        }
        catch (_) {
            // DO NOTHING
            // notify the user than the action was cancelled
            // setContStatLabelText('Action cancelled!');
        }


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
 * Adds all the video preview containers into a gallery, based on the program and meta filters
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function addAllVideoPrvwCtrs(isCaps) {
    // get the captures or clips variables
    const videosGall = isCaps ? capsGall : clipsGall;
    const videosStatLabel = isCaps ? capsStatLabel : clipsStatLabel;
    const videos = isCaps ? caps : clips;
    const videosProgFltStr = isCaps ? 'capturesProgramFilter' : 'clipsProgramFilter';
    const videosMetaFltStr = isCaps ? 'capturesMetaFilter' : 'clipsMetaFilter';
    const videosAscStr = isCaps ? 'capturesAscending' : 'clipsAscending';

    // sort the video data depending on the meta data filter
    switch (getStg(videosMetaFltStr)) {
        case 'Name':
            getStg(videosAscStr) ? videos.sort((a, b) => a['data']['fullName'].localeCompare(b['data']['fullName'])) : videos.sort((a, b) => b['data']['fullName'].localeCompare(a['data']['fullName']));

            break;

        case 'Date':
            getStg(videosAscStr) ? videos.sort((a, b) => a['data']['date'] - b['data']['date']) : videos.sort((a, b) => b['data']['date'] - a['data']['date']);

            break;

        case 'Size':
            getStg(videosAscStr) ? videos.sort((a, b) => a['data']['size'] - b['data']['size']) : videos.sort((a, b) => b['data']['size'] - a['data']['size']);

            break;

        case 'Duration':
            getStg(videosAscStr) ? videos.sort((a, b) => a['data']['dur'] - b['data']['dur']) : videos.sort((a, b) => b['data']['dur'] - a['data']['dur']);

            break;
    }

    // check if there are no videos
    if (videos.length === 0) {
        // set the directory status label
        videosStatLabel.textContent = 'No Videos Found';
    }
    else {
        // set the directory status label
        videosStatLabel.classList.remove('active');

        // iterate through each video
        for (const video of videos) {
            // insert video preview depending on the program filter
            if (getStg(videosProgFltStr) === GAME_FILTER_DEF || video['data']['prog'] === getStg(videosProgFltStr)) {
                videosGall.appendChild(video['node']);
            }
        }
    }

    // reset the scroll to the left
    videosGall.scrollLeft = 0;

    // toggle the directory buttons
    setVideosBtnState(isCaps);
}

/**
 * Removes all the video preview containers from a gallery
 * 
 * @param {boolean} isCaps - If the call is for captures or clips
 */
function remAllVideoPrvwCtrs(isCaps) {
    // get the captures or clips variable
    const videosGall = isCaps ? capsGall : clipsGall;

    // remove every existing video preview from the gallery (do not need to delete intervals yet)
    while (videosGall.children.length > 1) {
        videosGall.removeChild(videosGall.lastElementChild);        
    }
}

/**
 * Resolves the confirmation promise
 */
export function rsvConfProm() {
    confProm.resolve();
}

/**
 * Rejects the confirmation promise
 */
export function rejConfProm() {
    confProm.reject();
}