import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar.jsx";

export const Navbar = () => {
  const navigate = useNavigate();
  const globalSearchInputId = "global-navbar-search";

  const quickLinks = [
    { to: "/pokemon", label: "Pokemon" },
    { to: "/moves", label: "Moves" },
    { to: "/abilities", label: "Abilities" },
    { to: "/types", label: "Type Tool" },
    { to: "/compare", label: "Compare" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-ink">
            BattleDex
          </Link>
          <nav className="hidden gap-4 md:flex">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-2 py-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:w-[440px]">
          <SearchBar
            inputId={globalSearchInputId}
            onSelect={(entry) => {
              if (entry.kind === "pokemon") navigate(`/pokemon/${entry.id}`);
              if (entry.kind === "moves") navigate(`/moves/${entry.id}`);
              if (entry.kind === "abilities") navigate(`/abilities/${entry.id}`);
              if (entry.kind === "types") navigate(`/types?attacking=${entry.name}`);
            }}
          />
        </div>
      </div>
    </header>
  );
};
