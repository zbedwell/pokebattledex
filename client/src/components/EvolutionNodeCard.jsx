import { Link } from "react-router-dom";
import { TypeBadge } from "./TypeBadge.jsx";

export const EvolutionNodeCard = ({ node, animationDelayMs = 0 }) => {
  const stateClasses = node.is_current
    ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-cyan-300/60"
    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300";

  return (
    <Link
      to={`/pokemon/${node.pokemon_id}`}
      className={`evolution-enter block rounded-2xl border p-3 shadow-card transition duration-200 ${stateClasses}`}
      style={{ animationDelay: `${animationDelayMs}ms` }}
      aria-current={node.is_current ? "page" : undefined}
    >
      <div className="flex items-start gap-3">
        {node.sprite_url ? (
          <img
            src={node.sprite_url}
            alt={node.name}
            className="h-14 w-14 object-contain transition duration-200 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-14 w-14 rounded-xl bg-slate-100" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            #{String(node.dex_number).padStart(3, "0")}
          </p>
          <p className="mt-0.5 break-words text-sm font-bold leading-tight text-ink">{node.name}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(node.types || []).map((type) => (
              <TypeBadge key={`${node.pokemon_id}-${type}`} type={type} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
