import { useState } from "react";
import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { api } from "../services/api.js";
import { SectionCard } from "./SectionCard.jsx";
import { TypeBadge } from "./TypeBadge.jsx";
import { LoadingState } from "./LoadingState.jsx";
import { ErrorState } from "./ErrorState.jsx";
import { EmptyState } from "./EmptyState.jsx";

const levelLabel = (level) => {
  if (level === 0) {
    return "Evo.";
  }
  if (level === 1) {
    return "Start";
  }
  return `Lv. ${level}`;
};

const MethodTable = ({ method }) => {
  const showLevel = method.method === "level-up";

  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {method.label} <span className="font-normal text-slate-400">({method.moves.length})</span>
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              {showLevel && <th className="py-2 pr-3 font-semibold">Level</th>}
              <th className="py-2 pr-3 font-semibold">Move</th>
              <th className="py-2 pr-3 font-semibold">Type</th>
              <th className="py-2 pr-3 font-semibold">Cat.</th>
              <th className="py-2 pr-3 font-semibold">Power</th>
              <th className="py-2 font-semibold">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {method.moves.map((move) => (
              <tr
                key={`${move.name}-${move.level}`}
                className="border-b border-slate-100 last:border-b-0"
              >
                {showLevel && (
                  <td className="py-2 pr-3 text-slate-600">{levelLabel(move.level)}</td>
                )}
                <td className="py-2 pr-3">
                  {move.id ? (
                    <Link to={`/moves/${move.id}`} className="font-semibold text-ink hover:text-accent">
                      {move.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-ink">{move.name}</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <TypeBadge type={move.type} />
                </td>
                <td className="py-2 pr-3 text-slate-600">{move.category ?? "—"}</td>
                <td className="py-2 pr-3 text-slate-600">{move.power ?? "—"}</td>
                <td className="py-2 text-slate-600">{move.accuracy ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const LearnsetSection = ({ pokemonId }) => {
  const { data, loading, error } = useAsyncData(
    () => api.getPokemonLearnset(pokemonId),
    [pokemonId],
  );
  const [selectedGame, setSelectedGame] = useState("");

  const games = data?.games || [];
  const activeGame = games.find((game) => game.version_group === selectedGame) || games[0];

  return (
    <SectionCard title="Moves by Game">
      {loading ? (
        <LoadingState label="Loading full learnset..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : games.length === 0 ? (
        <EmptyState
          title="No learnset data"
          message="No per-game move data is available for this Pokemon."
        />
      ) : (
        <div className="space-y-5">
          <div className="max-w-xs">
            <label className="text-sm font-semibold text-slate-700">
              Game
              <select
                value={activeGame.version_group}
                onChange={(event) => setSelectedGame(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              >
                {games.map((game) => (
                  <option key={game.version_group} value={game.version_group}>
                    {game.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeGame.methods.map((method) => (
            <MethodTable key={method.method} method={method} />
          ))}
        </div>
      )}
    </SectionCard>
  );
};
