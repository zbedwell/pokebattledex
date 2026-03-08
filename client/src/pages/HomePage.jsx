import { Link } from "react-router-dom";
import { useAsyncData } from "../hooks/useAsyncData.js";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { SectionCard } from "../components/SectionCard.jsx";
import { TypeBadge } from "../components/TypeBadge.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

export const HomePage = () => {
  const { data, loading, error } = useAsyncData(async () => {
    const [fastest, strongest, bulkiest] = await Promise.all([
      api.getPokemon({ sort: "speed", order: "desc", limit: 5, page: 1 }),
      api.getPokemon({ sort: "base_stat_total", order: "desc", limit: 5, page: 1 }),
      api.getPokemon({ sort: "special_defense", order: "desc", limit: 5, page: 1 }),
    ]);

    return {
      fastest: fastest.data,
      strongest: strongest.data,
      bulkiest: bulkiest.data,
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Build better teams with battle-focused Pokemon data"
        subtitle="Search, filter, and compare Pokemon with clean battle context across stats, abilities, moves, and type matchups."
      />

      <section className="grid gap-4 md:grid-cols-4">
        <Link className="rounded-2xl bg-white p-4 text-center shadow-card hover:bg-slate-50" to="/pokemon">
          Browse Pokemon
        </Link>
        <Link className="rounded-2xl bg-white p-4 text-center shadow-card hover:bg-slate-50" to="/compare">
          Compare Pokemon
        </Link>
        <Link className="rounded-2xl bg-white p-4 text-center shadow-card hover:bg-slate-50" to="/moves">
          Explore Moves
        </Link>
        <Link className="rounded-2xl bg-white p-4 text-center shadow-card hover:bg-slate-50" to="/types">
          Type Matchups
        </Link>
      </section>

      {loading && <LoadingState label="Loading featured battle lists..." />}
      {error && <ErrorState message={error} />}

      {data && (
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="Fastest Options">
            <ul className="space-y-2">
              {data.fastest.map((pokemon) => (
                <li key={pokemon.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <Link to={`/pokemon/${pokemon.id}`} className="font-semibold text-ink hover:text-accent">
                    {pokemon.name}
                  </Link>
                  <span className="text-sm font-bold text-slate-600">Spe {pokemon.speed}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Highest BST">
            <ul className="space-y-2">
              {data.strongest.map((pokemon) => (
                <li key={pokemon.id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <Link to={`/pokemon/${pokemon.id}`} className="font-semibold text-ink hover:text-accent">
                      {pokemon.name}
                    </Link>
                    <span className="text-sm font-bold text-slate-600">{pokemon.base_stat_total}</span>
                  </div>
                  <div className="mt-1 flex gap-1">
                    <TypeBadge type={pokemon.primary_type} />
                    <TypeBadge type={pokemon.secondary_type} />
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Special Bulk Picks">
            <ul className="space-y-2">
              {data.bulkiest.map((pokemon) => (
                <li key={pokemon.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <Link to={`/pokemon/${pokemon.id}`} className="font-semibold text-ink hover:text-accent">
                    {pokemon.name}
                  </Link>
                  <span className="text-sm font-bold text-slate-600">SpD {pokemon.special_defense}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      )}

      <SectionCard title="Beginner Battle Tips">
        <ul className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
          <li className="rounded-lg bg-slate-50 p-3">Check speed tiers first so you know who moves first.</li>
          <li className="rounded-lg bg-slate-50 p-3">Use type immunities as free switch opportunities.</li>
          <li className="rounded-lg bg-slate-50 p-3">Compare shared weaknesses before finalizing your core.</li>
        </ul>
      </SectionCard>
    </div>
  );
};
