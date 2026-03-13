import { useEffect, useState } from "react";
import { CTASection } from "../components/CTASection.jsx";
import { DataStatusBanner } from "../components/DataStatusBanner.jsx";
import { FeatureCard } from "../components/FeatureCard.jsx";
import { FeaturedPokemonList } from "../components/FeaturedPokemonList.jsx";
import { HeroSection } from "../components/HeroSection.jsx";
import { QuickActionCard } from "../components/QuickActionCard.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";
import { api } from "../services/api.js";

const emptyFeaturedState = {
  fastest: [],
  highestBst: [],
  highestSpecialBulk: [],
  megaPrimalSpotlight: [],
};

const iconClassName = "h-5 w-5";

const PokemonIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.75" />
    <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

const CompareIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.75" width="7" x="3.5" y="5" />
    <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.75" width="7" x="13.5" y="5" />
    <path d="M7 9.5h0M17 9.5h0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
  </svg>
);

const MoveIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 18L18 6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
    <path
      d="M9.5 5.5l1.5 1.5-6 6-1.5-1.5 6-6zM20 13l-4 4-2-2 4-4 2 2z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.4"
    />
  </svg>
);

const AbilityIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3.5l6.5 3.75v7.5L12 20.5 5.5 14.75v-7.5L12 3.5z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.75"
    />
    <path d="M9 12h6M12 9v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
  </svg>
);

const TypeToolIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 5.5h12M6 12h12M6 18.5h12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.75"
    />
    <circle cx="8.5" cy="5.5" fill="currentColor" r="1.2" />
    <circle cx="12" cy="12" fill="currentColor" r="1.2" />
    <circle cx="15.5" cy="18.5" fill="currentColor" r="1.2" />
  </svg>
);

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    className={iconClassName}
    fill="none"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10.5" cy="10.5" r="5.75" stroke="currentColor" strokeWidth="1.75" />
    <path d="M15 15l4.5 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
  </svg>
);

const featureHighlights = [
  {
    title: "Battle Profile Detail Pages",
    description:
      "Inspect stats, role tags, strengths/weaknesses, notable moves, type matchups, similar picks, and game-by-game obtain methods.",
    icon: <PokemonIcon />,
  },
  {
    title: "Side-by-Side Compare",
    description:
      "Evaluate 2 to 4 Pokemon in one view with winner highlights, defensive profile context, and utility snapshots.",
    icon: <CompareIcon />,
  },
  {
    title: "Evolution + Transformation Paths",
    description:
      "Read clear evolution branches including Mega Evolution and Primal Reversion labels directly in the line.",
    icon: <MoveIcon />,
  },
  {
    title: "Type Matchup Intelligence",
    description:
      "Use the type tool to validate offensive and defensive interactions with grouped weakness/resistance outputs.",
    icon: <TypeToolIcon />,
  },
  {
    title: "Moves and Abilities Exploration",
    description:
      "Browse and drill into battle-relevant move and ability metadata with linked Pokemon coverage.",
    icon: <AbilityIcon />,
  },
  {
    title: "Global Search Workflow",
    description:
      "Jump across Pokemon, moves, abilities, and types from one grouped search experience in the navbar.",
    icon: <SearchIcon />,
  },
];

const usageSteps = [
  "Search or browse a Pokemon profile.",
  "Inspect stats, type matchups, abilities, notable moves, and evolution context.",
  "Compare multiple candidates side-by-side.",
  "Validate coverage in Type Tool and refine with moves/abilities pages.",
];

export const HomePage = () => {
  const [health, setHealth] = useState(null);
  const [featured, setFeatured] = useState(emptyFeaturedState);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState("");

  useEffect(() => {
    api.getDataHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadFeatured = async () => {
      setFeaturedLoading(true);
      setFeaturedError("");

      try {
        const [fastest, highestBst, highestSpecialBulk, megaForms, primalForms] =
          await Promise.all([
            api.getPokemon({ sort: "speed", order: "desc", limit: 5, page: 1 }),
            api.getPokemon({
              sort: "base_stat_total",
              order: "desc",
              limit: 5,
              page: 1,
            }),
            api.getPokemon({
              sort: "special_defense",
              order: "desc",
              limit: 5,
              page: 1,
            }),
            api.getPokemon({ q: "mega", limit: 4, page: 1 }),
            api.getPokemon({ q: "primal", limit: 2, page: 1 }),
          ]);

        if (!isMounted) {
          return;
        }

        const spotlightById = new Map();
        for (const pokemon of [
          ...(megaForms.data || []),
          ...(primalForms.data || []),
        ]) {
          if (!spotlightById.has(pokemon.id)) {
            spotlightById.set(pokemon.id, pokemon);
          }
        }

        setFeatured({
          fastest: fastest.data || [],
          highestBst: highestBst.data || [],
          highestSpecialBulk: highestSpecialBulk.data || [],
          megaPrimalSpotlight: [...spotlightById.values()],
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setFeatured(emptyFeaturedState);
        setFeaturedError(error.message || "Failed to load featured battle insights.");
      } finally {
        if (isMounted) {
          setFeaturedLoading(false);
        }
      }
    };

    loadFeatured();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFocusGlobalSearch = () => {
    if (typeof window === "undefined") {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || false;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    window.setTimeout(() => {
      const input = document.getElementById("global-navbar-search");
      if (!input) {
        return;
      }

      input.focus();
      if (typeof input.select === "function") {
        input.select();
      }
    }, prefersReducedMotion ? 0 : 220);
  };

  const quickActions = [
    {
      title: "Browse Pokemon",
      description:
        "Filter battle-ready options by stats, typing, and ability context.",
      to: "/pokemon",
      icon: <PokemonIcon />,
    },
    {
      title: "Compare Pokemon",
      description:
        "Run side-by-side checks for up to four candidates before locking picks.",
      to: "/compare",
      icon: <CompareIcon />,
    },
    {
      title: "Explore Moves",
      description:
        "Inspect move categories, power, accuracy, and tactical utility details.",
      to: "/moves",
      icon: <MoveIcon />,
    },
    {
      title: "Explore Abilities",
      description:
        "Browse ability impact and quickly see which Pokemon can use each one.",
      to: "/abilities",
      icon: <AbilityIcon />,
    },
    {
      title: "Use Type Tool",
      description:
        "Validate offensive and defensive type interactions in seconds.",
      to: "/types",
      icon: <TypeToolIcon />,
    },
    {
      title: "Global Search",
      description:
        "Jump directly to Pokemon, moves, abilities, or types from one input.",
      onClick: handleFocusGlobalSearch,
      icon: <SearchIcon />,
    },
  ];

  return (
    <div className="space-y-10">
      <HeroSection
        eyebrow="PokeBattleDex"
        title="Battle-focused Pokemon strategy reference for faster team decisions."
        subtitle="Search, compare, and understand Pokemon through practical battle context: stats, matchups, abilities, moves, evolution lines, forms, and game-by-game availability."
        primaryAction={{ label: "Browse Pokemon", to: "/pokemon" }}
        secondaryAction={{ label: "Try Compare", to: "/compare" }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/85 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              Pokemon Profiles
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink">
              {health?.counts?.pokemon ?? "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/85 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              Move Entries
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-ink">
              {health?.counts?.moves ?? "--"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/85 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              Form Coverage
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Mega and Primal profiles included
            </p>
          </div>
        </div>
      </HeroSection>

      <DataStatusBanner health={health} />

      <section className="marketing-fade-up marketing-stagger-1 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Quick Actions"
          title="Start from the workflow you need"
          description="Every entry point maps to an implemented product surface."
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.title} {...action} />
          ))}
        </div>
      </section>

      <section className="marketing-fade-up marketing-stagger-2 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Featured Battle Insights"
          title="Live snapshots from current dataset"
          description="Fast examples of what PokeBattleDex helps you discover without extra clicks."
        />

        {featuredLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {["a", "b", "c", "d"].map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
              >
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="mt-5 space-y-2">
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                  <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredError ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {featuredError}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <FeaturedPokemonList
              title="Fastest Profiles"
              description="High-speed options for tempo control."
              emptyMessage="No speed leaderboard data available."
              getMetricValue={(pokemon) => pokemon.speed ?? "-"}
              items={featured.fastest}
              metricLabel="Speed"
            />
            <FeaturedPokemonList
              title="Highest BST"
              description="Top-end overall stat packages."
              emptyMessage="No BST leaderboard data available."
              getMetricValue={(pokemon) => pokemon.base_stat_total ?? "-"}
              items={featured.highestBst}
              metricLabel="BST"
            />
            <FeaturedPokemonList
              title="Highest Special Bulk"
              description="Profiles with strong special defense ceilings."
              emptyMessage="No special bulk leaderboard data available."
              getMetricValue={(pokemon) => pokemon.special_defense ?? "-"}
              items={featured.highestSpecialBulk}
              metricLabel="Sp. Def"
            />
            <FeaturedPokemonList
              title="Mega/Primal Spotlight"
              description="Battle-only transformation profiles now included."
              emptyMessage="No Mega/Primal spotlight data available."
              getMetricValue={(pokemon) => pokemon.base_stat_total ?? "-"}
              items={featured.megaPrimalSpotlight}
              metricLabel="BST"
            />
          </div>
        )}
      </section>

      <section className="marketing-fade-up marketing-stagger-3 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Feature Highlights"
          title="Built around practical battle workflows"
          description="No placeholder capability claims. Every highlight maps to an implemented tool or detail payload."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureHighlights.map((feature) => (
            <FeatureCard
              key={feature.title}
              description={feature.description}
              icon={feature.icon}
              title={feature.title}
            />
          ))}
        </div>
      </section>

      <section className="marketing-fade-up marketing-stagger-4 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Why PokeBattleDex"
          title="Strategy clarity over data overload"
          description="PokeBattleDex is not a generic lore encyclopedia. It is a battle decision-support reference built to make tactical information easier to read and compare."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <h3 className="font-display text-lg font-bold text-ink">
              Product Philosophy
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Move quickly from search to profile to comparison. Keep battle context
              visible. Reduce decision friction when building or refining teams.
            </p>
          </article>
          <article className="rounded-2xl border border-white/80 bg-white/80 p-4">
            <h3 className="font-display text-lg font-bold text-ink">What You Get</h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              <li>Battle-first profile structure</li>
              <li>Search-driven navigation across data domains</li>
              <li>Comparison and matchup utilities in one flow</li>
              <li>Form support with Mega/Primal integration</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="marketing-fade-up marketing-stagger-5 rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="How To Use It"
          title="Suggested first-run flow"
          description="A fast onboarding path for new users."
        />

        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {usageSteps.map((step, index) => (
            <li
              key={step}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <CTASection
        title="Ready to build better teams?"
        description="Start with the surface that fits your workflow, then move through profile and comparison views to validate your decisions."
        actions={[
          { label: "Browse Pokemon", to: "/pokemon", variant: "primary" },
          { label: "Try Compare", to: "/compare", variant: "secondary" },
          { label: "Open Type Tool", to: "/types", variant: "ghost" },
          { label: "Learn More (About)", to: "/about", variant: "ghost" },
        ]}
      />
    </div>
  );
};
