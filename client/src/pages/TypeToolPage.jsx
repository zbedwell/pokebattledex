import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { PageHeader } from "../components/PageHeader.jsx";
import { SectionCard } from "../components/SectionCard.jsx";
import { TypeEffectivenessPanel } from "../components/TypeEffectivenessPanel.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

export const TypeToolPage = () => {
  const [searchParams] = useSearchParams();
  const [types, setTypes] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [attackingType, setAttackingType] = useState(searchParams.get("attacking") || "");
  const [defenseType1, setDefenseType1] = useState("");
  const [defenseType2, setDefenseType2] = useState("");

  const [matchupResult, setMatchupResult] = useState(null);
  const [defenseSummary, setDefenseSummary] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");

      try {
        const [typeList, typeChart] = await Promise.all([api.getTypes(), api.getTypeChart()]);
        setTypes(typeList);
        setChart(typeChart);
      } catch (err) {
        setError(err.message || "Failed to load type data.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const defendingCsv = useMemo(() => {
    return [defenseType1, defenseType2].filter(Boolean).join(",");
  }, [defenseType1, defenseType2]);

  useEffect(() => {
    if (!attackingType || !defendingCsv) {
      setMatchupResult(null);
      return;
    }

    api
      .getTypeMatchup(attackingType, defendingCsv)
      .then(setMatchupResult)
      .catch(() => setMatchupResult(null));
  }, [attackingType, defendingCsv]);

  useEffect(() => {
    if (!defendingCsv) {
      setDefenseSummary(null);
      return;
    }

    api
      .getTypeDefense(defendingCsv)
      .then(setDefenseSummary)
      .catch(() => setDefenseSummary(null));
  }, [defendingCsv]);

  if (loading) return <LoadingState label="Loading type chart..." />;
  if (error) return <ErrorState message={error} />;

  const selectedAttackRow = chart.find((entry) => entry.attacking_type === attackingType);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Type Effectiveness Reference"
        subtitle="Inspect offensive and defensive matchups for one or two defending types."
      />

      <SectionCard title="Interactive Matchup Tool">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            Attacking Type
            <select
              value={attackingType}
              onChange={(event) => setAttackingType(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="">Select type</option>
              {types.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Defending Type #1
            <select
              value={defenseType1}
              onChange={(event) => setDefenseType1(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="">Select type</option>
              {types.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Defending Type #2 (Optional)
            <select
              value={defenseType2}
              onChange={(event) => setDefenseType2(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <option value="">None</option>
              {types.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {matchupResult && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <p>
              <span className="font-semibold text-ink">{matchupResult.attacking}</span> into
              <span className="font-semibold text-ink"> {matchupResult.defending.join("/")}</span>: x
              {matchupResult.multiplier}
            </p>
          </div>
        )}

        {defenseSummary && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <TypeEffectivenessPanel
              title="4x Weaknesses"
              items={defenseSummary.weaknesses_4x || []}
              tone="danger"
            />
            <TypeEffectivenessPanel
              title="2x Weaknesses"
              items={defenseSummary.weaknesses_2x || []}
              tone="danger"
            />
            <TypeEffectivenessPanel
              title="Resists (0.5x)"
              items={defenseSummary.resistances_half || []}
              tone="safe"
            />
            <TypeEffectivenessPanel
              title="Resists (0.25x)"
              items={defenseSummary.resistances_quarter || []}
              tone="safe"
            />
            <TypeEffectivenessPanel
              title="Immunities"
              items={defenseSummary.immunities || []}
              tone="safe"
            />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Attacking Type Chart Row">
        {!selectedAttackRow && <p className="text-sm text-slate-600">Select an attacking type to inspect full coverage.</p>}

        {selectedAttackRow && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Object.entries(selectedAttackRow.matchups).map(([defendingType, multiplier]) => (
              <div key={defendingType} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <span className="font-semibold text-ink">{defendingType}</span>
                <span className="ml-2 text-slate-700">x{multiplier}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
