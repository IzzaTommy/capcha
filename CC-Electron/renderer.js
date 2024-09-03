window.addEventListener('DOMContentLoaded', init);

function init() {
    webSocketInit();

    titleBarInit();

    navAreaInit();

    editorAreaInit();
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
    document.querySelector('button#minimize').addEventListener('click', () => {
        window.titleBarAPI.minimize();
    });

    document.querySelector('button#maximize').addEventListener('click', () => {
        window.titleBarAPI.maximize();
    });

    document.querySelector('button#close').addEventListener('click', () => {
        window.titleBarAPI.close();
    });
}

function navAreaInit() {
    const navArea = document.querySelector('div#nav-area');

    const navExpander = navArea.querySelector('div#nav-expander');
    const navExpanderSVG = navExpander.querySelector('svg > use');

    const folderBtn = navArea.querySelector('button#folder');
    const folderSVG = folderBtn.querySelector('svg > use');

    const settingsBtn = navArea.querySelector('button#settings');
    const settingsSVG = settingsBtn.querySelector('svg > use');

    const recordBtn = navArea.querySelector('button#record');
    const recordSVG = recordBtn.querySelector('svg > use');
    
    navExpander.addEventListener('click', () => {
        navArea.classList.toggle('expanded');

        if (navArea.classList.contains('expanded')) {
            navExpanderSVG.setAttribute('href', 'assets/svg/arrow-back-ios.svg#arrow-back-ios');
        }
        else {
            navExpanderSVG.setAttribute('href', 'assets/svg/arrow-forward-ios.svg#arrow-forward-ios');
        }
    });

    folderBtn.addEventListener('mouseover', () => {
        folderSVG.setAttribute('href', 'assets/svg/folder-solid.svg#folder-solid');
    });

    folderBtn.addEventListener('mouseout', () => {
        folderSVG.setAttribute('href', 'assets/svg/folder.svg#folder');
    });

    settingsBtn.addEventListener('mouseover', () => {
        settingsSVG.setAttribute('href', 'assets/svg/settings-solid.svg#settings-solid');
    });

    settingsBtn.addEventListener('mouseout', () => {
        settingsSVG.setAttribute('href', 'assets/svg/settings.svg#settings');
    });

    recordBtn.addEventListener('mouseover', () => {
        recordSVG.setAttribute('href', 'assets/svg/record-solid.svg#record-solid');
    });

    recordBtn.addEventListener('mouseout', () => {
        recordSVG.setAttribute('href', 'assets/svg/record.svg#record');
    });
}

function editorAreaInit() {
    const videoContainer = document.querySelector('div#video-container');

    const video = videoContainer.querySelector('video#video-player');
    const playbackController = videoContainer.querySelector('div#playback-controller');

    const playbackInput = playbackController.querySelector('input#playback-slider');

    const playPauseBtn = playbackController.querySelector('button#play-pause');
    const playPauseSVG = playPauseBtn.querySelector('svg > use');

    const volumeBtn = playbackController.querySelector('button#volume');
    const volumeSVG = volumeBtn.querySelector('svg > use');

    const volumeInput = playbackController.querySelector('input#volume-slider');

    const timeSpan = playbackController.querySelector('div#timer > span:nth-child(1)');
    const durationSpan = playbackController.querySelector('div#timer > span:nth-child(2)');

    const speedInput = playbackController.querySelector('input#speed-slider');

    const speedBtn = playbackController.querySelector('button#speed');
    const speedSpan = speedBtn.querySelector('span:nth-child(1)');

    const fullscreenBtn = playbackController.querySelector('button#fullscreen');
    const fullscreenSVG = fullscreenBtn.querySelector('svg > use');

    /* Playback Slider */
    playbackInput.addEventListener('mousemove', (mouse) => {
        const playbackInputBox = playbackInput.getBoundingClientRect();
        const percentage = (mouse.clientX - playbackInputBox.left) / playbackInputBox.width * 100;
        
        playbackInput.style.backgroundImage = `linear-gradient(to right, rgba(220, 220, 220, 0.4) ${percentage}%, transparent ${percentage}%)`;
    });

    playbackInput.addEventListener('mouseleave', () => {
        playbackInput.style.backgroundImage = 'none';
    });

    playbackInput.addEventListener('input', () => {
        video.currentTime = playbackInput.value;
    });

    /* Play/Pause -*/
    playPauseBtn.addEventListener('click', () => {
        if (video.paused || video.ended) {
            video.play();
            playPauseSVG.setAttribute('href', 'assets/svg/pause.svg#pause');
        }
        else {
            video.pause();
            playPauseSVG.setAttribute('href', 'assets/svg/play-arrow.svg#play-arrow');
        }
    });

    video.addEventListener('click', () => {
        if (video.paused || video.ended) {
            video.play();
            playPauseSVG.setAttribute('href', 'assets/svg/pause.svg#pause');
        }
        else {
            video.pause();
            playPauseSVG.setAttribute('href', 'assets/svg/play-arrow.svg#play-arrow');
        }
    });

    /* Volume */
    volumeBtn.addEventListener('click', () => {
        if (video.muted) {
            video.muted = false;

            if (video.volume > 0.6) {
                volumeSVG.setAttribute('href', 'assets/svg/volume-up.svg#volume-up');
            }
            else {
                if (video.volume > 0.1) {
                    volumeSVG.setAttribute('href', 'assets/svg/volume-down.svg#volume-down');
                }
                else {
                    if (video.volume > 0.01) {
                        volumeSVG.setAttribute('href', 'assets/svg/volume-mute.svg#volume-mute');
                    }
                    else {
                        video.volume = 0.1;
                        volumeSVG.setAttribute('href', 'assets/svg/volume-down.svg#volume-down');
                    }
                }
            }

            volumeInput.stepUp(video.volume * 100);
        }
        else {
            video.muted = true;
            volumeSVG.setAttribute('href', 'assets/svg/volume-off.svg#volume-off');
            volumeInput.stepDown(video.volume * 100);
        }

    });

    /* Volume Slider */
    volumeInput.addEventListener('input', () => {
        video.volume = volumeInput.value;

        if (video.volume > 0.6) {
            volumeSVG.setAttribute('href', 'assets/svg/volume-up.svg#volume-up');
        }
        else {
            if (video.volume > 0.1) {
                volumeSVG.setAttribute('href', 'assets/svg/volume-down.svg#volume-down');
            }
            else {
                if (video.volume > 0.01) {
                    volumeSVG.setAttribute('href', 'assets/svg/volume-mute.svg#volume-mute');
                }
                else {
                    video.muted = true;
                    volumeSVG.setAttribute('href', 'assets/svg/volume-off.svg#volume-off');
                }
            }
        }
    });

    /* Time */
    video.addEventListener('timeupdate', () => {
        playbackInput.value = video.currentTime
        currentSeconds = video.currentTime;

        timeSpan.textContent = `${Math.floor(currentSeconds / 60)}:${Math.floor(currentSeconds % 60) < 10 ? '0' : ''}${Math.floor(currentSeconds % 60)}`
    });

    video.addEventListener('loadedmetadata', () => {
        playbackInput.value = video.currentTime
        currentSeconds = video.currentTime;
        totalSeconds = video.duration;
        timeSpan.textContent = `${Math.floor(currentSeconds / 60)}:${Math.floor(currentSeconds % 60) < 10 ? '0' : ''}${Math.floor(currentSeconds % 60)}`
        durationSpan.textContent = `/${Math.floor(totalSeconds / 60)}:${Math.floor(totalSeconds % 60) < 10 ? '0' : ''}${Math.floor(totalSeconds % 60)}`;

        playbackInput.max = video.duration;

        if (video.duration < 60)
        {
            playbackInput.step = 0.1;
        }
    });

    /* Speed Slider -*/
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

    /* Speed -*/
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

    /* Full Screen */
    fullscreenBtn.addEventListener('click', () => {
        if (document.fullscreenElement !== null) {
            document.exitFullscreen();
        } 
        else {
            videoContainer.requestFullscreen();
        }
    });

    videoContainer.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement !== null) {
            fullscreenSVG.setAttribute('href', 'assets/svg/fullscreen-exit.svg#fullscreen-exit');
        } 
        else {
            fullscreenSVG.setAttribute('href', 'assets/svg/fullscreen.svg#fullscreen');
        }
    });
}