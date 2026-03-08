import { Link } from "react-router-dom";
import { TypeBadge } from "./TypeBadge.jsx";
import { BattleTagBadge } from "./BattleTagBadge.jsx";

export const PokemonCard = ({ pokemon, compareMode = false, selected = false, onToggleCompare }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-card p-4 shadow-card transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            #{String(pokemon.national_dex_number).padStart(3, "0")}
          </p>
          <Link to={`/pokemon/${pokemon.id}`} className="font-display text-xl font-bold text-ink hover:text-accent">
            {pokemon.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            <TypeBadge type={pokemon.primary_type} />
            <TypeBadge type={pokemon.secondary_type} />
          </div>
        </div>
        {pokemon.sprite_url && (
          <img src={pokemon.sprite_url} alt={pokemon.name} className="h-20 w-20 object-contain" loading="lazy" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <BattleTagBadge tag={pokemon.battle_tag || pokemon.role_tags?.[0]} />
        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
          BST {pokemon.base_stat_total}
        </span>
      </div>

      <div className="mt-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-700">Abilities:</span> {pokemon.primary_abilities?.join(", ")}
      </div>

      {compareMode && (
        <button
          type="button"
          onClick={() => onToggleCompare(pokemon)}
          className={`mt-4 w-full rounded-lg px-3 py-2 text-sm font-semibold transition ${
            selected ? "bg-ink text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {selected ? "Selected" : "Add to Compare"}
        </button>
      )}
    </article>
  );
};
