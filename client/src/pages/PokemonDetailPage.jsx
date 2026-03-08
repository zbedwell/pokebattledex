import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { SectionCard } from "../components/SectionCard.jsx";
import { TypeBadge } from "../components/TypeBadge.jsx";
import { StatBar } from "../components/StatBar.jsx";
import { BattleTagBadge } from "../components/BattleTagBadge.jsx";
import { TypeEffectivenessPanel } from "../components/TypeEffectivenessPanel.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataStatusBanner } from "../components/DataStatusBanner.jsx";
import { EvolutionLine } from "../components/EvolutionLine.jsx";
import { statKeys } from "../utils/formatters.js";

export const PokemonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  const { data, loading, error } = useAsyncData(() => api.getPokemonDetail(id), [id]);

  useEffect(() => {
    api.getDataHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  if (loading) return <LoadingState label="Loading Pokemon battle profile..." />;
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState
          message={
            health?.seeded === false
              ? `${error} Database not seeded. Run: npm run setup`
              : error
          }
        />
        <DataStatusBanner health={health} />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="space-y-6">
      <DataStatusBanner health={health} />

      <PageHeader
        title={`${data.name} Battle Profile`}
        subtitle={data.battle_summary}
        actions={
          <button
            type="button"
            onClick={() => navigate(`/compare?ids=${data.id}`)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Compare This Pokemon
          </button>
        }
      />

      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              National Dex #{String(data.national_dex_number).padStart(3, "0")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <TypeBadge type={data.primary_type} />
              <TypeBadge type={data.secondary_type} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(data.role_tags || []).map((tag) => (
                <BattleTagBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              Base Stat Total: <span className="text-xl text-ink">{data.base_stat_total}</span>
            </div>
            {data.sprite_url && (
              <img src={data.sprite_url} alt={data.name} className="h-28 w-28 object-contain" loading="lazy" />
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Evolution Line">
        <EvolutionLine data={data.evolution_line} />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Base Stats">
          <div className="space-y-3">
            {statKeys.map(([key, label]) => (
              <StatBar key={key} label={label} value={data[key]} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Battle Insight Summary">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Strengths</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {(data.strengths || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Weaknesses</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {(data.weaknesses || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Type Matchup">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <TypeEffectivenessPanel
            title="4x Weaknesses"
            items={data.defensive_matchup?.weaknesses_4x || []}
            tone="danger"
          />
          <TypeEffectivenessPanel
            title="2x Weaknesses"
            items={data.defensive_matchup?.weaknesses_2x || []}
            tone="danger"
          />
          <TypeEffectivenessPanel
            title="Resists (0.5x)"
            items={data.defensive_matchup?.resistances_half || []}
            tone="safe"
          />
          <TypeEffectivenessPanel
            title="Resists (0.25x)"
            items={data.defensive_matchup?.resistances_quarter || []}
            tone="safe"
          />
          <TypeEffectivenessPanel
            title="Immunities"
            items={data.defensive_matchup?.immunities || []}
            tone="safe"
          />
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <h4 className="text-sm font-bold text-ink">Offensive STAB Coverage</h4>
          <p className="mt-1 text-sm text-slate-700">
            Super effective into: {(data.offensive_stab_coverage?.super_effective || []).join(", ") || "None"}
          </p>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Abilities">
          {(data.abilities || []).length === 0 ? (
            <EmptyState
              title="No ability data"
              message="This Pokemon currently has no ability rows in the dataset."
            />
          ) : (
            <div className="space-y-3">
              {(data.abilities || []).map((ability) => (
                <div key={`${ability.name}-${ability.slot_type}`} className="rounded-xl bg-slate-50 p-3">
                  <p className="font-semibold text-ink">
                    {ability.name} <span className="text-xs uppercase text-slate-500">({ability.slot_type})</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{ability.short_effect || ability.full_effect}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Notable Moves">
          {(data.notable_moves || []).length === 0 ? (
            <EmptyState
              title="No notable moves available"
              message="Move links are missing for this Pokemon in the current seed data."
            />
          ) : (
            <div className="space-y-2">
              {(data.notable_moves || []).slice(0, 12).map((move) => (
                <div key={move.id} className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <Link to={`/moves/${move.id}`} className="font-semibold text-ink hover:text-accent">
                      {move.name}
                    </Link>
                    <TypeBadge type={move.type} />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {move.category} | Power {move.power ?? "-"} | Accuracy {move.accuracy ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Similar Pokemon Suggestions">
        <div className="grid gap-3 md:grid-cols-3">
          {(data.similar_pokemon || []).map((pokemon) => (
            <Link
              key={pokemon.id}
              to={`/pokemon/${pokemon.id}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-accent"
            >
              <p className="font-semibold text-ink">{pokemon.name}</p>
              <div className="mt-2 flex gap-1">
                <TypeBadge type={pokemon.primary_type} />
                <TypeBadge type={pokemon.secondary_type} />
              </div>
              <p className="mt-2 text-xs text-slate-500">BST {pokemon.base_stat_total}</p>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
