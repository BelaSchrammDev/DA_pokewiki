let all_PokeMons = [];
let allPokemonJsons = {};
let lastShowPokemon = 0;
let big_CardPositionRect = null;
const loadCount = 30;
const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
};



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
    const card = document.getElementById(pokemonName);
    card.innerHTML += getPokemonCardHTML(pokemon);
    card.style = `background-color: ${getPokemonMainTypeColor(pokemon)}`;
}


function getPokemonCardHTML(pokemon) {
    return `
        <div class="flex_c_jfs_ast flex_gap_2">
            <img class="pokemon_image" src="${pokemon['sprites']['front_default']}">
            <span class="pokemon_name font_24b">${pokemon['name']}</span>
            ${getPokemonTypesHTML(pokemon)}
        </div>
    `;
}


function getPokemonMainTypeColor(pokemon) {
    const firstType = pokemon.types[0].type;
    if (firstType && typeColors.hasOwnProperty(firstType.name)) return typeColors[firstType.name];
    else typeColors.normal;
}


function getPokemonTypesHTML(pokemon) {
    let typesHTML = '';
    for (let index = 0; index < pokemon.types.length; index++) {
        const type = pokemon.types[index].type;
        typesHTML += `<span>${type.name}</span>`;
    }
    return typesHTML;
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
    return `
        <div id="div_${pokemonID}" onclick="clickPokemonSmallCard('${pokemonID}')" class="pokemon_smallcard">
            <div class="pokemon_innercard" id="${pokemonID}"></div>
        </div>
        `;
}


function clickPokemonSmallCard(pokemonID) {
    stopPageScrolling();
    const card = document.getElementById(pokemonID);
}


function clickOverlay() {
    const card = document.getElementById('overlay').children[0];
    allowPageScrolling();
}


async function getPokemonObject(pokemonName) {
    if (!allPokemonJsons[pokemonName]) {
        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
        let response = await fetch(url);
        allPokemonJsons[pokemonName] = await response.json();
    }
    return allPokemonJsons[pokemonName];
}