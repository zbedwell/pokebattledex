# BattleDex UI Design Spec (Product Polish Phase)

## Summary
This spec defines the BattleDex visual system and page-level UI direction for a product-polish pass.

Decisions locked for this phase:
- Theme: Indigo/Cyan Tactical
- Motion: Subtle utility motion
- Dark mode: Deferred (light theme only)
- About page IA: Top nav link at `/about`
- Scope of this doc phase: Spec and copy only (no runtime UI implementation in this deliverable)

---

## Global Design Language

### 1) Color Tokens
Use these as canonical visual tokens.

| Token | Value | Usage |
|---|---|---|
| `--bg-page` | `#F6F8FC` | Main app background |
| `--bg-page-accent` | `#EEF3FF` | Header/hero tinted sections |
| `--bg-surface` | `#FFFFFF` | Cards, panels, input surfaces |
| `--text-primary` | `#0F172A` | Primary text |
| `--text-secondary` | `#475569` | Secondary text |
| `--text-muted` | `#64748B` | Labels, helper text |
| `--border-default` | `#DCE3F0` | Card/input/table borders |
| `--brand-primary` | `#4F46E5` | Primary CTAs, active highlights |
| `--brand-primary-hover` | `#4338CA` | CTA hover/pressed states |
| `--brand-glow` | `#06B6D4` | Focus glow, active accents |
| `--status-success` | `#16A34A` | Defensive/success cues |
| `--status-warning` | `#D97706` | Warning cues |
| `--status-danger` | `#E11D48` | Weakness/error cues |

Type badge color rules:
- Keep canonical type identity.
- Slightly desaturate compared to game-accurate palettes.
- Enforce text contrast >= WCAG AA for badge labels.
- Use type colors as accents only, not page-wide backgrounds.

### 2) Typography Scale

| Level | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display XL | `40px` | 800 | 1.1 | Hero title |
| Display L | `32px` | 800 | 1.15 | Page title |
| Heading M | `24px` | 700 | 1.2 | Section title |
| Heading S | `18px` | 700 | 1.25 | Card title |
| Body M | `16px` | 400/500 | 1.5 | Main body copy |
| Body S | `14px` | 400/500 | 1.45 | Supporting copy |
| Label XS | `12px` | 600 | 1.3 | Chips, labels |
| Micro | `11px` | 500 | 1.3 | Meta text |

Typography behavior:
- Display font for headings only.
- Body font for all paragraphs, labels, data-heavy text.
- Uppercase labels only for metadata/chips, not paragraph copy.

### 3) Layout and Surface Tokens

| Token | Value |
|---|---|
| Max content width | `1280px` |
| Section gap | `24px` desktop, `16px` mobile |
| Card radius | `16px` (`rounded-2xl`) |
| Input radius | `12px` |
| Border width | `1px` |
| Surface shadow (default) | `0 10px 28px rgba(15,23,42,0.08)` |
| Surface shadow (hover) | `0 16px 36px rgba(15,23,42,0.14)` |

### 4) Motion Tokens

| Motion | Duration | Easing |
|---|---|---|
| Card/button hover | `160ms` | `ease-out` |
| Dropdown open/close | `200ms` | `ease-out` |
| Section fade-up | `240ms` | `ease-out` |
| Table highlight pulse | `180ms` | `ease-in-out` |

Reduced motion policy:
- Respect `prefers-reduced-motion: reduce`.
- Disable transform-heavy transitions.
- Keep opacity-only transitions <= `120ms`.

### 5) Interaction States

Required states for all interactive controls:
- Default
- Hover
- Focus visible (brand ring + subtle glow)
- Active/pressed
- Disabled

Do:
- Use one consistent focus ring color (`--brand-primary` + `--brand-glow` shadow).
- Use subtle lift (`translateY(-2px)`) for interactive cards only.
- Use consistent disabled contrast and cursor behavior.

Do not:
- Use rainbow gradients.
- Use bouncy animations.
- Use low-contrast muted text below AA.
- Apply type-color backgrounds to whole pages.

---

## Reusable Component Specs

### Navbar
- Sticky header with translucent white surface and subtle blur.
- Active nav item: underline or pill highlight in brand color.
- Include About link in top nav.
- Global search retains grouped results with keyboard accessibility.

### PageHeader Variants
- `default`: title + subtitle + optional action area.
- `hero`: gradient/tint background with feature CTA.
- `action-heavy`: supports multiple action controls with wrap behavior.

### Card System
- `static-card`: informational sections.
- `interactive-card`: hover lift, border brighten, deeper shadow.
- `metric-card`: key values with icon/label.
- `list-row-card`: compact row item with hover tint.

### Buttons
- `primary`: brand background, white text, subtle glow on hover.
- `secondary`: neutral/tinted background with border.
- `ghost`: transparent with hover tint.

### Inputs and Filters
- Inputs/selects/search share one focus treatment and border token.
- Filter sections grouped with optional collapsible behavior.

### Chips and Badges
- Role chips, type badges, match-up chips, metadata pills all follow one radius/padding system.
- Match-up chips:
  - Weaknesses: danger tint
  - Resistances: success tint
  - Immunities: neutral-success tint

### Data Tables
- Sticky header for compare table.
- Alternating row tint.
- Winner cells use subtle highlight tint, not hard saturation.

### Loading/Error/Empty
- Loading: skeleton shimmer for list/card regions; spinner only for small inline actions.
- Error: consistent icon + heading + actionable text.
- Empty: descriptive text with next action suggestion.
- Info/health: consistent banner slot directly under page header.

---

## Page-by-Page UI Direction

Each page must specify hierarchy, responsive behavior, key interactions, and accessibility rules.

### Home
- Hero with controlled indigo/cyan gradient + mission statement + primary actions.
- Quick actions as interactive cards.
- Featured stat lists with hover-highlight rows and optional sprite thumbnails.

### Pokemon Directory
- Sticky left filter rail.
- Active filter chips row above results.
- Results toolbar with count + sort summary.
- Interactive Pokemon cards with stable scan order.

### Pokemon Detail (Flagship)
- Hero summary block with name, dex, types, role tags, summary, sprite, quick actions.
- Battle snapshot strip for immediate tactical read.
- Animated stat bars (respect reduced motion).
- Match-up chips and insight sections with consistent iconography.

### Moves Directory
- Same shell as Pokemon Directory for consistency.
- Move cards with clear hierarchy: name/type, metadata chips, effect summary.
- Null/unknown values formatted intentionally (`Power -` style standardization).

### Move Detail
- Top hero card with critical move metadata chips.
- Effect section + learned-by cards.
- Strategy cue block (lightly curated positioning guidance).

### Abilities Directory
- Cooler neutral visual treatment, less type-color intensity.
- Ability cards show short effect + battle classification + Pokemon count.

### Ability Detail
- Hero + impact note + Pokemon list cards.
- Hidden/primary slot labels visible and readable.

### Type Tool
- Tool-like top control panel with clear/reset affordance.
- Strong result banner (`attacking into defending = multiplier`).
- Effectiveness chips and card states with clear color semantics.

### Compare
- Four-layer structure:
  1. Selector panel
  2. Quick winner cards
  3. Stat comparison table
  4. Defensive + utility insight panels
- Mobile-first overflow behavior for table.

### Not Found
- Keep tone concise and brand-consistent.
- Clear single CTA to recover to Home.

Accessibility baseline for all pages:
- Fully keyboard reachable interactive elements.
- Visible focus rings.
- AA contrast for text and chip labels.
- Touch targets >= 40px visual height where practical.

---

## Planned Interface Changes (Future Implementation)
- Add frontend route: `/about`.
- Add `About` to top nav IA.
- No backend API changes required.

---

## Visual QA and Acceptance Checklist

### Visual consistency
- No ad-hoc colors/radii/shadows outside token set.
- Card, button, badge, and input states are consistent across pages.

### Interaction quality
- Hover/focus/active states are visible and consistent.
- Motion is subtle, fast, and non-distracting.
- Reduced-motion fallback is respected.

### Responsive quality
- Home hero/search, directory filters, compare table, type tool controls, detail headers all remain usable on mobile.

### Accessibility
- Keyboard nav complete for nav/search/filters/compare.
- Focus ring visible in all key controls.
- Text and badge contrast meet WCAG AA.

---

## Assumptions
- This document defines the implementation target but does not apply runtime code changes.
- Dark mode is explicitly deferred.
- BattleDex remains battle-focused and data-first (not a lore/simulator product in this phase).
