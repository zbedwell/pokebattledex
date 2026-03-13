import { Link } from "react-router-dom";

const getButtonClassName = (variant = "primary") => {
  if (variant === "secondary") {
    return "border border-indigo-200 bg-white/80 text-indigo-700 hover:bg-white hover:border-indigo-300";
  }

  if (variant === "ghost") {
    return "border border-transparent bg-indigo-100 text-indigo-700 hover:bg-indigo-200";
  }

  return "border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700";
};

export const CTASection = ({ title, description, actions = [] }) => {
  return (
    <section className="marketing-fade-up relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-card md:p-10">
      <div className="pointer-events-none absolute -right-16 top-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative z-[1]">
        <h2 className="font-display text-2xl font-extrabold text-ink md:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          {description}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={`${action.label}-${action.to}`}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 ${getButtonClassName(
                action.variant,
              )}`}
              to={action.to}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
