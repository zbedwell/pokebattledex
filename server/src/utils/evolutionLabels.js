const SPECIAL_NAME_MAP = new Map([
  ["nidoran-f", "Nidoran F"],
  ["nidoran-m", "Nidoran M"],
  ["mr-mime", "Mr. Mime"],
  ["mime-jr", "Mime Jr."],
  ["mr-rime", "Mr. Rime"],
  ["farfetchd", "Farfetch'd"],
  ["sirfetchd", "Sirfetch'd"],
  ["ho-oh", "Ho-Oh"],
  ["porygon-z", "Porygon-Z"],
]);

const toDisplayName = (slug) => {
  if (!slug) {
    return "";
  }

  if (SPECIAL_NAME_MAP.has(slug)) {
    return SPECIAL_NAME_MAP.get(slug);
  }

  return String(slug)
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const normalizeTimeOfDay = (value) => {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const normalizeRelativeStatRule = (value) => {
  if (value === 1) return "Attack > Defense";
  if (value === -1) return "Attack < Defense";
  if (value === 0) return "Attack = Defense";
  return null;
};

const buildDetailParts = (detail) => {
  const parts = [];

  if (detail.min_level) {
    parts.push(`Level ${detail.min_level}`);
  }

  if (detail.item?.name) {
    parts.push(`Use ${toDisplayName(detail.item.name)}`);
  }

  if (detail.held_item?.name) {
    parts.push(`Hold ${toDisplayName(detail.held_item.name)}`);
  }

  if (detail.location?.name) {
    parts.push(`At ${toDisplayName(detail.location.name)}`);
  }

  if (detail.known_move?.name) {
    parts.push(`Know ${toDisplayName(detail.known_move.name)}`);
  }

  if (detail.used_move?.name) {
    parts.push(`Use ${toDisplayName(detail.used_move.name)}`);
  }

  if (Number.isInteger(detail.min_move_count) && detail.min_move_count > 0) {
    parts.push(`Count: ${detail.min_move_count} uses`);
  }

  if (Number.isInteger(detail.min_steps) && detail.min_steps > 0) {
    parts.push(`${detail.min_steps} steps`);
  }

  if (Number.isInteger(detail.min_damage_taken) && detail.min_damage_taken > 0) {
    parts.push(`Take ${detail.min_damage_taken}+ damage`);
  }

  if (detail.known_move_type?.name) {
    parts.push(`Know a ${toDisplayName(detail.known_move_type.name)}-type move`);
  }

  if (detail.party_species?.name) {
    parts.push(`With ${toDisplayName(detail.party_species.name)} in party`);
  }

  if (detail.party_type?.name) {
    parts.push(`With ${toDisplayName(detail.party_type.name)}-type in party`);
  }

  if (detail.min_happiness) {
    parts.push("High Friendship");
  }

  if (detail.min_beauty) {
    parts.push("High Beauty");
  }

  if (detail.min_affection) {
    parts.push("High Affection");
  }

  if (detail.time_of_day) {
    parts.push(`Time: ${normalizeTimeOfDay(detail.time_of_day)}`);
  }

  if (detail.gender === 1) {
    parts.push("Female");
  } else if (detail.gender === 2) {
    parts.push("Male");
  }

  const relativeRule = normalizeRelativeStatRule(detail.relative_physical_stats);
  if (relativeRule) {
    parts.push(relativeRule);
  }

  if (detail.trade_species?.name) {
    parts.push(`Trade for ${toDisplayName(detail.trade_species.name)}`);
  }

  if (detail.needs_overworld_rain) {
    parts.push("During rain");
  }

  if (detail.needs_multiplayer) {
    parts.push("Multiplayer required");
  }

  if (detail.base_form_id) {
    parts.push("Specific form required");
  }

  if (detail.turn_upside_down) {
    parts.push("Turn device upside down");
  }

  return parts;
};

const formatSingleEvolutionDetail = (detail = {}) => {
  const trigger = detail.trigger?.name ?? null;

  if (trigger === "three-critical-hits") {
    return {
      label: "Land 3 critical hits in one battle, then level up",
      tooltip: "Land 3 critical hits in one battle, then level up.",
    };
  }

  if (trigger === "use-move") {
    const moveName = detail.used_move?.name ? toDisplayName(detail.used_move.name) : null;
    const count = Number.isInteger(detail.min_move_count) ? detail.min_move_count : null;

    if (moveName && count && count > 0) {
      return {
        label: `Use ${moveName} ${count} times, then level up`,
        tooltip: `Use ${moveName} ${count} times, then level up.`,
      };
    }

    if (moveName) {
      return {
        label: `Use ${moveName}, then level up`,
        tooltip: `Use ${moveName}, then level up.`,
      };
    }

    if (count && count > 0) {
      return {
        label: `Use required move ${count} times, then level up`,
        tooltip: `Use the required move ${count} times, then level up.`,
      };
    }
  }

  if (trigger === "take-damage") {
    if (Number.isInteger(detail.min_damage_taken) && detail.min_damage_taken > 0) {
      return {
        label: `Take ${detail.min_damage_taken}+ damage in battle, then level up`,
        tooltip: `Take at least ${detail.min_damage_taken} damage in battle, then level up.`,
      };
    }

    return {
      label: "Take damage in battle, then level up",
      tooltip: "Take required damage in battle, then level up.",
    };
  }

  if (trigger === "trade" && detail.held_item?.name) {
    const itemName = toDisplayName(detail.held_item.name);
    const tradeFor = detail.trade_species?.name
      ? ` for ${toDisplayName(detail.trade_species.name)}`
      : "";
    return {
      label: `Trade while holding ${itemName}${tradeFor}`,
      tooltip: `Trigger: Trade; hold ${itemName}${tradeFor}`.trim(),
    };
  }

  if (trigger === "trade") {
    const tradeFor = detail.trade_species?.name
      ? ` for ${toDisplayName(detail.trade_species.name)}`
      : "";
    return {
      label: `Trade${tradeFor}`,
      tooltip: `Trigger: Trade${tradeFor}`.trim(),
    };
  }

  if (trigger === "use-item" && detail.item?.name) {
    const itemName = toDisplayName(detail.item.name);
    const parts = buildDetailParts(detail).filter((part) => part !== `Use ${itemName}`);
    return {
      label: `Use ${itemName}`,
      tooltip: parts.length > 0 ? `Use ${itemName}; ${parts.join(", ")}` : `Use ${itemName}`,
    };
  }

  if (detail.min_happiness && detail.time_of_day) {
    return {
      label: `High Friendship (${normalizeTimeOfDay(detail.time_of_day)})`,
      tooltip: `Level up with high friendship during ${normalizeTimeOfDay(detail.time_of_day).toLowerCase()}.`,
    };
  }

  if (detail.min_level) {
    const parts = buildDetailParts(detail).filter((part) => part !== `Level ${detail.min_level}`);
    return {
      label: `Level ${detail.min_level}`,
      tooltip: parts.length > 0 ? `Level ${detail.min_level}; ${parts.join(", ")}` : `Level ${detail.min_level}`,
    };
  }

  if (trigger === "level-up") {
    const parts = buildDetailParts(detail);
    if (parts.length > 0) {
      return {
        label: `Level up (${parts[0]})`,
        tooltip: `Level up: ${parts.join(", ")}`,
      };
    }

    return {
      label: "Level up",
      tooltip: "Level up",
    };
  }

  if (trigger === "shed") {
    return {
      label: "Special condition",
      tooltip: "Special shed evolution condition.",
    };
  }

  const parts = buildDetailParts(detail);
  if (parts.length > 0) {
    return {
      label: parts[0],
      tooltip: parts.join(", "),
    };
  }

  return {
    label: "Special condition",
    tooltip: trigger ? `Trigger: ${toDisplayName(trigger)}` : null,
  };
};

export const formatEvolutionDetails = (details = []) => {
  const entries = Array.isArray(details) ? details : [details];
  const normalized = entries
    .filter(Boolean)
    .map((entry) => formatSingleEvolutionDetail(entry))
    .filter(Boolean);

  if (normalized.length === 0) {
    return {
      label: "Special condition",
      tooltip: null,
    };
  }

  if (normalized.length === 1) {
    return normalized[0];
  }

  return {
    label: normalized.map((entry) => entry.label).join(" or "),
    tooltip: normalized
      .map((entry) => entry.tooltip || entry.label)
      .filter(Boolean)
      .join(" OR "),
  };
};

export const buildEvolutionEdgeKey = (sourceChainId, fromPokemonId, toPokemonId) =>
  `chain:${sourceChainId}:${fromPokemonId}->${toPokemonId}`;

export const buildEvolutionNodeKey = (sourceChainId, pokemonId) =>
  `chain:${sourceChainId}:${pokemonId}`;
