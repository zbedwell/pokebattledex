import { describe, expect, it } from "vitest";
import { buildEvolutionEdgeKey, formatEvolutionDetails } from "../src/utils/evolutionLabels.js";

describe("evolutionLabels", () => {
  it("formats level-up requirements", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "level-up" },
        min_level: 16,
      },
    ]);

    expect(formatted.label).toBe("Level 16");
  });

  it("formats use-item requirements", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "use-item" },
        item: { name: "fire-stone" },
      },
    ]);

    expect(formatted.label).toBe("Use Fire Stone");
  });

  it("formats plain trade requirements", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "trade" },
      },
    ]);

    expect(formatted.label).toBe("Trade");
  });

  it("formats friendship + time-of-day requirements", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "level-up" },
        min_happiness: 220,
        time_of_day: "day",
      },
    ]);

    expect(formatted.label).toBe("High Friendship (Day)");
  });

  it("formats trade while holding item requirements", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "trade" },
        held_item: { name: "metal-coat" },
      },
    ]);

    expect(formatted.label).toBe("Trade while holding Metal Coat");
  });

  it("formats three-critical-hits trigger requirements", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "three-critical-hits" },
      },
    ]);

    expect(formatted.label).toBe("Land 3 critical hits in one battle, then level up");
  });

  it("formats use-move trigger requirements with count", () => {
    const formatted = formatEvolutionDetails([
      {
        trigger: { name: "use-move" },
        used_move: { name: "rage-fist" },
        min_move_count: 20,
      },
    ]);

    expect(formatted.label).toBe("Use Rage Fist 20 times, then level up");
  });

  it("falls back to special condition when details are missing", () => {
    const formatted = formatEvolutionDetails([]);
    expect(formatted.label).toBe("Special condition");
  });

  it("builds deterministic edge keys for override mapping", () => {
    expect(buildEvolutionEdgeKey(67, 133, 134)).toBe("chain:67:133->134");
  });
});
