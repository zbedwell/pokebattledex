export const ErrorState = ({ message }) => {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-card">
      {message}
    </div>
  );
};
