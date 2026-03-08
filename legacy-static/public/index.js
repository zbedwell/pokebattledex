document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemon-list');

    // Sample data; replace with actual data retrieval logic
    const pokemonData = [
        { id: '0001', name: 'Bulbasaur', image: 'https://img.pokemondb.net/artwork/large/bulbasaur.jpg' },
        { id: '0004', name: 'Charmander', image: 'https://www.pokemon.com/static-assets/content-assets/cms2/img/pokedex/full/004.png' },
        { id: '0007', name: 'Squirtle', image: 'https://img.pokemondb.net/artwork/large/squirtle.jpg' },
       
    ];

    pokemonData.forEach(pokemon => {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h3>${pokemon.name}</h3>
            <p>ID: ${pokemon.id}</p>
        `;
        pokemonList.appendChild(card);
    });
});
