export const LoadingState = ({ label = "Loading..." }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-card">
      {label}
    </div>
  );
};
