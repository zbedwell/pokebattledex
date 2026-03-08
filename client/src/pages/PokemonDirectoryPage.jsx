import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { FilterPanel } from "../components/FilterPanel.jsx";
import { SortDropdown } from "../components/SortDropdown.jsx";
import { PokemonCard } from "../components/PokemonCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataStatusBanner } from "../components/DataStatusBanner.jsx";

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "base_stat_total", label: "Base Stat Total" },
  { value: "speed", label: "Speed" },
  { value: "attack", label: "Attack" },
  { value: "special_attack", label: "Special Attack" },
  { value: "defense", label: "Defense" },
  { value: "special_defense", label: "Special Defense" },
  { value: "hp", label: "HP" },
];

export const PokemonDirectoryPage = () => {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);
  const [selectedCompare, setSelectedCompare] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    type: "",
    ability: "",
    min_speed: "",
    min_special_attack: "",
    sort: "name",
    order: "asc",
    page: 1,
    limit: 24,
  });

  useEffect(() => {
    api.getTypes().then(setTypes).catch(() => setTypes([]));
    api.getDataHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await api.getPokemon(filters);
        setData(payload);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load Pokemon.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [filters]);

  const compareIds = useMemo(() => selectedCompare.map((entry) => entry.id), [selectedCompare]);

  const toggleCompare = (pokemon) => {
    setSelectedCompare((current) => {
      if (current.some((entry) => entry.id === pokemon.id)) {
        return current.filter((entry) => entry.id !== pokemon.id);
      }

      if (current.length >= 4) {
        return current;
      }

      return [...current, pokemon];
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pokemon Directory"
        subtitle="Filter by typing, ability, and stat thresholds to find battle-ready options quickly."
        actions={
          <button
            type="button"
            disabled={compareIds.length < 2}
            onClick={() => navigate(`/compare?ids=${compareIds.join(",")}`)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Compare Selected ({compareIds.length})
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <FilterPanel title="Directory Filters" contentClassName="sm:grid-cols-2 lg:grid-cols-1">
          <label className="text-sm font-semibold text-slate-700">
            Search Name
            <input
              value={filters.q}
              onChange={(event) => setFilters((state) => ({ ...state, q: event.target.value, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="e.g. char"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Type
            <select
              value={filters.type}
              onChange={(event) => setFilters((state) => ({ ...state, type: event.target.value, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="">Any Type</option>
              {types.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Ability
            <input
              value={filters.ability}
              onChange={(event) =>
                setFilters((state) => ({ ...state, ability: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="e.g. Levitate"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Min Speed
            <input
              type="number"
              min="1"
              value={filters.min_speed}
              onChange={(event) =>
                setFilters((state) => ({ ...state, min_speed: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Min Special Attack
            <input
              type="number"
              min="1"
              value={filters.min_special_attack}
              onChange={(event) =>
                setFilters((state) => ({ ...state, min_special_attack: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <SortDropdown
            label="Sort By"
            value={filters.sort}
            onChange={(value) => setFilters((state) => ({ ...state, sort: value, page: 1 }))}
            options={sortOptions}
          />

          <SortDropdown
            label="Order"
            value={filters.order}
            onChange={(value) => setFilters((state) => ({ ...state, order: value, page: 1 }))}
            options={[
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ]}
          />
        </FilterPanel>

        <div className="space-y-4">
          <DataStatusBanner health={health} />

          {loading && <LoadingState label="Loading Pokemon directory..." />}
          {error && (
            <ErrorState
              message={
                health?.seeded === false
                  ? `${error} Database not seeded. Run: npm run setup`
                  : error
              }
            />
          )}

          {data && (
            <>
              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-card">
                <p className="text-sm font-semibold text-slate-700">
                  Results: {data.pagination.total}
                </p>
                <p className="text-xs text-slate-500">
                  Page {data.pagination.page} / {data.pagination.total_pages}
                </p>
              </div>

              {data.data.length === 0 ? (
                <EmptyState
                  title="No Pokemon matched these filters"
                  message={
                    health?.seeded === false
                      ? "No seed data detected. Run: npm run setup"
                      : "Try loosening type/stat filters or clearing the search text."
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {data.data.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      compareMode
                      selected={selectedCompare.some((entry) => entry.id === pokemon.id)}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-card">
                <p className="text-sm text-slate-600">
                  Page {data.pagination.page} of {data.pagination.total_pages} ({data.pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={data.pagination.page <= 1}
                    onClick={() =>
                      setFilters((state) => ({ ...state, page: Math.max(1, state.page - 1) }))
                    }
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={data.pagination.page >= data.pagination.total_pages}
                    onClick={() =>
                      setFilters((state) => ({ ...state, page: state.page + 1 }))
                    }
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
