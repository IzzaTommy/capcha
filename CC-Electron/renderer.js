window.addEventListener('DOMContentLoaded', init);

function init() {
    // // start recording
    // document.getElementById('start').addEventListener('click', () => {
    //     window.webSocketAPI.startRecord();
    // });

    // // stop recording
    // document.getElementById('stop').addEventListener('click', () => {
    //     window.webSocketAPI.stopRecord();
    // });
    
    const navExpander = document.querySelector('div#client-area > div#nav-area > div#nav-expander');
    
    navExpander.addEventListener('click', function() {
        const navArea = document.querySelector('div#client-area > div#nav-area');

        navArea.classList.toggle('expanded');
    });    
}