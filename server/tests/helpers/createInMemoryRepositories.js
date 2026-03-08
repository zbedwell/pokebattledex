const types = [
  { id: 1, name: "Fire" },
  { id: 2, name: "Water" },
  { id: 3, name: "Grass" },
  { id: 4, name: "Poison" },
  { id: 5, name: "Flying" },
  { id: 6, name: "Electric" },
  { id: 7, name: "Ground" },
  { id: 8, name: "Rock" },
  { id: 9, name: "Normal" },
  { id: 10, name: "Ghost" },
  { id: 11, name: "Ice" },
  { id: 12, name: "Fairy" },
];

const typeMultiplierMap = new Map();
for (const attacking of types) {
  for (const defending of types) {
    typeMultiplierMap.set(`${attacking.name}:${defending.name}`, 1);
  }
}

const setTypeMultiplier = (attacking, defending, multiplier) => {
  typeMultiplierMap.set(`${attacking}:${defending}`, multiplier);
};

setTypeMultiplier("Fire", "Grass", 2);
setTypeMultiplier("Fire", "Water", 0.5);
setTypeMultiplier("Fire", "Rock", 0.5);
setTypeMultiplier("Fire", "Fire", 0.5);

setTypeMultiplier("Water", "Fire", 2);
setTypeMultiplier("Water", "Grass", 0.5);
setTypeMultiplier("Water", "Rock", 2);
setTypeMultiplier("Water", "Ground", 2);

setTypeMultiplier("Grass", "Water", 2);
setTypeMultiplier("Grass", "Fire", 0.5);
setTypeMultiplier("Grass", "Rock", 2);
setTypeMultiplier("Grass", "Ground", 2);
setTypeMultiplier("Grass", "Flying", 0.5);
setTypeMultiplier("Grass", "Poison", 0.5);

setTypeMultiplier("Electric", "Water", 2);
setTypeMultiplier("Electric", "Flying", 2);
setTypeMultiplier("Electric", "Ground", 0);
setTypeMultiplier("Electric", "Grass", 0.5);

setTypeMultiplier("Ground", "Electric", 2);
setTypeMultiplier("Ground", "Fire", 2);
setTypeMultiplier("Ground", "Flying", 0);
setTypeMultiplier("Ground", "Poison", 2);
setTypeMultiplier("Ground", "Rock", 2);
setTypeMultiplier("Ground", "Grass", 0.5);

setTypeMultiplier("Rock", "Fire", 2);
setTypeMultiplier("Rock", "Flying", 2);
setTypeMultiplier("Rock", "Ground", 0.5);

setTypeMultiplier("Flying", "Grass", 2);
setTypeMultiplier("Poison", "Grass", 2);

const chartRows = [];
for (const attacking of types) {
  for (const defending of types) {
    chartRows.push({
      attacking_type: attacking.name,
      defending_type: defending.name,
      multiplier: typeMultiplierMap.get(`${attacking.name}:${defending.name}`),
    });
  }
}

const abilities = [
  {
    id: 1,
    name: "Blaze",
    short_effect: "Boosts Fire moves at low HP.",
    full_effect: "Strengthens Fire-type attacks when HP is low.",
    is_battle_relevant: true,
  },
  {
    id: 2,
    name: "Solar Power",
    short_effect: "Boosts Sp. Atk in sun but drains HP.",
    full_effect: "Raises Special Attack in harsh sunlight and drains HP each turn.",
    is_battle_relevant: true,
  },
  {
    id: 3,
    name: "Intimidate",
    short_effect: "Lowers foe Attack on entry.",
    full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.",
    is_battle_relevant: true,
  },
  {
    id: 4,
    name: "Overgrow",
    short_effect: "Boosts Grass moves at low HP.",
    full_effect: "Strengthens Grass-type attacks when HP is low.",
    is_battle_relevant: true,
  },
];

const moves = [
  {
    id: 1,
    name: "Flamethrower",
    type: "Fire",
    category: "Special",
    power: 90,
    accuracy: 100,
    pp: 15,
    short_effect: "Burn chance.",
    full_effect: "Has a chance to burn the target.",
    priority: 0,
  },
  {
    id: 2,
    name: "Air Slash",
    type: "Flying",
    category: "Special",
    power: 75,
    accuracy: 95,
    pp: 15,
    short_effect: "Flinch chance.",
    full_effect: "Has a chance to flinch the target.",
    priority: 0,
  },
  {
    id: 3,
    name: "Thunderbolt",
    type: "Electric",
    category: "Special",
    power: 90,
    accuracy: 100,
    pp: 15,
    short_effect: "Paralysis chance.",
    full_effect: "Has a chance to paralyze the target.",
    priority: 0,
  },
  {
    id: 4,
    name: "Hydro Pump",
    type: "Water",
    category: "Special",
    power: 110,
    accuracy: 80,
    pp: 5,
    short_effect: "Heavy Water damage.",
    full_effect: "Inflicts heavy Water-type damage.",
    priority: 0,
  },
  {
    id: 5,
    name: "Power Whip",
    type: "Grass",
    category: "Physical",
    power: 120,
    accuracy: 85,
    pp: 10,
    short_effect: "Strong Grass attack.",
    full_effect: "Inflicts heavy Grass-type damage.",
    priority: 0,
  },
  {
    id: 6,
    name: "Synthesis",
    type: "Grass",
    category: "Status",
    power: null,
    accuracy: null,
    pp: 5,
    short_effect: "Restores HP.",
    full_effect: "The user restores some of its HP.",
    priority: 0,
  },
  {
    id: 7,
    name: "Earthquake",
    type: "Ground",
    category: "Physical",
    power: 100,
    accuracy: 100,
    pp: 10,
    short_effect: "Strong Ground attack.",
    full_effect: "Inflicts Ground-type damage.",
    priority: 0,
  },
];

const pokemon = [
  {
    id: 4,
    national_dex_number: 4,
    name: "Charmander",
    primary_type: "Fire",
    secondary_type: null,
    hp: 39,
    attack: 52,
    defense: 43,
    special_attack: 60,
    special_defense: 50,
    speed: 65,
    base_stat_total: 309,
    sprite_url: "charmander.png",
    abilities: [{ name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." }],
  },
  {
    id: 5,
    national_dex_number: 5,
    name: "Charmeleon",
    primary_type: "Fire",
    secondary_type: null,
    hp: 58,
    attack: 64,
    defense: 58,
    special_attack: 80,
    special_defense: 65,
    speed: 80,
    base_stat_total: 405,
    sprite_url: "charmeleon.png",
    abilities: [{ name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." }],
  },
  {
    id: 6,
    national_dex_number: 6,
    name: "Charizard",
    primary_type: "Fire",
    secondary_type: "Flying",
    hp: 78,
    attack: 84,
    defense: 78,
    special_attack: 109,
    special_defense: 85,
    speed: 100,
    base_stat_total: 534,
    sprite_url: "charizard.png",
    abilities: [
      { name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." },
      { name: "Solar Power", slot_type: "hidden", short_effect: "Boosts Sp. Atk in sun." },
    ],
  },
  {
    id: 130,
    national_dex_number: 130,
    name: "Gyarados",
    primary_type: "Water",
    secondary_type: "Flying",
    hp: 95,
    attack: 125,
    defense: 79,
    special_attack: 60,
    special_defense: 100,
    speed: 81,
    base_stat_total: 540,
    sprite_url: "gyarados.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 3,
    national_dex_number: 3,
    name: "Venusaur",
    primary_type: "Grass",
    secondary_type: "Poison",
    hp: 80,
    attack: 82,
    defense: 83,
    special_attack: 100,
    special_defense: 100,
    speed: 80,
    base_stat_total: 525,
    sprite_url: "venusaur.png",
    abilities: [{ name: "Overgrow", slot_type: "primary", short_effect: "Boosts Grass moves at low HP." }],
  },
  {
    id: 24,
    national_dex_number: 24,
    name: "Arbok",
    primary_type: "Poison",
    secondary_type: null,
    hp: 60,
    attack: 95,
    defense: 69,
    special_attack: 65,
    special_defense: 79,
    speed: 80,
    base_stat_total: 448,
    sprite_url: "arbok.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 37,
    profile_key: "37",
    national_dex_number: 37,
    name: "Vulpix",
    is_regional_variant: false,
    primary_type: "Fire",
    secondary_type: null,
    hp: 38,
    attack: 41,
    defense: 40,
    special_attack: 50,
    special_defense: 65,
    speed: 65,
    base_stat_total: 299,
    sprite_url: "vulpix.png",
    abilities: [{ name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." }],
  },
  {
    id: 38,
    profile_key: "38",
    national_dex_number: 38,
    name: "Ninetales",
    is_regional_variant: false,
    primary_type: "Fire",
    secondary_type: null,
    hp: 73,
    attack: 76,
    defense: 75,
    special_attack: 81,
    special_defense: 100,
    speed: 100,
    base_stat_total: 505,
    sprite_url: "ninetales.png",
    abilities: [{ name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." }],
  },
  {
    id: 44,
    profile_key: "37-vulpix-alola",
    national_dex_number: 37,
    name: "Vulpix (Alolan)",
    is_regional_variant: true,
    primary_type: "Ice",
    secondary_type: null,
    hp: 38,
    attack: 41,
    defense: 40,
    special_attack: 50,
    special_defense: 65,
    speed: 65,
    base_stat_total: 299,
    sprite_url: "vulpix-alola.png",
    abilities: [{ name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." }],
  },
  {
    id: 520,
    profile_key: "52",
    national_dex_number: 52,
    name: "Meowth",
    is_regional_variant: false,
    primary_type: "Normal",
    secondary_type: null,
    hp: 40,
    attack: 45,
    defense: 35,
    special_attack: 40,
    special_defense: 40,
    speed: 90,
    base_stat_total: 290,
    sprite_url: "meowth.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 530,
    profile_key: "53",
    national_dex_number: 53,
    name: "Persian",
    is_regional_variant: false,
    primary_type: "Normal",
    secondary_type: null,
    hp: 65,
    attack: 70,
    defense: 60,
    special_attack: 65,
    special_defense: 65,
    speed: 115,
    base_stat_total: 440,
    sprite_url: "persian.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 521,
    profile_key: "52-meowth-galar",
    national_dex_number: 52,
    name: "Meowth (Galarian)",
    is_regional_variant: true,
    primary_type: "Steel",
    secondary_type: null,
    hp: 50,
    attack: 65,
    defense: 55,
    special_attack: 40,
    special_defense: 40,
    speed: 40,
    base_stat_total: 290,
    sprite_url: "meowth-galar.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 522,
    profile_key: "52-meowth-alola",
    national_dex_number: 52,
    name: "Meowth (Alolan)",
    is_regional_variant: true,
    primary_type: "Dark",
    secondary_type: null,
    hp: 40,
    attack: 35,
    defense: 35,
    special_attack: 50,
    special_defense: 40,
    speed: 90,
    base_stat_total: 290,
    sprite_url: "meowth-alola.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 531,
    profile_key: "53-persian-alola",
    national_dex_number: 53,
    name: "Persian (Alolan)",
    is_regional_variant: true,
    primary_type: "Dark",
    secondary_type: null,
    hp: 65,
    attack: 60,
    defense: 60,
    special_attack: 75,
    special_defense: 65,
    speed: 115,
    base_stat_total: 440,
    sprite_url: "persian-alola.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 864,
    profile_key: "863",
    national_dex_number: 863,
    name: "Perrserker",
    is_regional_variant: false,
    primary_type: "Steel",
    secondary_type: null,
    hp: 70,
    attack: 110,
    defense: 100,
    special_attack: 50,
    special_defense: 60,
    speed: 50,
    base_stat_total: 440,
    sprite_url: "perrserker.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 46,
    profile_key: "38-ninetales-alola",
    national_dex_number: 38,
    name: "Ninetales (Alolan)",
    is_regional_variant: true,
    primary_type: "Ice",
    secondary_type: "Fairy",
    hp: 73,
    attack: 67,
    defense: 75,
    special_attack: 81,
    special_defense: 100,
    speed: 109,
    base_stat_total: 505,
    sprite_url: "ninetales-alola.png",
    abilities: [{ name: "Blaze", slot_type: "primary", short_effect: "Boosts Fire moves at low HP." }],
  },
  {
    id: 133,
    national_dex_number: 133,
    name: "Eevee",
    primary_type: "Normal",
    secondary_type: null,
    hp: 55,
    attack: 55,
    defense: 50,
    special_attack: 45,
    special_defense: 65,
    speed: 55,
    base_stat_total: 325,
    sprite_url: "eevee.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 134,
    national_dex_number: 134,
    name: "Vaporeon",
    primary_type: "Water",
    secondary_type: null,
    hp: 130,
    attack: 65,
    defense: 60,
    special_attack: 110,
    special_defense: 95,
    speed: 65,
    base_stat_total: 525,
    sprite_url: "vaporeon.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 135,
    national_dex_number: 135,
    name: "Jolteon",
    primary_type: "Electric",
    secondary_type: null,
    hp: 65,
    attack: 65,
    defense: 60,
    special_attack: 110,
    special_defense: 95,
    speed: 130,
    base_stat_total: 525,
    sprite_url: "jolteon.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 613,
    profile_key: "562-yamask-galar",
    national_dex_number: 562,
    name: "Yamask (Galarian)",
    is_regional_variant: true,
    primary_type: "Ground",
    secondary_type: "Ghost",
    hp: 38,
    attack: 55,
    defense: 85,
    special_attack: 30,
    special_defense: 65,
    speed: 30,
    base_stat_total: 303,
    sprite_url: "yamask-galar.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 612,
    profile_key: "562",
    national_dex_number: 562,
    name: "Yamask",
    is_regional_variant: false,
    primary_type: "Ghost",
    secondary_type: null,
    hp: 38,
    attack: 30,
    defense: 85,
    special_attack: 55,
    special_defense: 65,
    speed: 30,
    base_stat_total: 303,
    sprite_url: "yamask.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 563,
    profile_key: "563",
    national_dex_number: 563,
    name: "Cofagrigus",
    is_regional_variant: false,
    primary_type: "Ghost",
    secondary_type: null,
    hp: 58,
    attack: 50,
    defense: 145,
    special_attack: 95,
    special_defense: 105,
    speed: 30,
    base_stat_total: 483,
    sprite_url: "cofagrigus.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 867,
    profile_key: "867",
    national_dex_number: 867,
    name: "Runerigus",
    is_regional_variant: false,
    primary_type: "Ground",
    secondary_type: "Ghost",
    hp: 58,
    attack: 95,
    defense: 145,
    special_attack: 50,
    special_defense: 105,
    speed: 30,
    base_stat_total: 483,
    sprite_url: "runerigus.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
  {
    id: 714,
    profile_key: "613",
    national_dex_number: 613,
    name: "Cubchoo",
    is_regional_variant: false,
    primary_type: "Ice",
    secondary_type: null,
    hp: 55,
    attack: 70,
    defense: 40,
    special_attack: 60,
    special_defense: 40,
    speed: 40,
    base_stat_total: 305,
    sprite_url: "cubchoo.png",
    abilities: [{ name: "Intimidate", slot_type: "primary", short_effect: "Lowers foe Attack on entry." }],
  },
];

const pokemonAbilities = {
  4: [
    {
      id: 1,
      name: "Blaze",
      short_effect: "Boosts Fire moves at low HP.",
      full_effect: "Strengthens Fire-type attacks when HP is low.",
      slot_type: "primary",
    },
  ],
  5: [
    {
      id: 1,
      name: "Blaze",
      short_effect: "Boosts Fire moves at low HP.",
      full_effect: "Strengthens Fire-type attacks when HP is low.",
      slot_type: "primary",
    },
  ],
  6: [
    { id: 1, name: "Blaze", short_effect: "Boosts Fire moves at low HP.", full_effect: "Strengthens Fire-type attacks when HP is low.", slot_type: "primary" },
    { id: 2, name: "Solar Power", short_effect: "Boosts Sp. Atk in sun but drains HP.", full_effect: "Raises Special Attack in harsh sunlight and drains HP each turn.", slot_type: "hidden" },
  ],
  130: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  3: [
    { id: 4, name: "Overgrow", short_effect: "Boosts Grass moves at low HP.", full_effect: "Strengthens Grass-type attacks when HP is low.", slot_type: "primary" },
  ],
  24: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  37: [
    { id: 1, name: "Blaze", short_effect: "Boosts Fire moves at low HP.", full_effect: "Strengthens Fire-type attacks when HP is low.", slot_type: "primary" },
  ],
  38: [
    { id: 1, name: "Blaze", short_effect: "Boosts Fire moves at low HP.", full_effect: "Strengthens Fire-type attacks when HP is low.", slot_type: "primary" },
  ],
  44: [
    { id: 1, name: "Blaze", short_effect: "Boosts Fire moves at low HP.", full_effect: "Strengthens Fire-type attacks when HP is low.", slot_type: "primary" },
  ],
  520: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  530: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  521: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  522: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  531: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  864: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  46: [
    { id: 1, name: "Blaze", short_effect: "Boosts Fire moves at low HP.", full_effect: "Strengthens Fire-type attacks when HP is low.", slot_type: "primary" },
  ],
  133: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  134: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  135: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  613: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  612: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  563: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  867: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
  714: [
    { id: 3, name: "Intimidate", short_effect: "Lowers foe Attack on entry.", full_effect: "Lowers the Attack stat of opposing Pokemon on switch-in.", slot_type: "primary" },
  ],
};

const pokemonMoves = {
  4: [{ ...moves[0], learn_method: "level_up", is_notable_battle_move: true }],
  5: [{ ...moves[0], learn_method: "level_up", is_notable_battle_move: true }],
  6: [
    { ...moves[0], learn_method: "level_up", is_notable_battle_move: true },
    { ...moves[1], learn_method: "level_up", is_notable_battle_move: true },
    { ...moves[2], learn_method: "machine", is_notable_battle_move: true },
    { ...moves[6], learn_method: "machine", is_notable_battle_move: true },
  ],
  130: [
    { ...moves[3], learn_method: "level_up", is_notable_battle_move: true },
    { ...moves[6], learn_method: "machine", is_notable_battle_move: true },
  ],
  3: [
    { ...moves[4], learn_method: "level_up", is_notable_battle_move: true },
    { ...moves[5], learn_method: "level_up", is_notable_battle_move: true },
  ],
  37: [{ ...moves[0], learn_method: "level_up", is_notable_battle_move: true }],
  38: [{ ...moves[0], learn_method: "level_up", is_notable_battle_move: true }],
  44: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  520: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  530: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  521: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  522: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  531: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  864: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  46: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  133: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  134: [{ ...moves[3], learn_method: "level_up", is_notable_battle_move: true }],
  135: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
  612: [{ ...moves[6], learn_method: "level_up", is_notable_battle_move: true }],
  613: [{ ...moves[6], learn_method: "level_up", is_notable_battle_move: true }],
  563: [{ ...moves[6], learn_method: "level_up", is_notable_battle_move: true }],
  867: [{ ...moves[6], learn_method: "level_up", is_notable_battle_move: true }],
  714: [{ ...moves[2], learn_method: "level_up", is_notable_battle_move: true }],
};

const paginate = (rows, page, limit) => {
  const offset = (page - 1) * limit;
  return rows.slice(offset, offset + limit);
};

const evolutionFamilies = [
  { family_id: 1, source_chain_id: 4, is_branched: false },
  { family_id: 2, source_chain_id: 67, is_branched: true },
  { family_id: 3, source_chain_id: 287, is_branched: true },
  { family_id: 4, source_chain_id: 38, is_branched: false },
  { family_id: 5, source_chain_id: 22, is_branched: true },
];

const evolutionNodesByFamily = {
  1: [
    { pokemon_id: 4, depth: 0, display_order: 0 },
    { pokemon_id: 5, depth: 1, display_order: 1 },
    { pokemon_id: 6, depth: 2, display_order: 2 },
  ],
  2: [
    { pokemon_id: 133, depth: 0, display_order: 0 },
    { pokemon_id: 134, depth: 1, display_order: 1 },
    { pokemon_id: 135, depth: 1, display_order: 2 },
  ],
  3: [
    { pokemon_id: 612, depth: 0, display_order: 0 },
    { pokemon_id: 613, depth: 0, display_order: 1 },
    { pokemon_id: 563, depth: 1, display_order: 2 },
    { pokemon_id: 867, depth: 1, display_order: 3 },
  ],
  4: [
    { pokemon_id: 37, depth: 0, display_order: 0 },
    { pokemon_id: 38, depth: 1, display_order: 1 },
  ],
  5: [
    { pokemon_id: 520, depth: 0, display_order: 0 },
    { pokemon_id: 530, depth: 1, display_order: 1 },
    { pokemon_id: 864, depth: 1, display_order: 2 },
  ],
};

const evolutionEdgesByFamily = {
  1: [
    {
      from_pokemon_id: 4,
      to_pokemon_id: 5,
      label: "Level 16",
      tooltip: "Level 16",
      sort_order: 0,
    },
    {
      from_pokemon_id: 5,
      to_pokemon_id: 6,
      label: "Level 36",
      tooltip: "Level 36",
      sort_order: 1,
    },
  ],
  2: [
    {
      from_pokemon_id: 133,
      to_pokemon_id: 134,
      label: "Use Water Stone",
      tooltip: "Use Water Stone",
      sort_order: 0,
    },
    {
      from_pokemon_id: 133,
      to_pokemon_id: 135,
      label: "Use Thunder Stone",
      tooltip: "Use Thunder Stone",
      sort_order: 1,
    },
  ],
  3: [
    {
      from_pokemon_id: 612,
      to_pokemon_id: 563,
      label: "Level 34",
      tooltip: "Level 34",
      sort_order: 0,
    },
    {
      from_pokemon_id: 613,
      to_pokemon_id: 867,
      label: "Take 49+ damage in battle, then pass under the Dusty Bowl arch",
      tooltip: "Galarian Yamask only.",
      sort_order: 1,
    },
  ],
  4: [
    {
      from_pokemon_id: 37,
      to_pokemon_id: 38,
      label: "Use Ice Stone",
      tooltip: "Use Ice Stone",
      sort_order: 0,
    },
  ],
  5: [
    {
      from_pokemon_id: 520,
      to_pokemon_id: 530,
      label: "Level 28 or Level up (High Friendship)",
      tooltip: "Level 28 OR Level up: High Friendship",
      sort_order: 0,
    },
    {
      from_pokemon_id: 520,
      to_pokemon_id: 864,
      label: "Level 28",
      tooltip: "Level 28",
      sort_order: 1,
    },
  ],
};

const pokemonToEvolutionFamily = new Map([
  [4, 1],
  [5, 1],
  [6, 1],
  [133, 2],
  [134, 2],
  [135, 2],
  [612, 3],
  [613, 3],
  [563, 3],
  [867, 3],
  [37, 4],
  [38, 4],
  [520, 5],
  [530, 5],
  [864, 5],
]);

const toPokemonSummary = (pokemonId) => {
  const entry = pokemon.find((item) => item.id === pokemonId);
  if (!entry) {
    return null;
  }

  return {
    id: entry.id,
    name: entry.name,
    national_dex_number: entry.national_dex_number,
    sprite_url: entry.sprite_url,
    primary_type: entry.primary_type,
    secondary_type: entry.secondary_type,
  };
};

export const createInMemoryRepositories = (options = {}) => {
  const seeded = options.seeded ?? true;
  const missingTables = options.missingTables ?? [];

  const pokemonRepository = {
    async listPokemon(filters = {}) {
      let rows = pokemon;

      if (filters.q) {
        rows = rows.filter((entry) => entry.name.toLowerCase().includes(filters.q.toLowerCase()));
      }

      if (filters.type) {
        rows = rows.filter(
          (entry) =>
            entry.primary_type.toLowerCase() === filters.type.toLowerCase() ||
            entry.secondary_type?.toLowerCase() === filters.type.toLowerCase(),
        );
      }

      if (filters.ability) {
        rows = rows.filter((entry) =>
          entry.abilities.some((ability) => ability.name.toLowerCase() === filters.ability.toLowerCase()),
        );
      }

      const minFilters = [
        ["min_hp", "hp"],
        ["min_attack", "attack"],
        ["min_defense", "defense"],
        ["min_special_attack", "special_attack"],
        ["min_special_defense", "special_defense"],
        ["min_speed", "speed"],
      ];

      for (const [filterName, statField] of minFilters) {
        if (filters[filterName] !== undefined) {
          rows = rows.filter((entry) => entry[statField] >= filters[filterName]);
        }
      }

      return rows;
    },

    async getPokemonByIdentifier(identifier) {
      const numeric = Number(identifier);
      if (Number.isFinite(numeric)) {
        const byId = pokemon.find((entry) => entry.id === numeric);
        if (byId) {
          return byId;
        }

        return (
          pokemon.find(
            (entry) =>
              entry.national_dex_number === numeric &&
              !Boolean(entry.is_regional_variant),
          ) ??
          pokemon.find((entry) => entry.national_dex_number === numeric) ??
          null
        );
      }
      return (
        pokemon.find((entry) => entry.name.toLowerCase() === String(identifier).toLowerCase()) ??
        pokemon.find((entry) => String(entry.profile_key || "").toLowerCase() === String(identifier).toLowerCase()) ??
        null
      );
    },

    async getPokemonByIds(ids) {
      return pokemon.filter((entry) => ids.includes(entry.id));
    },

    async getPokemonMoves(pokemonId) {
      return pokemonMoves[pokemonId] ?? [];
    },

    async getPokemonAbilities(pokemonId) {
      return pokemonAbilities[pokemonId] ?? [];
    },

    async getPokemonSummaryById(pokemonId) {
      return toPokemonSummary(pokemonId);
    },

    async getDefaultPokemonByDex(dexNumber) {
      return (
        pokemon.find(
          (entry) =>
            entry.national_dex_number === Number(dexNumber) &&
            !Boolean(entry.is_regional_variant),
        ) ?? null
      );
    },

    async getPokemonByProfileKey(profileKey) {
      if (!profileKey) {
        return null;
      }

      return (
        pokemon.find(
          (entry) => String(entry.profile_key || "").toLowerCase() === String(profileKey).toLowerCase(),
        ) ?? null
      );
    },

    async getRegionalVariantsByDexAndToken(dexNumbers, token) {
      const dexSet = new Set((dexNumbers || []).map((value) => Number(value)));
      const normalizedToken = String(token || "").toLowerCase();

      return pokemon
        .filter((entry) => dexSet.has(Number(entry.national_dex_number)))
        .filter((entry) => Boolean(entry.is_regional_variant))
        .filter((entry) => String(entry.profile_key || "").toLowerCase().includes(`-${normalizedToken}`))
        .map((entry) => ({
          id: entry.id,
          profile_key: entry.profile_key,
          national_dex_number: entry.national_dex_number,
          name: entry.name,
          sprite_url: entry.sprite_url,
          primary_type: entry.primary_type,
          secondary_type: entry.secondary_type,
        }));
    },

    async getEvolutionFamilyByPokemonId(pokemonId) {
      const familyId = pokemonToEvolutionFamily.get(pokemonId);
      if (!familyId) {
        return null;
      }

      const family = evolutionFamilies.find((entry) => entry.family_id === familyId);
      return family ?? null;
    },

    async getEvolutionNodesByFamilyId(familyId) {
      const nodes = evolutionNodesByFamily[familyId] ?? [];
      return nodes
        .map((node) => {
          const pokemonSummary = toPokemonSummary(node.pokemon_id);
          if (!pokemonSummary) {
            return null;
          }

          return {
            pokemon_id: node.pokemon_id,
            name: pokemonSummary.name,
            dex_number: pokemonSummary.national_dex_number,
            sprite_url: pokemonSummary.sprite_url,
            primary_type: pokemonSummary.primary_type,
            secondary_type: pokemonSummary.secondary_type,
            depth: node.depth,
            display_order: node.display_order,
          };
        })
        .filter(Boolean);
    },

    async getEvolutionEdgesByFamilyId(familyId) {
      return evolutionEdgesByFamily[familyId] ?? [];
    },

    async listAbilityNamesByPokemon() {
      return Object.entries(pokemonAbilities).flatMap(([pokemonId, rows]) =>
        rows.map((row) => ({ pokemon_id: Number(pokemonId), ability_name: row.name })),
      );
    },

    async searchPokemon(q, limit = 6) {
      return pokemon
        .filter((entry) => entry.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, limit)
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          national_dex_number: entry.national_dex_number,
        }));
    },

    async searchPokemonOptions(q, limit = 10) {
      const normalized = q.toLowerCase();
      return pokemon
        .filter((entry) => entry.name.toLowerCase().includes(normalized))
        .sort((a, b) => {
          const aPrefix = a.name.toLowerCase().startsWith(normalized);
          const bPrefix = b.name.toLowerCase().startsWith(normalized);

          if (aPrefix !== bPrefix) {
            return aPrefix ? -1 : 1;
          }

          return a.name.localeCompare(b.name);
        })
        .slice(0, limit)
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          national_dex_number: entry.national_dex_number,
          sprite_url: entry.sprite_url,
          primary_type: entry.primary_type,
          secondary_type: entry.secondary_type,
        }));
    },
  };

  const movesRepository = {
    async listMoves(filters) {
      let rows = moves;

      if (filters.q) rows = rows.filter((entry) => entry.name.toLowerCase().includes(filters.q.toLowerCase()));
      if (filters.type) rows = rows.filter((entry) => entry.type.toLowerCase() === filters.type.toLowerCase());
      if (filters.category) rows = rows.filter((entry) => entry.category === filters.category);
      if (filters.min_power !== undefined) rows = rows.filter((entry) => (entry.power ?? 0) >= filters.min_power);
      if (filters.max_power !== undefined) rows = rows.filter((entry) => (entry.power ?? 0) <= filters.max_power);
      if (filters.min_accuracy !== undefined) {
        rows = rows.filter((entry) => (entry.accuracy ?? 100) >= filters.min_accuracy);
      }
      if (filters.is_status === true) rows = rows.filter((entry) => entry.category === "Status");
      if (filters.is_status === false) rows = rows.filter((entry) => entry.category !== "Status");

      const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
      return {
        rows: paginate(sorted, filters.page, filters.limit),
        total: sorted.length,
      };
    },

    async getMoveByIdentifier(identifier) {
      const numeric = Number(identifier);
      if (Number.isFinite(numeric)) {
        return moves.find((entry) => entry.id === numeric) ?? null;
      }

      return moves.find((entry) => entry.name.toLowerCase() === String(identifier).toLowerCase()) ?? null;
    },

    async getPokemonByMove(moveId) {
      return pokemon
        .filter((entry) => (pokemonMoves[entry.id] ?? []).some((move) => move.id === moveId))
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          national_dex_number: entry.national_dex_number,
          sprite_url: entry.sprite_url,
        }));
    },

    async searchMoves(q, limit = 6) {
      return moves
        .filter((entry) => entry.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, limit)
        .map((entry) => ({ id: entry.id, name: entry.name }));
    },
  };

  const abilitiesRepository = {
    async listAbilities(filters) {
      let rows = abilities.map((ability) => ({
        ...ability,
        pokemon_count: Object.values(pokemonAbilities).filter((entries) =>
          entries.some((entry) => entry.name === ability.name),
        ).length,
      }));

      if (filters.q) {
        rows = rows.filter((entry) => entry.name.toLowerCase().includes(filters.q.toLowerCase()));
      }

      const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));

      return {
        rows: paginate(sorted, filters.page, filters.limit),
        total: sorted.length,
      };
    },

    async getAbilityByIdentifier(identifier) {
      const numeric = Number(identifier);
      const ability = Number.isFinite(numeric)
        ? abilities.find((entry) => entry.id === numeric)
        : abilities.find((entry) => entry.name.toLowerCase() === String(identifier).toLowerCase());

      if (!ability) return null;

      const pokemonCount = Object.values(pokemonAbilities).filter((entries) =>
        entries.some((entry) => entry.name === ability.name),
      ).length;

      return {
        ...ability,
        pokemon_count: pokemonCount,
      };
    },

    async getPokemonByAbility(abilityId) {
      const ability = abilities.find((entry) => entry.id === abilityId);
      if (!ability) return [];

      return pokemon
        .filter((entry) => (pokemonAbilities[entry.id] ?? []).some((item) => item.name === ability.name))
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          national_dex_number: entry.national_dex_number,
          sprite_url: entry.sprite_url,
          slot_type: (pokemonAbilities[entry.id] ?? []).find((item) => item.name === ability.name)?.slot_type,
        }));
    },

    async searchAbilities(q, limit = 6) {
      return abilities
        .filter((entry) => entry.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, limit)
        .map((entry) => ({ id: entry.id, name: entry.name }));
    },
  };

  const typesRepository = {
    async listTypes() {
      return types;
    },

    async getTypeChartRows() {
      return chartRows;
    },

    async searchTypes(q, limit = 6) {
      return types
        .filter((entry) => entry.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, limit)
        .map((entry) => ({ id: entry.id, name: entry.name }));
    },
  };

  const healthRepository = {
    async getTablePresence() {
      return {
        required: [
          "types",
          "pokemon",
          "abilities",
          "moves",
          "pokemon_abilities",
          "pokemon_moves",
          "type_effectiveness",
          "evolution_families",
          "evolution_nodes",
          "evolution_edges",
        ],
        missing: missingTables,
      };
    },

    async getSeedCounts() {
      if (!seeded) {
        return { pokemon: 0, moves: 0 };
      }

      return {
        pokemon: pokemon.length,
        moves: moves.length,
      };
    },
  };

  return {
    pokemonRepository,
    movesRepository,
    abilitiesRepository,
    typesRepository,
    healthRepository,
  };
};
