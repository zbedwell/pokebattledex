const toNameMap = (types) => {
  const map = new Map();
  for (const type of types) {
    map.set(type.name.toLowerCase(), type.name);
  }
  return map;
};

export const normalizeTypeNames = (input, knownTypes) => {
  const mapper = toNameMap(knownTypes);
  const names = Array.isArray(input) ? input : [input];

  return names
    .filter(Boolean)
    .map((name) => mapper.get(String(name).toLowerCase().trim()))
    .filter(Boolean);
};

export const buildChartLookup = (chartRows) => {
  const lookup = new Map();
  for (const row of chartRows) {
    lookup.set(`${row.attacking_type}:${row.defending_type}`, Number(row.multiplier));
  }
  return lookup;
};

const getMultiplier = (lookup, attackingType, defendingType) => {
  return lookup.get(`${attackingType}:${defendingType}`) ?? 1;
};

export const computeDefensiveMatchup = ({ types, defendingTypes, lookup }) => {
  const summary = {
    weaknesses_4x: [],
    weaknesses_2x: [],
    resistances_half: [],
    resistances_quarter: [],
    immunities: [],
    by_type: {},
  };

  for (const attackingType of types) {
    const multiplier = defendingTypes.reduce((value, defendingType) => {
      return value * getMultiplier(lookup, attackingType.name, defendingType);
    }, 1);

    summary.by_type[attackingType.name] = multiplier;

    if (multiplier === 0) summary.immunities.push(attackingType.name);
    else if (multiplier >= 4) summary.weaknesses_4x.push(attackingType.name);
    else if (multiplier >= 2) summary.weaknesses_2x.push(attackingType.name);
    else if (multiplier <= 0.25) summary.resistances_quarter.push(attackingType.name);
    else if (multiplier <= 0.5) summary.resistances_half.push(attackingType.name);
  }

  return summary;
};

export const computeOffensiveCoverage = ({ types, attackingTypes, lookup }) => {
  const summary = {
    super_effective: [],
    neutral: [],
    resisted: [],
    no_effect: [],
    by_type: {},
  };

  for (const defendingType of types) {
    let best = 0;

    for (const attackingType of attackingTypes) {
      const multiplier = getMultiplier(lookup, attackingType, defendingType.name);
      if (multiplier > best) {
        best = multiplier;
      }
    }

    summary.by_type[defendingType.name] = best;

    if (best === 0) summary.no_effect.push(defendingType.name);
    else if (best >= 2) summary.super_effective.push(defendingType.name);
    else if (best < 1) summary.resisted.push(defendingType.name);
    else summary.neutral.push(defendingType.name);
  }

  return summary;
};

export const evaluateAttackAgainstTypes = ({ attackingType, defendingTypes, lookup }) => {
  return defendingTypes.reduce((value, defendingType) => {
    return value * getMultiplier(lookup, attackingType, defendingType);
  }, 1);
};
