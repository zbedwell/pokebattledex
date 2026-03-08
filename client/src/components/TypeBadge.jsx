export const TypeBadge = ({ type }) => {
  if (!type) return null;
  const className = `type-badge type-${type}`;
  return <span className={className}>{type}</span>;
};
