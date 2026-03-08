import { Link } from "react-router-dom";

export const AbilityCard = ({ ability }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <Link to={`/abilities/${ability.id}`} className="font-display text-lg font-bold text-ink hover:text-accent">
        {ability.name}
      </Link>
      <p className="mt-2 text-sm text-slate-600">{ability.short_effect}</p>
      {ability.pokemon_count !== undefined && (
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Pokemon with ability: {ability.pokemon_count}
        </p>
      )}
    </article>
  );
};
