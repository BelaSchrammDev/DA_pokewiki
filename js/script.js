let startY;


function init() {
    includeHTML();
    initPokemons();
}


async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            let htmlText = await resp.text();
            element.innerHTML = htmlText;
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


function showOverlay() { document.getElementById('overlay').style = `display: flex;`; }
function hideOverlay() { document.getElementById('overlay').style = `display: none;`; }


function stopPageScrolling() {
    const element = document.getElementById('overlay');
    document.body.addEventListener('wheel', preventScroll, { passive: false });
    document.body.addEventListener('touchmove', preventScroll, { passive: false });
    scrollBehavior();
}


function allowPageScrolling() {
    const element = document.getElementById('overlay');
    document.body.removeEventListener('wheel', preventScroll, { passive: false });
    document.body.removeEventListener('touchmove', preventScroll, { passive: false });
}


function preventClickEvent(event) { event.stopPropagation(); }


function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}


function scrollBehavior() {
    const scrollContainer = document.getElementById('pokemon_infos');

    scrollContainer.addEventListener('wheel', function (event) {
        event.preventDefault();
        scrollContainer.scrollTop += event.deltaY;
    });

    scrollContainer.addEventListener('touchstart', function (event) {
        startY = event.touches[0].clientY;
    });

    scrollContainer.addEventListener('touchmove', function (event) {
        event.preventDefault();
        const deltaY = event.touches[0].clientY - startY;
        scrollContainer.scrollTop -= deltaY;
        startY = event.touches[0].clientY;
    });
}
