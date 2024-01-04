let all_PokeMons = [];
let allPokemonJsons = {};
let lastShowPokemon = 0;
let big_CardPositionRect = null;
const loadCount = 40;
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
    renderFirstPokemons();
    addLoadByScrollBehavior();
}


// get the pokemon JSON Object
// save the loadet pokemons in array, for later use, it is needed
async function getPokemonObjectByID(pokemonID) {
    if (!allPokemonJsons[pokemonID.name]) {
        let response = await fetch(pokemonID.url);
        allPokemonJsons[pokemonID.name] = await response.json();
    }
    return allPokemonJsons[pokemonID.name];
}


function addLoadByScrollBehavior() {
    window.addEventListener('scroll', () => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
        if (lastShowPokemon < all_PokeMons.length && (scrollTop + clientHeight) >= scrollHeight - 100) renderNextPokemons();
    });
}


async function renderSinglePokemonByID(pokemonID) {
    const pokemon = await getPokemonObjectByID(pokemonID);
    const card = document.getElementById(pokemonID.name);
    card.innerHTML += getPokemonCardHTML(pokemon);
}


function getPokemonCardHTML(pokemon) {
    return `
        <img class="pokemon_image" src="${getPokemonImageUrlOrDefault(pokemon)}"
        style="background: linear-gradient(45deg, white 0%, ${getPokemonTypeColor(pokemon, 0)} 100%">
        <span class="pokemon_name font_24b flex_grow_1">${getPascalCaseWord(pokemon['name'])}</span>
        ${getPokemonTypesHTML(pokemon)}
    `;
}


function getPascalCaseWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


// some pokemons are missing sprites
// in this case the default image is loaded
function getPokemonImageUrlOrDefault(pokemon){
    const imgURL = pokemon['sprites']['front_default'];
    return imgURL ? imgURL : './img/pokemon.png';
}


function getPokemonTypeColor(pokemon, slot) {
    if (slot > pokemon.types.length - 1) return '#FFFFFF';
    const firstType = pokemon.types[slot].type;
    if (firstType && typeColors.hasOwnProperty(firstType.name)) return typeColors[firstType.name];
    else typeColors.normal;
}


function getPokemonTypesHTML(pokemon) {
    let typesHTML = '';
    for (let index = 0; index < pokemon.types.length; index++) {
        const type = pokemon.types[index].type;
        typesHTML += `<span style="background-color: ${getPokemonTypeColor(pokemon, index)}">${type.name}</span>`;
    }
    return `
        <span class="font_16b p_1 border_t_b_1">Types</span>
        <div class="pokemon_types ${pokemon.types.length > 1 ? 'flex_r_jsb_ace' : 'flex_r_jfs_ace'}">
            ${typesHTML}
        </div>
    `;
}


async function loadPokemonList() {
    const url = `https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`;
    let response = await fetch(url);
    let responseAsJson = await response.json();
    all_PokeMons = responseAsJson.results;
}


function renderFirstPokemons() {
    lastShowPokemon = 0; // start by first pokemon
    document.getElementById('main_content').innerHTML = '';
    renderNextPokemons();
}


function renderNextPokemons() {
    if (lastShowPokemon == -1) return; // pokemonsearch is active
    const loadBegin = lastShowPokemon;
    const loadEnd = lastShowPokemon + loadCount;
    lastShowPokemon = loadEnd;
    addNextEmptyCards(loadBegin, loadEnd);
    for (let i = loadBegin; i < all_PokeMons.length && i < loadEnd; i++) {
        renderSinglePokemonByID(all_PokeMons[i]);
    }
}


// for speed up the loading of pokemons
function addNextEmptyCards(loadBegin, loadEnd) {
    let cardsHTML = '';
    for (let i = loadBegin; i < all_PokeMons.length && i < loadEnd; i++) {
        cardsHTML += getNewEmptyCard(all_PokeMons[i].name);
    }
    document.getElementById('main_content').innerHTML += cardsHTML;
}


function getNewEmptyCard(pokemonID) {
    return `
        <div id="div_${pokemonID}" onclick="clickPokemonSmallCard('${pokemonID}')" class="pokemon_smallcard">
            <div class="pokemon_innercard" id="${pokemonID}"></div>
        </div>
        `;
}


function renderPokemonsByFilter(filter) {
    lastShowPokemon = -1; // stop loading when scroll to botton
    filter = filter.toLowerCase();
    document.getElementById('main_content').innerHTML = '';
    for (let i = 0; i < all_PokeMons.length; i++) {
        const pokemonName = all_PokeMons[i].name;
        if (pokemonName.includes(filter)) {
            document.getElementById('main_content').innerHTML += getNewEmptyCard(pokemonName);
            renderSinglePokemonByID(all_PokeMons[i]);
        }    
    }    
}    


function clickPokemonSmallCard(pokemonID) {
    stopPageScrolling();
    const card = document.getElementById(pokemonID);
}


function clickOverlay() {
    const card = document.getElementById('overlay').children[0];
    allowPageScrolling();
}


