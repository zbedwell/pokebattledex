CREATE TABLE IF NOT EXISTS battleex.pokemon_learnsets (
  pokemon_id INT PRIMARY KEY REFERENCES battleex.pokemon(id) ON DELETE CASCADE,
  learnset JSONB NOT NULL
);
