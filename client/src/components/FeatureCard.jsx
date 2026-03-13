export const FeatureCard = ({ icon, title, description }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-card">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
        {icon}
      </span>
      <h3 className="mt-3 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </article>
  );
};
