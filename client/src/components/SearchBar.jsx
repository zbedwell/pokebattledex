import { useEffect, useState } from "react";
import { api } from "../services/api.js";

const groups = [
  ["pokemon", "Pokemon"],
  ["moves", "Moves"],
  ["abilities", "Abilities"],
  ["types", "Types"],
];

export const SearchBar = ({ onSelect }) => {
  const [value, setValue] = useState("");
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const payload = await api.search(value.trim());
        setResults(payload);
        setOpen(true);
      } catch {
        setResults(null);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [value]);

  const hasResults =
    results && groups.some(([key]) => Array.isArray(results[key]) && results[key].length > 0);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Search Pokemon, moves, abilities, or types"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm outline-none transition focus:border-accent"
      />

      {open && value.length >= 2 && (
        <div className="absolute mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-card">
          {!hasResults && <p className="text-sm text-slate-500">No matches found.</p>}

          {hasResults && (
            <div className="space-y-3">
              {groups.map(([key, label]) => {
                const entries = results[key] ?? [];
                if (entries.length === 0) return null;

                return (
                  <div key={key}>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                    <div className="space-y-1">
                      {entries.map((entry) => (
                        <button
                          key={`${key}-${entry.id}-${entry.name}`}
                          type="button"
                          onClick={() => {
                            onSelect({ ...entry, kind: key });
                            setOpen(false);
                            setValue(entry.name);
                          }}
                          className="block w-full rounded-md px-2 py-1 text-left text-sm transition hover:bg-slate-100"
                        >
                          {entry.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
