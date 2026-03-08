import {
  buildChartLookup,
  computeDefensiveMatchup,
  computeOffensiveCoverage,
  evaluateAttackAgainstTypes,
  normalizeTypeNames,
} from "../utils/typeMath.js";
import { badRequest } from "../utils/httpErrors.js";

export const createTypeService = ({ typesRepository }) => {
  let cache;

  const getCache = async () => {
    if (!cache) {
      const [types, chartRows] = await Promise.all([
        typesRepository.listTypes(),
        typesRepository.getTypeChartRows(),
      ]);

      cache = {
        types,
        chartRows,
        lookup: buildChartLookup(chartRows),
      };
    }

    return cache;
  };

  const ensureKnownTypes = async (typeNames) => {
    const { types } = await getCache();
    const normalized = normalizeTypeNames(typeNames, types);

    if (normalized.length !== typeNames.length) {
      throw badRequest("One or more type names are invalid.", {
        received: typeNames,
      });
    }

    return normalized;
  };

  return {
    async listTypes() {
      const { types } = await getCache();
      return types;
    },

    async getTypeChart() {
      const { types, lookup } = await getCache();

      return types.map((attackingType) => ({
        attacking_type: attackingType.name,
        matchups: Object.fromEntries(
          types.map((defendingType) => [
            defendingType.name,
            lookup.get(`${attackingType.name}:${defendingType.name}`) ?? 1,
          ]),
        ),
      }));
    },

    async getDefensiveMatchup(typeNames) {
      const normalized = await ensureKnownTypes(typeNames);
      const { types, lookup } = await getCache();

      return computeDefensiveMatchup({
        types,
        defendingTypes: normalized,
        lookup,
      });
    },

    async getOffensiveCoverage(attackingTypeNames) {
      const normalized = await ensureKnownTypes(attackingTypeNames);
      const { types, lookup } = await getCache();

      return computeOffensiveCoverage({
        types,
        attackingTypes: normalized,
        lookup,
      });
    },

    async getMatchup(attackingTypeName, defendingTypeNames) {
      const [attacking] = await ensureKnownTypes([attackingTypeName]);
      const defending = await ensureKnownTypes(defendingTypeNames);
      const { lookup } = await getCache();

      return evaluateAttackAgainstTypes({
        attackingType: attacking,
        defendingTypes: defending,
        lookup,
      });
    },

    // Exposed for testing without database side effects.
    resetCache() {
      cache = undefined;
    },
  };
};
