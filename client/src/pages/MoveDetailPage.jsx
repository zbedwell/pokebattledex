import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { SectionCard } from "../components/SectionCard.jsx";
import { TypeBadge } from "../components/TypeBadge.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataStatusBanner } from "../components/DataStatusBanner.jsx";

export const MoveDetailPage = () => {
  const { id } = useParams();
  const [health, setHealth] = useState(null);
  const { data, loading, error } = useAsyncData(() => api.getMoveDetail(id), [id]);

  useEffect(() => {
    api.getDataHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  if (loading) return <LoadingState label="Loading move details..." />;
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

  const badgeLabels = Object.entries(data.badges || {})
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.replaceAll("_", " "));

  return (
    <div className="space-y-6">
      <DataStatusBanner health={health} />

      <PageHeader
        title={data.name}
        subtitle={data.short_effect}
        actions={<TypeBadge type={data.type} />}
      />

      <SectionCard>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-500">Category</p>
            <p className="text-base font-bold text-ink">{data.category}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-500">Power / Accuracy</p>
            <p className="text-base font-bold text-ink">
              {data.power ?? "-"} / {data.accuracy ?? "-"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-500">PP / Priority</p>
            <p className="text-base font-bold text-ink">
              {data.pp} / {data.priority}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Effect">
        <p className="whitespace-pre-line text-sm text-slate-700">{data.full_effect}</p>
      </SectionCard>

      <SectionCard title="Battle Tags">
        <div className="flex flex-wrap gap-2">
          {badgeLabels.length === 0 && <span className="text-sm text-slate-500">No special tags identified.</span>}
          {badgeLabels.map((label) => (
            <span key={label} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">
              {label}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Pokemon That Learn This Move">
        {(data.learned_by || []).length === 0 ? (
          <EmptyState
            title="No linked Pokemon"
            message="This move currently has no Pokemon associations in the dataset."
          />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(data.learned_by || []).map((pokemon) => (
              <Link
                key={pokemon.id}
                to={`/pokemon/${pokemon.id}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-ink hover:border-accent"
              >
                {pokemon.name}
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
