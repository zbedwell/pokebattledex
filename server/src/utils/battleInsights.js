const pickHighestStat = (pokemon) => {
  const stats = {
    hp: pokemon.hp,
    attack: pokemon.attack,
    defense: pokemon.defense,
    special_attack: pokemon.special_attack,
    special_defense: pokemon.special_defense,
    speed: pokemon.speed,
  };

  return Object.entries(stats).sort((a, b) => b[1] - a[1])[0][0];
};

export const deriveRoleTags = (pokemon) => {
  const tags = new Set();
  const bulkScore = pokemon.hp + pokemon.defense + pokemon.special_defense;

  if (pokemon.speed >= 110 && pokemon.attack >= 100) {
    tags.add("Fast Physical Sweeper");
  }

  if (pokemon.speed >= 110 && pokemon.special_attack >= 100) {
    tags.add("Fast Special Sweeper");
  }

  if (pokemon.attack >= 110 && pokemon.special_attack >= 95) {
    tags.add("Mixed Offense");
  }

  if (bulkScore >= 280 && pokemon.speed <= 90) {
    tags.add("Bulky Wall");
  }

  if (pokemon.speed >= 95 && pokemon.attack + pokemon.special_attack >= 190) {
    tags.add("Speed Control");
  }

  if (pokemon.attack + pokemon.special_attack >= 220 && bulkScore < 230) {
    tags.add("Glass Cannon");
  }

  if (tags.size === 0) {
    const highest = pickHighestStat(pokemon);
    if (highest === "attack") tags.add("Physical Attacker");
    if (highest === "special_attack") tags.add("Special Attacker");
    if (highest === "defense" || highest === "special_defense" || highest === "hp") {
      tags.add("Utility Support");
    }
    if (highest === "speed") tags.add("Fast Utility");
  }

  return [...tags];
};

const hasRockWeakness = (defensiveMatchup) =>
  defensiveMatchup.weaknesses_4x.includes("Rock") || defensiveMatchup.weaknesses_2x.includes("Rock");

export const deriveStrengthSummary = (pokemon, defensiveMatchup, roleTags) => {
  const strengths = [];

  if (pokemon.speed >= 105) strengths.push("Excellent Speed tier");
  if (pokemon.attack >= 110) strengths.push("Strong physical pressure");
  if (pokemon.special_attack >= 110) strengths.push("Strong special pressure");
  if (pokemon.hp + pokemon.defense + pokemon.special_defense >= 270) {
    strengths.push("Reliable defensive bulk");
  }
  if (defensiveMatchup.immunities.length >= 1) strengths.push("Useful immunity profile");
  if (defensiveMatchup.resistances_half.length + defensiveMatchup.resistances_quarter.length >= 5) {
    strengths.push("Wide resistance coverage");
  }
  if (roleTags.includes("Utility Support")) strengths.push("Supports team utility roles");

  return strengths.slice(0, 4);
};

export const deriveWeaknessSummary = (pokemon, defensiveMatchup) => {
  const weaknesses = [];
  const physicalBulk = pokemon.hp + pokemon.defense;
  const specialBulk = pokemon.hp + pokemon.special_defense;

  if (physicalBulk < 140) weaknesses.push("Low physical bulk");
  if (specialBulk < 140) weaknesses.push("Low special bulk");
  if (defensiveMatchup.weaknesses_4x.length > 0) {
    weaknesses.push(`Has a 4x weakness (${defensiveMatchup.weaknesses_4x.join(", ")})`);
  }
  if (hasRockWeakness(defensiveMatchup)) weaknesses.push("Vulnerable to Stealth Rock pressure");
  if (pokemon.speed < 70) weaknesses.push("May struggle against faster threats");

  return weaknesses.slice(0, 4);
};

const statDistance = (a, b) => {
  const keys = ["hp", "attack", "defense", "special_attack", "special_defense", "speed"];
  return keys.reduce((sum, key) => sum + Math.abs(a[key] - b[key]), 0);
};

export const rankSimilarPokemon = ({ target, candidates, getAbilities, getTags }) => {
  const targetTypes = new Set([target.primary_type, target.secondary_type].filter(Boolean));
  const targetAbilities = new Set(getAbilities(target.id));
  const targetTags = new Set(getTags(target));

  return candidates
    .filter((pokemon) => pokemon.id !== target.id)
    .map((pokemon) => {
      const candidateTypes = new Set([pokemon.primary_type, pokemon.secondary_type].filter(Boolean));
      const candidateAbilities = new Set(getAbilities(pokemon.id));
      const candidateTags = new Set(getTags(pokemon));

      let score = 0;

      for (const type of targetTypes) {
        if (candidateTypes.has(type)) score += 3;
      }

      for (const ability of targetAbilities) {
        if (candidateAbilities.has(ability)) score += 2;
      }

      for (const tag of targetTags) {
        if (candidateTags.has(tag)) score += 1.5;
      }

      const distance = statDistance(target, pokemon);
      score += Math.max(0, 6 - distance / 35);

      return { pokemon, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.pokemon);
};
