import { Link } from "react-router-dom";

const buildButtonClasses = (variant = "primary") => {
  if (variant === "secondary") {
    return "border border-indigo-200 bg-white/70 text-indigo-700 hover:border-indigo-300 hover:bg-white";
  }

  return "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700";
};

export const HeroSection = ({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  children,
}) => {
  const renderAction = (action, variant) => {
    if (!action) {
      return null;
    }

    const className = `inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 ${buildButtonClasses(
      variant,
    )}`;

    if (action.to) {
      return (
        <Link className={className} to={action.to}>
          {action.label}
        </Link>
      );
    }

    return (
      <button className={className} type="button" onClick={action.onClick}>
        {action.label}
      </button>
    );
  };

  return (
    <section className="marketing-fade-up relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-card md:p-10">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative z-[1] grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div>
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-ink md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-lg">
              {subtitle}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {renderAction(primaryAction, "primary")}
            {renderAction(secondaryAction, "secondary")}
          </div>
        </div>

        {children && <div className="relative z-[1]">{children}</div>}
      </div>
    </section>
  );
};
