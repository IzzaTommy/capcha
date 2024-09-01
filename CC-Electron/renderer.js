window.addEventListener('DOMContentLoaded', init);

function init() {
    webSocketInit();
    titleBarInit();
    userInterfaceInit();
    editorInit();
}

function webSocketInit() {
    // // start recording
    // document.getElementById('start').addEventListener('click', () => {
    //     window.webSocketAPI.startRecord();
    // });

    // // stop recording
    // document.getElementById('stop').addEventListener('click', () => {
    //     window.webSocketAPI.stopRecord();
    // });
}

function titleBarInit() {
    document.querySelector('div#title-bar > button#minimize').addEventListener('click', () => {
        window.titleBarAPI.minimize();
    });

    document.querySelector('div#title-bar > button#maximize').addEventListener('click', () => {
        window.titleBarAPI.maximize();
    });

    document.querySelector('div#title-bar > button#close').addEventListener('click', () => {
        window.titleBarAPI.close();
    });
}

function userInterfaceInit() {
    const navExpander = document.querySelector('div#client-area > div#nav-area > div#nav-expander');
    const folderBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#folder');
    const settingsBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#settings');
    const recordBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#record');
    
    navExpander.addEventListener('click', () => {
        const navArea = document.querySelector('div#client-area > div#nav-area');

        navArea.classList.toggle('expanded');

        if (navArea.classList.contains('expanded')) {
            navExpander.querySelector('svg > use').setAttribute('href', 'assets/svg/arrow-back-ios.svg#arrow-back-ios');
        }
        else {
            navExpander.querySelector('svg > use').setAttribute('href', 'assets/svg/arrow-forward-ios.svg#arrow-forward-ios');
        }
    });

    folderBtn.addEventListener('mouseover', () => {
        folderBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/folder-solid.svg#folder-solid');
    });

    folderBtn.addEventListener('mouseout', () => {
        folderBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/folder.svg#folder');
    });

    settingsBtn.addEventListener('mouseover', () => {
        settingsBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/settings-solid.svg#settings-solid');
    });

    settingsBtn.addEventListener('mouseout', () => {
        settingsBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/settings.svg#settings');
    });

    recordBtn.addEventListener('mouseover', () => {
        recordBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/record-solid.svg#record-solid');
    });

    recordBtn.addEventListener('mouseout', () => {
        recordBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/record.svg#record');
    });
}

function editorInit() {
    const videoScrubber = document.querySelector('div#client-area > div#content-area > div#editor-menu > div#video-container > div#playback-controller > input');

    videoScrubber.addEventListener('mousemove', (e) => {
        const rectangle = videoScrubber.getBoundingClientRect();
        const percentage = (e.clientX - rectangle.left) / rectangle.width * 100;
        
        videoScrubber.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${percentage}%, transparent ${percentage}%)`;
    });

    videoScrubber.addEventListener('mouseleave', () => {
        videoScrubber.style.backgroundImage = 'none';
    });




    const video = document.querySelector('div#client-area > div#content-area > div#editor-menu > div#video-container > video');
    const playbackController = document.querySelector('div#client-area > div#content-area > div#editor-menu > div#video-container > div#playback-controller');
    const playPauseBtn = playbackController.querySelector('div > button#play-pause');

    playPauseBtn.addEventListener('click', () => {
        if (video.paused || video.ended) {
            video.play();
            playPauseBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/pause.svg#pause');
        }
        else {
            video.pause();
            playPauseBtn.querySelector('svg > use').setAttribute('href', 'assets/svg/play-arrow.svg#play-arrow');
        }
    });
}