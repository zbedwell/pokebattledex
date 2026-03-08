import { Link, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { SectionCard } from "../components/SectionCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

export const AbilityDetailPage = () => {
  const { id } = useParams();
  const { data, loading, error } = useAsyncData(() => api.getAbilityDetail(id), [id]);

  if (loading) return <LoadingState label="Loading ability details..." />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader title={data.name} subtitle={data.short_effect} />

      <SectionCard title="Full Effect">
        <p className="whitespace-pre-line text-sm text-slate-700">{data.full_effect}</p>
      </SectionCard>

      <SectionCard title="Battle Impact Note">
        <p className="text-sm text-slate-700">{data.battle_impact_note}</p>
      </SectionCard>

      <SectionCard title="Pokemon With This Ability">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(data.pokemon || []).map((pokemon) => (
            <Link
              key={pokemon.id}
              to={`/pokemon/${pokemon.id}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-ink hover:border-accent"
            >
              {pokemon.name}
              <span className="ml-2 text-xs uppercase text-slate-500">{pokemon.slot_type}</span>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
