export const DataStatusBanner = ({ health }) => {
  if (!health || health.status === "ok") {
    return null;
  }

  let message = "Data service is degraded.";

  if (!health.db_connected) {
    message = "Database connection failed. Check .env values and SSH tunnel settings.";
  } else if (Array.isArray(health.missing_tables) && health.missing_tables.length > 0) {
    message = `Database tables missing (${health.missing_tables.join(", ")}). Run: npm run migrate`;
  } else if (!health.seeded) {
    message = "Database is connected but Pokemon/move data is not seeded. Run: npm run setup";
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {message}
    </div>
  );
};
