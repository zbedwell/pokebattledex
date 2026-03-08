export const toPercent = (value) => `${Math.round(value)}%`;

export const toTitleCase = (value) =>
  String(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const getStatColor = (value) => {
  if (value >= 120) return "bg-emerald-500";
  if (value >= 90) return "bg-sky-500";
  if (value >= 70) return "bg-amber-500";
  return "bg-rose-500";
};

export const stringifyTypes = (primaryType, secondaryType) =>
  [primaryType, secondaryType].filter(Boolean).join("/");

export const statKeys = [
  ["hp", "HP"],
  ["attack", "Attack"],
  ["defense", "Defense"],
  ["special_attack", "Sp. Atk"],
  ["special_defense", "Sp. Def"],
  ["speed", "Speed"],
];
