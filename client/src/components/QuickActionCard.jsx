import { Link } from "react-router-dom";

const baseClassName =
  "group card-lift flex h-full flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 text-left shadow-card transition duration-200 hover:border-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2";

export const QuickActionCard = ({
  icon,
  title,
  description,
  to,
  onClick,
}) => {
  const content = (
    <>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <span className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-700">
        Open
      </span>
    </>
  );

  if (to) {
    return (
      <Link className={baseClassName} to={to}>
        {content}
      </Link>
    );
  }

  return (
    <button className={baseClassName} type="button" onClick={onClick}>
      {content}
    </button>
  );
};
