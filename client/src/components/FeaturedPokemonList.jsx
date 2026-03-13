import { Link } from "react-router-dom";
import { TypeBadge } from "./TypeBadge.jsx";

export const FeaturedPokemonList = ({
  title,
  description,
  items = [],
  metricLabel,
  getMetricValue,
  emptyMessage = "No data available.",
}) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-card">
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}

      {items.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((pokemon) => (
            <li key={pokemon.id}>
              <Link
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 transition hover:border-cyan-200 hover:bg-white"
                to={`/pokemon/${pokemon.id}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {pokemon.sprite_url ? (
                    <img
                      src={pokemon.sprite_url}
                      alt={pokemon.name}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-slate-200" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink group-hover:text-indigo-700">
                      {pokemon.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <TypeBadge type={pokemon.primary_type} />
                      <TypeBadge type={pokemon.secondary_type} />
                    </div>
                  </div>
                </div>
                <div className="ml-3 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {metricLabel}
                  </p>
                  <p className="text-base font-bold text-indigo-700">
                    {getMetricValue(pokemon)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
};
