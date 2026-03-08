import { notFound } from "../utils/httpErrors.js";

const createBattleImpact = (ability) => {
  const text = ability.full_effect || ability.short_effect || "";

  if (/entry|switch/i.test(text)) return "Activates around switch-in or entry events.";
  if (/immun|prevent/i.test(text)) return "Provides defensive utility by removing common threats.";
  if (/boost|raise/i.test(text)) return "Enables offensive pressure through stat or power boosts.";

  return "Offers matchup-specific utility in battle scenarios.";
};

export const createAbilitiesService = ({ abilitiesRepository }) => ({
  async listAbilities(filters) {
    const result = await abilitiesRepository.listAbilities(filters);

    return {
      data: result.rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        total_pages: Math.max(1, Math.ceil(result.total / filters.limit)),
      },
    };
  },

  async getAbilityDetail(identifier) {
    const ability = await abilitiesRepository.getAbilityByIdentifier(identifier);
    if (!ability) {
      throw notFound("Ability not found.");
    }

    const pokemon = await abilitiesRepository.getPokemonByAbility(ability.id);

    return {
      ...ability,
      battle_impact_note: createBattleImpact(ability),
      pokemon,
    };
  },
});
