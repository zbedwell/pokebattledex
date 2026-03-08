import { Link } from "react-router-dom";
import { TypeBadge } from "./TypeBadge.jsx";

export const MoveCard = ({ move }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <Link to={`/moves/${move.id}`} className="font-display text-lg font-bold text-ink hover:text-accent">
          {move.name}
        </Link>
        <TypeBadge type={move.type} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <span className="rounded-lg bg-slate-100 px-2 py-1">{move.category}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">Power: {move.power ?? "-"}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">Acc: {move.accuracy ?? "-"}</span>
      </div>

      <p className="mt-3 text-sm text-slate-600">{move.short_effect}</p>
    </article>
  );
};
