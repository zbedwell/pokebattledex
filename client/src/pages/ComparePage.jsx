import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { SectionCard } from "../components/SectionCard.jsx";
import { ComparisonTable } from "../components/ComparisonTable.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { TypeBadge } from "../components/TypeBadge.jsx";

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialIds = (searchParams.get("ids") || "")
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)
    .slice(0, 4);

  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [pokemonLookup, setPokemonLookup] = useState({});
  const [pokemonOptions, setPokemonOptions] = useState([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    setSearchParams(selectedIds.length > 0 ? { ids: selectedIds.join(",") } : {});
  }, [selectedIds, setSearchParams]);

  useEffect(() => {
    if (selectedIds.length < 2) {
      setResult(null);
      setError("");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const payload = await api.comparePokemon(selectedIds);
        setResult(payload);
      } catch (err) {
        setError(err.message || "Failed to compare Pokemon.");
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedIds]);

  useEffect(() => {
    if (!result?.pokemon) {
      return;
    }

    setPokemonLookup((current) => {
      const next = { ...current };
      for (const pokemon of result.pokemon) {
        next[pokemon.id] = {
          id: pokemon.id,
          name: pokemon.name,
          national_dex_number: pokemon.national_dex_number,
          sprite_url: pokemon.sprite_url,
          primary_type: pokemon.primary_type,
          secondary_type: pokemon.secondary_type,
        };
      }
      return next;
    });
  }, [result]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      setPokemonOptions([]);
      setOptionsLoading(false);
      setOptionsError("");
      setOptionsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setOptionsLoading(true);
      setOptionsError("");

      try {
        const payload = await api.getPokemonOptions({ q: normalized, limit: 10 });
        setPokemonOptions(payload);
        setOptionsOpen(true);
        setActiveIndex(payload.length > 0 ? 0 : -1);

        setPokemonLookup((current) => {
          const next = { ...current };
          for (const option of payload) {
            next[option.id] = option;
          }
          return next;
        });
      } catch (err) {
        setPokemonOptions([]);
        setOptionsOpen(true);
        setActiveIndex(-1);
        setOptionsError(err.message || "Failed to search Pokemon options.");
      } finally {
        setOptionsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  const addPokemon = (pokemonId) => {
    setSelectedIds((current) => {
      if (current.includes(pokemonId) || current.length >= 4) {
        return current;
      }
      return [...current, pokemonId];
    });
    setQuery("");
    setOptionsOpen(false);
    setActiveIndex(-1);
  };

  const removePokemon = (pokemonId) => {
    setSelectedIds((current) => current.filter((id) => id !== pokemonId));
  };

  const isSelectionFull = selectedIds.length >= 4;

  const selectedPokemon = useMemo(
    () =>
      selectedIds.map((id) => pokemonLookup[id] || { id, name: `Pokemon #${id}` }),
    [selectedIds, pokemonLookup],
  );

  const handleKeyDown = (event) => {
    if (!optionsOpen || pokemonOptions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % pokemonOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? pokemonOptions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selected = pokemonOptions[activeIndex];
      if (!selected) {
        return;
      }

      const disabled = selectedIds.includes(selected.id) || isSelectionFull;
      if (!disabled) {
        addPokemon(selected.id);
      }
      return;
    }

    if (event.key === "Escape") {
      setOptionsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pokemon Comparison Tool"
        subtitle="Compare 2 to 4 Pokemon side-by-side for team-building decisions."
      />

      <SectionCard title="Comparison Input">
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Search Pokemon to add
              <div className="relative mt-1">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => {
                    if (query.trim().length >= 2) {
                      setOptionsOpen(true);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="e.g. Dragonite"
                />
                {optionsOpen && (
                  <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-card">
                    {optionsLoading && <p className="px-2 py-1 text-xs text-slate-500">Searching...</p>}
                    {!optionsLoading && optionsError && (
                      <p className="px-2 py-1 text-xs text-rose-600">{optionsError}</p>
                    )}
                    {!optionsLoading && !optionsError && pokemonOptions.length === 0 && (
                      <p className="px-2 py-1 text-xs text-slate-500">
                        {query.trim().length < 2 ? "Type at least 2 characters." : "No matching Pokemon found."}
                      </p>
                    )}
                    {!optionsLoading &&
                      pokemonOptions.map((pokemon, index) => {
                        const selected = selectedIds.includes(pokemon.id);
                        const disabled = selected || isSelectionFull;
                        const active = activeIndex === index;

                        return (
                          <button
                            key={pokemon.id}
                            type="button"
                            disabled={disabled}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => addPokemon(pokemon.id)}
                            className={`mb-1 flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm ${
                              active ? "bg-slate-100" : "bg-white"
                            } ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50"}`}
                          >
                            {pokemon.sprite_url ? (
                              <img
                                src={pokemon.sprite_url}
                                alt={pokemon.name}
                                className="h-8 w-8 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-slate-100" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="break-words font-semibold leading-tight text-ink">
                                {pokemon.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                #{String(pokemon.national_dex_number).padStart(3, "0")}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                <TypeBadge type={pokemon.primary_type} />
                                <TypeBadge type={pokemon.secondary_type} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            </label>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700">Selected ({selectedIds.length}/4)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPokemon.map((pokemon) => (
                <button
                  key={pokemon.id}
                  type="button"
                  onClick={() => removePokemon(pokemon.id)}
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                >
                  {pokemon.name} x
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Select at least 2 Pokemon to generate side-by-side battle insights.
            </p>
          </div>
        </div>
      </SectionCard>

      {loading && <LoadingState label="Comparing Pokemon..." />}
      {error && <ErrorState message={error} />}

      {result && <ComparisonTable data={result.pokemon} highlights={result.highlights} />}
    </div>
  );
};
