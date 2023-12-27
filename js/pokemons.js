let all_PokeMons = [];
let lastShowPokemon = 0;
const loadCount = 30;


async function initPokemons() {
    await loadPokemonList()
    renderNextPokemons();
}


async function renderSinglePokemon(namePokemon) {
    const url = `https://pokeapi.co/api/v2/pokemon/${namePokemon}`;
    let response = await fetch(url);
    let responseAsJson = await response.json();
    document.getElementById(namePokemon).innerHTML += `
    <div>
        <span> Name: ${responseAsJson['name']}</span>
        <img src="${responseAsJson['sprites']['front_default']}">
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
    const loadLimit = lastShowPokemon + loadCount;
    for (let i = lastShowPokemon; i < all_PokeMons.length && i < loadLimit; i++, lastShowPokemon++) {
        document.getElementById('main_content').innerHTML += getNewEmptyCard(all_PokeMons[i].name);
        renderSinglePokemon(all_PokeMons[i].name);
    }
}


function getNewEmptyCard(pokemonID) {
    return `<div class="pokemon_smallcard"><div id="${pokemonID}"></div></div>`
}