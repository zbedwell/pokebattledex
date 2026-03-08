// Load Pokémon data from the REST API
async function loadPokemonData() {
  try {
    // Replace 'YOUR_API_ENDPOINT' with your actual database API endpoint
    const response = await fetch('YOUR_API_ENDPOINT');
    const data = await response.json();
    
    const pokemonList = document.getElementById('myPokemon');
    pokemonList.innerHTML = ''; // Clear existing content
    
    data.forEach(pokemon => {
      pokemonList.innerHTML += `
        <div class="pokemon-card">
          <h3>${pokemon.pokemon_name}</h3>
          <p>ID: ${pokemon.pokemon_id}</p>
          <p>HP: ${pokemon.hp}</p>
          <p>Attack: ${pokemon.attack}</p>
          <p>Defense: ${pokemon.defense}</p>
          <p>Special Attack: ${pokemon.special_attack}</p>
          <p>Special Defense: ${pokemon.special_defense}</p>
          <p>Speed: ${pokemon.speed}</p>
          <p>Dex Entry: ${pokemon.dex_entry}</p>
          <p>Generation: ${pokemon.generation_number}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('myPokemon').innerHTML = 'Error loading Pokemon data';
  }
}

// Add a new Pokémon to the database
async function addPokemon(event) {
  event.preventDefault();
  
  // Get form data
  const formData = {
    pokemon_id: document.getElementById('pokemon_id').value,
    pokemon_name: document.getElementById('pokemon_name').value,
    hp: document.getElementById('hp').value,
    attack: document.getElementById('attack').value,
    defense: document.getElementById('defense').value,
    special_attack: document.getElementById('special_attack').value,
    special_defense: document.getElementById('special_defense').value,
    speed: document.getElementById('speed').value,
    dex_entry: document.getElementById('dex_entry').value,
    generation_number: document.getElementById('generation_number').value
  };

  try {
    // Replace 'YOUR_API_ENDPOINT' with your actual database API endpoint
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    alert('Pokemon added successfully!');
    document.getElementById('pokemon_form').reset();
    
    // Optionally refresh the Pokemon list
    loadPokemonData();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to add Pokemon. Please try again.');
  }
}
