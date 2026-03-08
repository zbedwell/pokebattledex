import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { FilterPanel } from "../components/FilterPanel.jsx";
import { SortDropdown } from "../components/SortDropdown.jsx";
import { AbilityCard } from "../components/AbilityCard.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

export const AbilitiesDirectoryPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    q: "",
    sort: "name",
    order: "asc",
    page: 1,
    limit: 24,
  });

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await api.getAbilities(filters);
        setData(payload);
      } catch (err) {
        setError(err.message || "Failed to load abilities.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Abilities Directory"
        subtitle="Search abilities and inspect battle impact plus the Pokemon that can use each one."
      />

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <FilterPanel title="Ability Filters">
          <label className="text-sm font-semibold text-slate-700">
            Search Name
            <input
              value={filters.q}
              onChange={(event) => setFilters((state) => ({ ...state, q: event.target.value, page: 1 }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              placeholder="e.g. Intimidate"
            />
          </label>

          <SortDropdown
            label="Sort By"
            value={filters.sort}
            onChange={(value) => setFilters((state) => ({ ...state, sort: value, page: 1 }))}
            options={[
              { value: "name", label: "Name" },
              { value: "pokemon_count", label: "Pokemon Count" },
            ]}
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
          {loading && <LoadingState label="Loading abilities..." />}
          {error && <ErrorState message={error} />}

          {data && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.data.map((ability) => (
                  <AbilityCard key={ability.id} ability={ability} />
                ))}
              </div>

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
