import { describe, expect, it } from "vitest";
import {
  buildChartLookup,
  computeDefensiveMatchup,
  computeOffensiveCoverage,
} from "../src/utils/typeMath.js";

const types = [
  { name: "Ice" },
  { name: "Dragon" },
  { name: "Grass" },
  { name: "Electric" },
  { name: "Ground" },
  { name: "Flying" },
];

const chartRows = [
  { attacking_type: "Ice", defending_type: "Dragon", multiplier: 2 },
  { attacking_type: "Ice", defending_type: "Grass", multiplier: 2 },
  { attacking_type: "Electric", defending_type: "Ground", multiplier: 0 },
];

describe("type matchup utilities", () => {
  it("computes 4x dual-type weaknesses", () => {
    const lookup = buildChartLookup(chartRows);
    const summary = computeDefensiveMatchup({
      types,
      defendingTypes: ["Dragon", "Grass"],
      lookup,
    });

    expect(summary.weaknesses_4x).toContain("Ice");
  });

  it("computes immunities when multiplier is zero", () => {
    const lookup = buildChartLookup(chartRows);
    const summary = computeDefensiveMatchup({
      types,
      defendingTypes: ["Ground"],
      lookup,
    });

    expect(summary.immunities).toContain("Electric");
  });

  it("computes offensive coverage categories", () => {
    const lookup = buildChartLookup(chartRows);
    const summary = computeOffensiveCoverage({
      types,
      attackingTypes: ["Ice"],
      lookup,
    });

    expect(summary.super_effective).toEqual(expect.arrayContaining(["Dragon", "Grass"]));
  });
});
