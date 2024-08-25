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

    document.querySelector('div#client-area > div#expanded-nav').addEventListener('click', function() {
        const expandedNav = document.querySelector('div#client-area > div#expanded-nav');
        const content = document.querySelector('div#client-area > div#content');
        expandedNav.classList.toggle('expanded');
    
        if (expandedNav.classList.contains('expanded')) {
            content.style.marginLeft = '200px';
        } else {
            content.style.marginLeft = '20px';
        }
    });
    
}