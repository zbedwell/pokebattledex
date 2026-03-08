export const BattleTagBadge = ({ tag }) => {
  if (!tag) return null;

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
      {tag}
    </span>
  );
};
