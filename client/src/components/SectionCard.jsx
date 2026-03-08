export const SectionCard = ({ title, children }) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      {title && <h2 className="font-display text-xl font-bold text-ink">{title}</h2>}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
};
