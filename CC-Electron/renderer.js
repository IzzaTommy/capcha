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
    
    // document.querySelector('div#client-area > div#nav-pane').addEventListener('click', function() {
    //     const navPane = document.querySelector('div#client-area > div#nav-pane');
    //     const clientArea = document.querySelector('div#client-area');

    //     navPane.classList.toggle('expanded');
    
    //     if (navPane.classList.contains('expanded')) {
    //         clientArea.style.columnGap = 'var(--expanded-module-gap)';
    //     } else {
    //         clientArea.style.columnGap = 'var(--module-gap)';
    //     }
    // });

    buttonList = document.querySelectorAll('div#client-area > nav#nav-bar > button');

    for (const button of buttonList)
    {

        button.addEventListener('click', () => {
            const navPane = document.querySelector('div#client-area > div#nav-pane');
            const clientArea = document.querySelector('div#client-area');
    
            navPane.classList.toggle('expanded');
        
            if (navPane.classList.contains('expanded')) {
                clientArea.style.columnGap = 'var(--expanded-module-gap)';
            } else {
                clientArea.style.columnGap = 'var(--module-gap)';
            }
        });
    }
    
}