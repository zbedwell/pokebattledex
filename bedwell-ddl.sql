CREATE TABLE pokemon (
    pokemon_id CHAR(4),
    pokemon_name VARCHAR(20) NOT NULL,
    hp INT NOT NULl,
    attack INT NOT NULL,
    defense INT NOT NULL,
    special_attack INT NOT NULL,
    special_defense INT NOT NULL,
    speed INT NOT NULL,
    dex_entry INT,
    PRIMARY KEY (pokemon_id)
);

INSERT INTO pokemon VALUES(0001, 'Bulbasaur', 45, 49, 49, 65, 65, 45, 001);
INSERT INTO pokemon VALUES(0004, 'Charmander', 39, 52, 43, 60, 50, 65, 004);
INSERT INTO pokemon VALUES(0007, 'Squirtle', 44, 48, 65, 50, 64, 43, 007);
INSERT INTO pokemon VALUES(0025, 'Pikachu', 35, 55, 40, 50, 50, 90, 025);
INSERT INTO pokemon VALUES(0133, 'Eevee', 55, 55, 50, 45, 65, 55, 133);