import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-card">
      <h1 className="font-display text-4xl font-extrabold text-ink">404</h1>
      <p className="mt-2 text-slate-600">This page does not exist in BattleDex.</p>
      <Link to="/" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
        Back to Home
      </Link>
    </div>
  );
};
