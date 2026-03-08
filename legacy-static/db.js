import pkg from 'tunnel-ssh';
const { createTunnel } = pkg;
import pkg2 from 'pg';
const { Pool } = pkg2;
import pkg3 from 'fs';
const { readFileSync } = pkg3;

let sshOptions = {
    host: process.env.SSH_HOST,
    port: 22,
    username: process.env.SSH_USER,
    privateKey: readFileSync(process.env.SSH_PRIVATE_KEY),
	passphrase: process.env.DATABASE_PASSWORD
};

let tunnelOptions = {
	autoClose: true
};

let forwardOptions = {
	srcAddr: process.env.LOCAL_HOST,
	srcPort: process.env.LOCAL_PORT,
	dstAddr: process.env.REMOTE_HOST,
    dstPort: process.env.REMOTE_PORT
};

let serverOptions = {
	port: process.env.LOCAL_PORT
};

let connection = new Promise(function(resolve, reject){
	
	createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions).
		then(([server, client], error)=>{

			server.on('error',(e)=>{
				console.log(e);
			});

			client.on('error',(e)=>{
				console.log(e);
			});

			console.log('database connection initalizing');

			//use `postgres` connection as usual
			var db = new Pool({
					database: process.env.DATABASE_NAME,
					port:     process.env.LOCAL_PORT,
					user:     process.env.SSH_USER,
					password:	process.env.DATABASE_PASSWORD
			});

		// send back the connection to the database
		// once the asynchronous ssh connection is made
		resolve(db)
	});
});

 /***********************************************/
 /* EXAMPLE FUNCTIONS--WILL NOT WORK IN YOUR DB */
 /***********************************************/

// Get all classes
const getClasses = (request, response) => {
	connection.then((conn) => {
    conn.query('SELECT * FROM classes', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
 });
};

// Get classes by ID
const getClassesById = (request, response) => {
	connection.then((conn) => {
  	const id = request.params.id;

  	conn.query('SELECT * FROM classes WHERE id = $1', [id], (error, results) => {
	    if (error) {
	      throw error;
	    }
	    response.status(200).json(results.rows);
  	});
	});
};

// Add a new class
const addClass = (request, response) => {
	connection.then((conn) => {
  	const { id, title, semester, year } = request.body;

  	conn.query('INSERT INTO classes VALUES ($1, $2, $3, $4)', [id, title, semester, year], (error, results) => {
	    if (error) {
	      throw error;
	    }
	    response.status(201).send(`Class added with ID: ${id}`);
  	});
	});
};


 /***********************************************/
 /*       CRUD FUNCTIONS FOR YOUR PROJECT       */
 /***********************************************/

// READ data from your database using a SELECT query

// Get all pokemon
const getPokemon = (request, response) => {
	connection.then((conn) => {
		conn.query('SELECT * FROM project.pokemon', (error, results) => {
			if (error) {
				throw error;
			}
			response.status(200).json(results.rows);
		});
	});
};

// Add a new pokemon
const addPokemon = (request, response) => {
	connection.then((conn) => {
	  const {
		pokemon_id,
		pokemon_name,
		hp,
		attack,
		defense,
		special_attack,
		special_defense,
		speed,
		dex_entry,
		generation
	  } = request.body;
  
	  // Map generation names to numbers
	  const generationMapping = {
		"Kanto": "01"
	  };
  
	  const generation_number = generationMapping[generation];
  
	  if (!generation_number) {
		response.status(400).send("Invalid generation.");
		return;
	  }
  
	  conn.query(
		`INSERT INTO project.pokemon 
		(pokemon_id, pokemon_name, hp, attack, defense, special_attack, special_defense, speed, dex_entry, generation_number) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		[pokemon_id, pokemon_name, hp, attack, defense, special_attack, special_defense, speed, dex_entry, generation_number],
		(error, results) => {
		  if (error) {
			console.error("Database error:", error);
			response.status(500).send("Error adding Pokémon");
		  } else {
			response.status(201).send(`Pokémon added with ID: ${pokemon_id}`);
		  }
		}
	  );
	});
  };
  
  


// Update an existing row using UPDATE
const updatePokemon = (request, response) => {
	connection.then((conn) => {
		const { pokemon_id, hp, attack, defense, special_attack, special_defense, speed } = request.body;

		conn.query(
			`
			UPDATE project.pokemon
			SET hp = $1, attack = $2, defense = $3, special_attack = $4, special_defense = $5, speed = $6
			WHERE pokemon_id = $7
			`,
			[hp, attack, defense, special_attack, special_defense, speed, pokemon_id],
			(error, results) => {
				if(error) {
console.log(`Printing error: ${error}`);
if(error.code == '23505'){
response.status(500).send(`Input already exists!`);
}
}
				if (results.rowCount === 0) {
					response.status(404).send(`Pokemon with ID: ${pokemon_id} not found`);
				} else {
					response.status(200).send(`Pokemon updated with ID: ${pokemon_id}`);
				}
			}
		);
	});
};

// Delete an existing row using DELETE
const deletePokemon = (request, response) => {
	connection.then((conn) => {
		const { pokemon_id } = request.params;

		conn.query(
			'DELETE FROM project.pokemon WHERE pokemon_id = $1',
			[pokemon_id],
			(error, results) => {
				if (error) {
					throw error;
				}
				if (results.rowCount === 0) {
					response.status(404).send(`Pokemon with ID: ${pokemon_id} not found`);
				} else {
					response.status(200).send(`Pokemon deleted with ID: ${pokemon_id}`);
				}
			}
		);
	});
};

// Export the database connection and CRUD functions
export default {
	connection,
	getPokemon,
	addPokemon,
	updatePokemon,
	deletePokemon,
};
