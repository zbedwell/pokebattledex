import { CTASection } from "../components/CTASection.jsx";
import { FeatureCard } from "../components/FeatureCard.jsx";
import { HeroSection } from "../components/HeroSection.jsx";
import { SectionHeader } from "../components/SectionHeader.jsx";

const featureBreakdown = [
  {
    title: "Pokemon Directory",
    description:
      "Battle-focused browsing with filtering and sorting by typing, ability, and core stat thresholds.",
  },
  {
    title: "Pokemon Detail Pages",
    description:
      "Unified tactical profile with evolution line, abilities, notable moves, matchup context, obtain methods, and similar picks.",
  },
  {
    title: "Compare Tool",
    description:
      "Side-by-side comparison for 2 to 4 Pokemon with winner highlights, defensive profile cues, and utility snapshots.",
  },
  {
    title: "Evolution Line",
    description:
      "Graph-based evolution display with branch handling, transformation labels, and support for Mega/Primal paths.",
  },
  {
    title: "Type Tool",
    description:
      "Interactive offensive and defensive type checks with clear grouping for weaknesses, resistances, and immunities.",
  },
  {
    title: "Moves + Abilities",
    description:
      "Directory and detail coverage for moves and abilities with battle context and linked Pokemon usage.",
  },
  {
    title: "Global Search",
    description:
      "Navbar quick-search across Pokemon, moves, abilities, and types for fast context switching.",
  },
  {
    title: "Obtain Methods by Game",
    description:
      "Per-game availability display integrated into Pokemon detail, including battle-only form behavior where applicable.",
  },
  {
    title: "Form Support (Mega/Primal)",
    description:
      "Multi-profile support for forms that change type/ability behavior, with dedicated evolution/transformation branch labels.",
  },
];

const usageSteps = [
  "Start with global search when you already know what to inspect.",
  "Use the Pokemon directory filters to narrow practical candidates.",
  "Open detail pages for stats, matchups, abilities, moves, evolution, and obtain methods.",
  "Compare multiple options side-by-side to finalize team decisions.",
  "Use Type Tool, moves, and abilities pages to refine matchup assumptions.",
];

const stackItems = [
  "React + Vite frontend",
  "Tailwind CSS styling system",
  "React Router navigation",
  "Node.js + Express backend APIs",
  "PostgreSQL runtime database",
  "Normalized local data pipeline sourced from PokeAPI",
  "No live external scraping dependency at runtime",
];

export const AboutPage = () => {
  return (
    <div className="space-y-10">
      <HeroSection
        eyebrow="About PokeBattleDex"
        title="A battle-focused Pokemon strategy reference built for faster team decisions."
        subtitle="PokeBattleDex helps you search, compare, and evaluate Pokemon through practical battle data: stats, type matchups, abilities, moves, evolution context, and obtain availability by game."
        primaryAction={{ label: "Explore Pokemon", to: "/pokemon" }}
        secondaryAction={{ label: "Try Compare", to: "/compare" }}
      >
        <div className="rounded-2xl border border-indigo-100 bg-white/85 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Mission
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Reduce decision friction during team building by turning scattered battle data
            into a clean, readable strategy workflow.
          </p>
        </div>
      </HeroSection>

      <section className="rounded-3xl border border-slate-200 bg-white/85 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="What It Does"
          title="Battle data, organized for practical use"
          description="Browse Pokemon, moves, abilities, and types. Compare candidates side-by-side. Inspect role tags, strengths, weaknesses, evolution lines, and matchup context without jumping across disconnected tools."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <FeatureCard
            title="Search + Browse Quickly"
            description="Jump directly into Pokemon, moves, abilities, and type references from one global workflow."
            icon={<span className="text-base">S</span>}
          />
          <FeatureCard
            title="Compare with Context"
            description="Evaluate options side-by-side with clear stat and matchup framing for team-building decisions."
            icon={<span className="text-base">C</span>}
          />
          <FeatureCard
            title="Understand Battle Profiles"
            description="Use summaries, tags, strengths/weaknesses, and notable moves to read each profile faster."
            icon={<span className="text-base">B</span>}
          />
          <FeatureCard
            title="Analyze Forms and Availability"
            description="Inspect form-specific behavior including Mega/Primal profiles and obtain methods by game."
            icon={<span className="text-base">F</span>}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Major Features"
          title="Current product coverage"
          description="These features are implemented in the current app experience."
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureBreakdown.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <h3 className="font-display text-lg font-bold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Battle-Focused by Design"
          title="Built for strategy clarity, not lore completeness"
          description="PokeBattleDex is designed for practical battle decision support: matchup readability, comparison speed, and tactical context."
        />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
              Designed For
            </p>
            <ul className="mt-3 space-y-2 text-sm text-emerald-900">
              <li>Strategy-first data organization</li>
              <li>Fast lookup and side-by-side comparison</li>
              <li>Readable matchup and role context</li>
              <li>Battle-oriented filtering and summaries</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-sm font-bold uppercase tracking-wide text-amber-700">
              Not Intended As
            </p>
            <ul className="mt-3 space-y-2 text-sm text-amber-900">
              <li>A lore encyclopedia</li>
              <li>A full battle simulator</li>
              <li>An account-based live service</li>
              <li>A story progression tracker</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="How To Use It"
          title="Recommended workflow"
          description="A simple flow to move from broad search to confident team decisions."
        />

        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {usageSteps.map((step, index) => (
            <li
              key={step}
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700"
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card md:p-8">
        <SectionHeader
          eyebrow="Built With"
          title="Implementation stack"
          description="A full-stack architecture optimized for reliable local runtime performance and battle-focused data modeling."
        />

        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {stackItems.map((item) => (
            <li
              key={item}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <CTASection
        title="Ready to build better teams with cleaner battle context?"
        description="Explore battle profiles, compare candidates, and validate matchup assumptions with tools designed for decision speed."
        actions={[
          { label: "Browse Pokemon", to: "/pokemon", variant: "primary" },
          { label: "Open Compare", to: "/compare", variant: "secondary" },
          { label: "Use Type Tool", to: "/types", variant: "ghost" },
        ]}
      />

      <p className="pb-2 text-center text-xs text-slate-500">
        PokeBattleDex is an educational strategy tool and is not affiliated with Nintendo,
        Game Freak, or The Pokemon Company.
      </p>
    </div>
  );
};
