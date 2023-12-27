let all_PokeMons = [];
let allPokemonJsons = {};
let lastShowPokemon = 0;
const loadCount = 30;


async function initPokemons() {
    await loadPokemonList()
    renderNextPokemons();
    addLoadByScrollBehavior();
}


function addLoadByScrollBehavior() {
    window.addEventListener('scroll', () => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
        if (lastShowPokemon < all_PokeMons.length && (scrollTop + clientHeight) >= scrollHeight - 200) renderNextPokemons();
    });
}


async function renderSinglePokemon(pokemonName) {
    const pokemon = await getPokemonObject(pokemonName);
    document.getElementById(pokemonName).innerHTML += `
    <div>
        <span> Name: ${pokemon['name']}</span>
        <img src="${pokemon['sprites']['front_default']}">
    </div>
    `;
}


async function loadPokemonList() {
    const url = `https://pokeapi.co/api/v2/pokemon-species/?limit=10000`;
    let response = await fetch(url);
    let responseAsJson = await response.json();
    all_PokeMons = responseAsJson.results;
}


async function renderNextPokemons() {
    const loadBegin = lastShowPokemon;
    const loadEnd = lastShowPokemon + loadCount;
    lastShowPokemon = loadEnd;
    for (let i = loadBegin; i < all_PokeMons.length && i < loadEnd; i++) {
        document.getElementById('main_content').innerHTML += getNewEmptyCard(all_PokeMons[i].name);
        renderSinglePokemon(all_PokeMons[i].name);
    }
}


function getNewEmptyCard(pokemonID) {
    return `<div class="pokemon_smallcard"><div id="${pokemonID}"></div></div>`
}


async function getPokemonObject(pokemonName) {
    if (!allPokemonJsons[pokemonName]) {
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
        let response = await fetch(url);
        allPokemonJsons[pokemonName] = await response.json();
    }
    return allPokemonJsons[pokemonName];
}