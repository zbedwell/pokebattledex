export const EvolutionConnector = ({ edge, orientation = "horizontal" }) => {
  const isVertical = orientation === "vertical";
  const arrow = isVertical ? "↓" : "→";

  return (
    <div
      className={`rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-indigo-50 px-3 py-2 text-slate-700 ${
        isVertical ? "mx-auto flex w-fit flex-col items-center gap-1" : "flex items-center gap-2"
      }`}
      title={edge.tooltip || edge.label}
    >
      <span className="text-xl font-bold text-cyan-600">{arrow}</span>
      <span className="text-xs font-semibold leading-tight">{edge.label}</span>
    </div>
  );
};
