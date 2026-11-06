# Oaks Shade Advocates · design system

Locked 2026-11-01. Later pages share this system; they don't diverge from it.

## Feel

Austere and authoritative: chambers, not a startup. The palette and imagery come from the firm's
emblem (oak tree, two columns, scales of justice). Type does the heavy lifting; photography waits
for real client images.

## Colour (tokens in `src/styles/tokens.css`)

| Token | Use |
|---|---|
| `--color-paper` / `--color-paper-2` | page ground / people section |
| `--color-ink` | logo navy: text, rules, hover flood |
| `--color-night` | dark sections, nav, hero panel |
| `--color-brass` | the scales: small accents on night only, CTA button. Never small text on paper |
| `--color-oak` | role labels; sparing |

## Type

- Display: **Instrument Serif**, upright only. Never italic headings.
- Body: **Hanken Grotesk** (variable).
- Labels: body face, 12px, 600, tracked caps.

## Layout

Gutter `--gutter`; sections separated by hairline rules, not cards. Lists sit on rules.
Grids use `minmax(0, 1fr)`; everything collapses to one column under 48rem.

## Motion

GSAP + ScrollTrigger + SplitText + DrawSVG, Lenis smooth scroll. Big reveals use `expo.inOut` /
`expo.out`; UI uses `--ease-out`. Hover effects are gated to fine pointers. Under
`prefers-reduced-motion`: no Lenis, no preloader, no scroll scenes; the arch renders static.
Inventory: `../notes/motion-reference.md`.

## Components

Pill buttons with character roll · lettered ledger accordion · person entries on rules (no
photos yet) · night footer with fitted wordmark.

## Practice pages (`/practice/<slug>/`)

Breadcrumb → navy arch holding the brass practice letter beside the title and profile intro →
numbered services on drawn rules → night "Across Uganda & Kenya" strip (only where the profile's
regional list covers that practice) → Instruct the Firm with partner contacts → full-width
"Next practice" link with ink flood → index of all ten. Pages are joined by a night curtain
transition (`src/motion/transitions.js`); same-page anchors stay with Lenis.

## Contact page (`/contact/`)

Two columns: heading, notice (brass rule), chambers details and partner numbers on the left; the
form on a `--color-paper-2` panel on the right, stacking under 56rem. Fields use
`--color-field` with a `--color-field-border` edge (≥3:1); errors use `--color-error` inline plus a
summary at the top that takes focus. Motion is limited to the result panel's 350ms rise.

## Profile pages (`/people/<slug>/`)

Same skeleton as practice pages (shared motion in `src/motion/subpage.js`): arch with the person's
initials in brass (a portrait replaces it once supplied) → group label, name, role in oak green →
numbered qualifications → optional Profile (bio) → Get in touch (direct numbers for partners, the
Firm for advocates) → Next profile + index of everyone. Homepage names link here with a hairline
underline that draws on hover.
