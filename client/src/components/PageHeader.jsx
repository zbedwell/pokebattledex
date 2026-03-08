export const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  );
};
