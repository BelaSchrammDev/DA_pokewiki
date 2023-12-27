
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


function stopPageScrolling() {
    document.body.addEventListener('wheel', preventScroll, {passive: false});
}


function allowPageScrolling() {
    document.body.removeEventListener('wheel', preventScroll, {passive: false});
}



function preventScroll(e){
    e.preventDefault();
    e.stopPropagation();
    return false;
}