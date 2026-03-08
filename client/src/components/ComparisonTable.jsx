import { TypeBadge } from "./TypeBadge.jsx";
import { statKeys } from "../utils/formatters.js";

export const ComparisonTable = ({ data, highlights }) => {
  if (!data || data.length === 0) return null;

  const winnerCards = [
    { label: "Highest Speed", value: highlights?.highest_speed || "N/A" },
    { label: "Highest Attack", value: highlights?.highest_attack || "N/A" },
    { label: "Highest Sp. Attack", value: highlights?.highest_special_attack || "N/A" },
    { label: "Highest Physical Bulk", value: highlights?.highest_physical_bulk || "N/A" },
    { label: "Highest Special Bulk", value: highlights?.highest_special_bulk || "N/A" },
    { label: "Most Resistances", value: highlights?.most_resistances || "N/A" },
    { label: "Fewest Weaknesses", value: highlights?.fewest_weaknesses || "N/A" },
    {
      label: "Shared Weaknesses",
      value: (highlights?.shared_weaknesses || []).join(", ") || "None",
    },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="font-display text-xl font-bold text-ink">A. Quick Winner Cards</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {winnerCards.map((card) => (
            <div key={card.label} className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
              <p className="mt-1 font-bold text-ink">{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="font-display text-xl font-bold text-ink">B. Stat Table</h2>
        <table className="mt-3 min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-2 py-2 text-left font-bold text-slate-600">Metric</th>
              {data.map((pokemon) => (
                <th key={pokemon.id} className="px-2 py-2 text-left">
                  <div className="font-display text-base font-bold text-ink">{pokemon.name}</div>
                  <div className="mt-1 flex gap-1">
                    <TypeBadge type={pokemon.primary_type} />
                    <TypeBadge type={pokemon.secondary_type} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statKeys.map(([key, label]) => (
              <tr key={key} className="border-b border-slate-100">
                <td className="px-2 py-2 font-semibold text-slate-600">{label}</td>
                {data.map((pokemon) => (
                  <td key={`${pokemon.id}-${key}`} className="px-2 py-2 font-semibold text-ink">
                    {pokemon.stats[key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-slate-100">
              <td className="px-2 py-2 font-semibold text-slate-600">Base Stat Total</td>
              {data.map((pokemon) => (
                <td key={`${pokemon.id}-bst`} className="px-2 py-2 font-semibold text-ink">
                  {pokemon.stats.base_stat_total}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-2 py-2 font-semibold text-slate-600">Resistances + Immunities</td>
              {data.map((pokemon) => (
                <td key={`${pokemon.id}-resist`} className="px-2 py-2 font-semibold text-ink">
                  {pokemon.resistance_count}
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-2 py-2 font-semibold text-slate-600">Weaknesses (2x + 4x)</td>
              {data.map((pokemon) => (
                <td key={`${pokemon.id}-weak`} className="px-2 py-2 font-semibold text-ink">
                  {pokemon.weakness_count}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-2 py-2 font-semibold text-slate-600">Top Role Tags</td>
              {data.map((pokemon) => (
                <td key={`${pokemon.id}-tags`} className="px-2 py-2 text-slate-700">
                  {(pokemon.role_tags || []).slice(0, 2).join(", ") || "None"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="font-display text-xl font-bold text-ink">C. Defensive Profile</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.map((pokemon) => (
            <article key={`${pokemon.id}-defense`} className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold text-ink">{pokemon.name}</p>

              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">4x Weaknesses</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(pokemon.defensive_matchup?.weaknesses_4x || []).map((type) => (
                  <TypeBadge key={`${pokemon.id}-w4-${type}`} type={type} />
                ))}
                {(pokemon.defensive_matchup?.weaknesses_4x || []).length === 0 && (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>

              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">2x Weaknesses</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(pokemon.defensive_matchup?.weaknesses_2x || []).map((type) => (
                  <TypeBadge key={`${pokemon.id}-w2-${type}`} type={type} />
                ))}
                {(pokemon.defensive_matchup?.weaknesses_2x || []).length === 0 && (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>

              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Immunities</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(pokemon.defensive_matchup?.immunities || []).map((type) => (
                  <TypeBadge key={`${pokemon.id}-imm-${type}`} type={type} />
                ))}
                {(pokemon.defensive_matchup?.immunities || []).length === 0 && (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="font-display text-xl font-bold text-ink">D. Utility Snapshot</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.map((pokemon) => (
            <article key={`${pokemon.id}-utility`} className="rounded-xl bg-slate-50 p-3">
              <p className="font-semibold text-ink">{pokemon.name}</p>

              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Abilities</p>
              <p className="mt-1 text-sm text-slate-700">
                {(pokemon.abilities || []).map((ability) => ability.name).join(", ") || "None"}
              </p>

              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Notable Moves</p>
              <p className="mt-1 text-sm text-slate-700">
                {(pokemon.notable_moves || []).map((move) => move.name).join(", ") || "None"}
              </p>

              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">Role Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(pokemon.role_tags || []).map((tag) => (
                  <span
                    key={`${pokemon.id}-${tag}`}
                    className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
                {(pokemon.role_tags || []).length === 0 && (
                  <span className="text-xs text-slate-500">None</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
