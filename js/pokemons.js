let all_PokeMons = [];
let allPokemonJsons = {};
let lastShowPokemon = 0;
let searchInputWidth = 130;


async function initPokemons() {
    await loadPokemonList()
    renderFirstPokemons();
    addLoadByScrollBehavior();
    setPokemonBigCardEvolutionHTML();
}


function addLoadByScrollBehavior() {
    window.addEventListener('scroll', () => {
        const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
        if (lastShowPokemon < all_PokeMons.length && (scrollTop + clientHeight) >= scrollHeight - 100) renderNextPokemons();
    });
}


async function loadPokemonList() {
    const url = `https://pokeapi.co/api/v2/pokemon-species?limit=100000&offset=0`;
    let response = await fetch(url);
    let responseAsJson = await response.json();
    all_PokeMons = responseAsJson.results;
}


/**
 * get the pokemon JSON Object
 * save the loadet pokemons in array, for later use, it is needed
 * @param {*} pokemonID - pokemonJSON from pokemon-species fetch, only name an url property
 * @returns - pokemonJSON Object
 */
async function getPokemonObjectByID(pokemonID) {
    if (!pokemonID) return undefined;
    if (!allPokemonJsons[pokemonID.name]) {
        let speciesJSON = await fetchAndGetJSON(pokemonID.url);
        let evolutionJSON = await fetchAndGetJSON(speciesJSON.evolution_chain.url);
        let pokemonJSON = await fetchAndGetJSON('https://pokeapi.co/api/v2/pokemon/' + speciesJSON.id);
        allPokemonJsons[pokemonID.name] = createNewPokemonObject(speciesJSON, pokemonJSON, evolutionJSON);
    }
    return allPokemonJsons[pokemonID.name];
}


function findPokemonID_ByName(pokemonName) { return all_PokeMons.find(({ name }) => name === pokemonName); }


async function fetchAndGetJSON(url) {
    let response = await fetch(url);
    return await response.json();
}


// pull all required data from the api into a separate JSON object
function createNewPokemonObject(species, pokemon, evolution) {
    let newPokemonObject = new Object();
    newPokemonObject.name = getPascalCaseWord(species.name);
    newPokemonObject.pokemonID = species.name;
    addPokemonTypes(newPokemonObject, pokemon);
    copyPropertys(newPokemonObject, species, ['id', 'base_happiness', 'capture_rate', 'hatch_counter']);
    copyPropertys(newPokemonObject, pokemon, ['height', 'weight']);
    copyStats(newPokemonObject, pokemon.stats);
    newPokemonObject.image = getPokemonImageUrlOrDefault(pokemon);
    newPokemonObject.evolutions = getEvolutionsArray(evolution);
    return newPokemonObject;
}


function copyStats(newPokemonObject, stats) {
    let stat_maxvalue = 0;
    for (let index = 0; index < stats.length; index++) {
        const statItem = stats[index];
        newPokemonObject[statItem.stat.name] = statItem.base_stat;
        if (stat_maxvalue < statItem.base_stat) stat_maxvalue = statItem.base_stat;
    }
    newPokemonObject['stat_maxvalue'] = Math.max(100, stat_maxvalue);
}


function copyPropertys(newPokemonObject, sourceObject, fields) {
    for (let index = 0; index < fields.length; index++) {
        const field = fields[index];
        if (sourceObject[field]) newPokemonObject[field] = sourceObject[field];
    }
}


function addPokemonTypes(newPokemonObject, pokemon) {
    newPokemonObject.type1 = pokemon.types[0].type.name;
    newPokemonObject.type2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : '---';
}


function getEvolutionsArray(evolution) {
    let evoArray = [];
    evoArray.push(evolution.chain.species.name);
    if (evolution.chain.evolves_to.length > 0) {
        evoArray.push(evolution.chain.evolves_to[0].species.name);
        if (evolution.chain.evolves_to[0].evolves_to.length > 0) {
            evoArray.push(evolution.chain.evolves_to[0].evolves_to[0].species.name);
        }
    }
    return evoArray;
}


async function renderSinglePokemonByID(pokemonID) {
    const pokemon = await getPokemonObjectByID(pokemonID);
    const card = document.getElementById(pokemonID.name);
    card.innerHTML += getPokemonCardHTML(pokemon);
}


function getPokemonCardHTML(pokemon) {
    return `
        <img class="pokemon_image" src="${pokemon.image}"
        style="background: linear-gradient(45deg, white 0%, ${getPokemonTypeColor(pokemon.type1)} 100%">
        <span class="pokemon_name font_24b flex_grow_1">${pokemon.name}</span>
        ${getPokemonTypesHTML(pokemon)}
    `;
}

/**
 * converts a string to pascalcase
 * 
 * @param {string} word - string that be converted
 * @returns - to pascalcase converted string
 */
function getPascalCaseWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}


// some pokemons are missing sprites
// in this case the default image is loaded
function getPokemonImageUrlOrDefault(pokemon) {
    const imgURL = pokemon['sprites']['other']['official-artwork']['front_default'];
    return imgURL ? imgURL : './img/pokemon.png';
}


function getPokemonTypeColor(type) {
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
    if (type == undefined) return '#FFFFFF';
    if (typeColors.hasOwnProperty(type)) return typeColors[type];
    else typeColors.normal;
}


function getPokemonTypesHTML(pokemon) {
    let typesHTML = getTypeSpan(pokemon.type1) + getTypeSpan(pokemon.type2);
    return `
        <span class="font_16b p_1 border_t_b_1">Types</span>
        <div class="pokemon_types ${pokemon.type2 != '---' ? 'flex_r_jsb_ace' : 'flex_r_jfs_ace'}">
            ${typesHTML}
        </div>
    `;
}


function getTypeSpan(type) {
    if (type == '---') return '';
    return `<span style="background-color: ${getPokemonTypeColor(type)}">${type}</span>`
}


function renderFirstPokemons() {
    lastShowPokemon = 0; // start by first pokemon
    document.getElementById('main_content').innerHTML = '';
    renderNextPokemons();
}


function renderNextPokemons() {
    const loadCount = 40;
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
        <div id="div_${pokemonID}" onclick="openBigCard('${pokemonID}')" class="pokemon_smallcard">
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


function openBigCard(pokemonID) {
    stopPageScrolling();
    showOverlay()
    renderPokemonToBigcard(pokemonID);
    showPokemonBigCard();
}


function closeBigCard() {
    hidePokemonBigCard();
    hideOverlay();
    allowPageScrolling();
    setPokemonBigCardEvolutionHTML();
}


async function renderPokemonToBigcard(pokemonID) {
    const pokemon = allPokemonJsons[pokemonID];
    document.getElementById('pokemon_big_image').src = pokemon.image;
    renderBigFields(pokemon);
    renderStats(pokemon);
    await renderEvolutions(pokemon);
}


async function renderEvolutions(pokemon) {
    let evolutionsHTML = '';
    for (let index = 0; index < pokemon.evolutions.length; index++) {
        const pokemonName = pokemon.evolutions[index];
        const pokemonEvoJSON = await getPokemonObjectByID(findPokemonID_ByName(pokemonName));
        evolutionsHTML += getSingleEvolutionHTML(pokemon.name == pokemonEvoJSON.name, pokemonEvoJSON);
    }
    setPokemonBigCardEvolutionHTML(evolutionsHTML);
}


function setPokemonBigCardEvolutionHTML(evoHTML) {
    document.getElementById('pokemon_evolutions').innerHTML = evoHTML ? evoHTML : '<span>Loading...</span>';
}


function getSingleEvolutionHTML(selfPokemon, pokemonJSON) {
    return `
        <div class="pokemon_single_evolution${selfPokemon ? ' pokemon_single_evolution_normal"' : ` pokemon_single_evolution_highlight" onclick="renderPokemonToBigcard('${pokemonJSON.pokemonID}')"`}>
            <img src="${pokemonJSON.image}">
            <span class="font_16b">${pokemonJSON.name}</span>
        </div>`;
}


function renderStats(pokemon) {
    const renderFields = ['hp', 'attack', 'speed', 'special-attack', 'special-defense', 'defense',];
    for (let index = 0; index < renderFields.length; index++) {
        const field = renderFields[index];
        const barElement = document.getElementById('pokemon_big_' + field);
        barElement.innerHTML = pokemon[field];
        barElement.style = `width: ${Math.min(pokemon[field], 100)}%`;
        barElement.style = `width: ${pokemon[field] * 100 / pokemon['stat_maxvalue']}%`;
    }
}


function renderBigFields(pokemon) {
    const renderFields = ['name', 'type1', 'type2', 'height', 'weight', 'base_happiness', 'capture_rate', 'hatch_counter',];
    for (let index = 0; index < renderFields.length; index++) {
        const field = renderFields[index];
        document.getElementById('pokemon_big_' + field).innerHTML = pokemon[field];
    }
}


function clickShowFiltered() {
    renderPokemonsByFilter(document.getElementById('search_inputField').value.toLowerCase());
}

function searchKeyChange() {
    const searchInput = document.getElementById('search_inputField');
    const newFilter = searchInput.value.toLowerCase();
    searchInputWidth = searchInput.clientWidth - searchInput.clientHeight;
    setFilterCount(newFilter);
}


function setFilterCount(filter) {
    const newFilter = filter.toLowerCase();
    let filterCount = 0;
    all_PokeMons.forEach(element => { if (element.name.includes(newFilter)) filterCount++; });
    setFilterButton(filter, filterCount);
}


function setFilterButton(filter, filterCount) {
    const showBTN = document.getElementById('search_showBTN');
    showBTN.style = `left: ${filter == '' ? 0 : searchInputWidth}px`;
    showBTN['disabled'] = filterCount == 0;
    showBTN.innerHTML = (filter == '' ? 0 : filterCount) + ' found';
}


function showPokemonBigCard() { document.getElementById('pokemon_biginfo').classList.add('pokemon_biginfo_show') }
function hidePokemonBigCard() { document.getElementById('pokemon_biginfo').classList.remove('pokemon_biginfo_show') }