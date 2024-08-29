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

        if (navArea.classList.contains('expanded')) {
            navExpander.querySelector('svg > use').setAttribute('href', 'assets/svg/arrow-back-ios.svg#arrow-back-ios');
        }
        else {
            navExpander.querySelector('svg > use').setAttribute('href', 'assets/svg/arrow-forward-ios.svg#arrow-forward-ios');
        }
    });

    const folderBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#folder');
    const settingsBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#settings');
    const recordBtn = document.querySelector('div#client-area > div#nav-area > nav#nav-bar > button#record');

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