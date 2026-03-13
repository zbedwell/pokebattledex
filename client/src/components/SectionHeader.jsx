export const SectionHeader = ({
  eyebrow,
  title,
  description,
  align = "left",
}) => {
  const centered = align === "center";

  return (
    <header className={centered ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2 font-display text-2xl font-extrabold text-ink md:text-3xl">
        {title}
      </h2>
      {description && (
        <p
          className={`mt-3 text-sm leading-relaxed text-slate-600 md:text-base ${
            centered ? "mx-auto max-w-3xl" : "max-w-3xl"
          }`}
        >
          {description}
        </p>
      )}
    </header>
  );
};
