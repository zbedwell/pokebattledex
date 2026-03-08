import { describe, expect, it } from "vitest";
import { deriveRoleTags } from "../src/utils/battleInsights.js";

describe("role tag rules", () => {
  it("assigns fast physical sweeper when speed and attack are high", () => {
    const tags = deriveRoleTags({
      hp: 70,
      attack: 120,
      defense: 60,
      special_attack: 70,
      special_defense: 60,
      speed: 120,
    });

    expect(tags).toContain("Fast Physical Sweeper");
  });

  it("assigns bulky wall for high overall bulk", () => {
    const tags = deriveRoleTags({
      hp: 105,
      attack: 60,
      defense: 120,
      special_attack: 65,
      special_defense: 125,
      speed: 45,
    });

    expect(tags).toContain("Bulky Wall");
  });

  it("assigns mixed offense when both offenses are high", () => {
    const tags = deriveRoleTags({
      hp: 80,
      attack: 115,
      defense: 75,
      special_attack: 105,
      special_defense: 75,
      speed: 95,
    });

    expect(tags).toContain("Mixed Offense");
  });
});
