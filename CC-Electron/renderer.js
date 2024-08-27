window.addEventListener('DOMContentLoaded', init);

function init() {
    webSocketInit();
    titleBarInit();
    userInterfaceInit();
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
    
    navExpander.addEventListener('click', () => {
        const navArea = document.querySelector('div#client-area > div#nav-area');

        navArea.classList.toggle('expanded');
    });

    const folderBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#folder');
    const settingBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#setting');
    const recordBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#record');

    folderBtn.addEventListener('mouseover', () => {
        folderBtn.querySelector('use').setAttribute('href', 'assets/folder-solid.svg#folder-solid');
    });

    folderBtn.addEventListener('mouseout', () => {
        folderBtn.querySelector('use').setAttribute('href', 'assets/folder.svg#folder');
    });

    settingBtn.addEventListener('mouseover', () => {
        settingBtn.querySelector('use').setAttribute('href', 'assets/setting-solid.svg#setting-solid');
    });

    settingBtn.addEventListener('mouseout', () => {
        settingBtn.querySelector('use').setAttribute('href', 'assets/setting.svg#setting');
    });

    recordBtn.addEventListener('mouseover', () => {
        recordBtn.querySelector('use').setAttribute('href', 'assets/record-solid.svg#record-solid');
    });

    recordBtn.addEventListener('mouseout', () => {
        recordBtn.querySelector('use').setAttribute('href', 'assets/record.svg#record');
    });
}