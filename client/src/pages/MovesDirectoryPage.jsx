import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { FilterPanel } from "../components/FilterPanel.jsx";
import { SortDropdown } from "../components/SortDropdown.jsx";
import { MoveCard } from "../components/MoveCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { DataStatusBanner } from "../components/DataStatusBanner.jsx";

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "power", label: "Power" },
  { value: "accuracy", label: "Accuracy" },
  { value: "pp", label: "PP" },
];

export const MovesDirectoryPage = () => {
  const [types, setTypes] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);

  const [filters, setFilters] = useState({
    q: "",
    type: "",
    category: "",
    min_power: "",
    min_accuracy: "",
    is_status: "",
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
        const payload = await api.getMoves(filters);
        setData(payload);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load moves.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moves Directory"
        subtitle="Browse and filter damaging and status moves by battle-relevant stats."
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <FilterPanel title="Move Filters" contentClassName="sm:grid-cols-2 lg:grid-cols-1">
          <label className="text-sm font-semibold text-slate-700">
            Search
            <input
              value={filters.q}
              onChange={(event) => setFilters((state) => ({ ...state, q: event.target.value, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="e.g. Thunder"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Type
            <select
              value={filters.type}
              onChange={(event) => setFilters((state) => ({ ...state, type: event.target.value, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
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
            Category
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((state) => ({ ...state, category: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">Any Category</option>
              <option value="Physical">Physical</option>
              <option value="Special">Special</option>
              <option value="Status">Status</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Minimum Power
            <input
              type="number"
              min="0"
              value={filters.min_power}
              onChange={(event) =>
                setFilters((state) => ({ ...state, min_power: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Minimum Accuracy
            <input
              type="number"
              min="0"
              max="100"
              value={filters.min_accuracy}
              onChange={(event) =>
                setFilters((state) => ({ ...state, min_accuracy: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Status vs Damaging
            <select
              value={filters.is_status}
              onChange={(event) =>
                setFilters((state) => ({ ...state, is_status: event.target.value, page: 1 }))
              }
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="">All</option>
              <option value="true">Status only</option>
              <option value="false">Damaging only</option>
            </select>
          </label>

          <SortDropdown
            label="Sort By"
            value={filters.sort}
            onChange={(value) => setFilters((state) => ({ ...state, sort: value, page: 1 }))}
            options={sortOptions}
          />
        </FilterPanel>

        <div className="space-y-4">
          <DataStatusBanner health={health} />

          {loading && <LoadingState label="Loading moves..." />}
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
                <p className="text-sm font-semibold text-slate-700">Results: {data.pagination.total}</p>
                <p className="text-xs text-slate-500">
                  Page {data.pagination.page} / {data.pagination.total_pages}
                </p>
              </div>

              {data.data.length === 0 ? (
                <EmptyState
                  title="No moves matched these filters"
                  message={
                    health?.seeded === false
                      ? "No move seed data detected. Run: npm run setup"
                      : "Try lowering the minimum power/accuracy or clearing filters."
                  }
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {data.data.map((move) => (
                    <MoveCard key={move.id} move={move} />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-card">
                <p className="text-sm text-slate-600">
                  Page {data.pagination.page} of {data.pagination.total_pages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={data.pagination.page <= 1}
                    onClick={() =>
                      setFilters((state) => ({ ...state, page: Math.max(1, state.page - 1) }))
                    }
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={data.pagination.page >= data.pagination.total_pages}
                    onClick={() => setFilters((state) => ({ ...state, page: state.page + 1 }))}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
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
