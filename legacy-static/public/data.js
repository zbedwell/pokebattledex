// Load Pokémon data from the REST API
function loadPokemonData() {
  fetch('/pokemon') // Fetch all Pokémon from the REST API
    .then(response => response.json())
    .then(data => displayPokemonData(data))
    .catch(error => console.error('Error fetching Pokémon:', error));
}

// Display Pokémon data dynamically
function displayPokemonData(data) {
  const container = document.getElementById('myPokemon');

  // Clear existing content for dynamic updates
  container.innerHTML = "";

  // Create a table to display Pokémon data
  const table = document.createElement('table');
  table.classList.add('pokemon-table');

  // Add a header row
  const headerRow = document.createElement('tr');
  const headers = ['ID', 'Name', 'HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed', 'Dex Entry', 'Generation'];
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Loop through the Pokémon data and create rows
  data.forEach(item => {
    const row = document.createElement('tr');
    const { pokemon_id, pokemon_name, hp, attack, defense, special_attack, special_defense, speed, dex_entry, generation_number } = item;

    const values = [pokemon_id, pokemon_name, hp, attack, defense, special_attack, special_defense, speed, dex_entry, generation_number];
    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  container.appendChild(table);
}

// Add a new Pokémon to the database
function addPokemon(event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(document.getElementById('pokemon_form'));
  const data = Object.fromEntries(formData.entries());

  // Ensure generation is mapped correctly (e.g., "Kanto" => "01")
  if (data.generation === "Kanto") {
    data.generation = "01";
  }

  fetch('/pokemon', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => { throw new Error(text); });
      }
      return response.text();
    })
    .then(data => {
      console.log('Success:', data); // Log the server's response
      loadPokemonData(); // Reload Pokémon data
    })
    .catch(error => {
      console.error('Error:', error);
      alert(`Failed to add Pokémon: ${error.message}`);
    });

  return false; // Prevent page reload
}
