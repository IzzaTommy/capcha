/**
 * Module for initializing the title bar for the renderer process
 * 
 * @module rendererTitleBar
 */

// title bar variables
let titleBar, minBarBtn, maxBarBtn, closeBarBtn;

/**
 * Initializes the title bar variables
 */
export function initRendTitleBarVars() {
    // title bar
    titleBar = document.getElementById('bar-title');

    // title bar buttons
    minBarBtn = document.getElementById('bar-btn-minimize');
    maxBarBtn = document.getElementById('bar-btn-maximize');
    closeBarBtn = document.getElementById('bar-btn-close');
}

/**
 * Initializes the title bar
 */
export function initRendTitleBar() {
    // initialize the title bar button event listeners
    initTitleBarBtnEL();
}

/**
 * Initializes the title bar button event listeners
 */
function initTitleBarBtnEL() {
    // on click, minimize the window
    minBarBtn.addEventListener('click', window['genAPI'].minWindow);

    // on click, maximize the window
    maxBarBtn.addEventListener('click', window['genAPI'].maxWindow);

    // on click, save the cached video volume data and close the window
    closeBarBtn.addEventListener('click', window['genAPI'].closeWindow);
}

/**
 * Sets the title bar style
 * 
 * @param {string} style - The name of the style
 * @param {string} value - The new value of the style
 */
export function setTitleBarStyle(style, value) {
    titleBar['style'][style] = value;
}