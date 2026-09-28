# Pote Sagrado — Design System (Master)

Built with the **UI/UX Pro Max** skill (`.claude/skills/ui-ux-pro-max`, MIT).
Pages may add overrides in `design-system/pote-sagrado/pages/<page>.md`; without one, this file applies.

Regenerate references with:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "personal finance savings app elegant feminine" --design-system -p "Pote Sagrado"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<concern>" --domain ux
```

## Product

- Type: shared savings goal app (lifestyle fintech) for solo, couples and friend groups.
- Audience: young adults, mostly women, mobile first (PWA, 375–430px).
- Mood: romantic, premium, warm, playful without being childish.

## Style

- **Soft glassmorphism** (skill match: "Glassmorphism — lifestyle apps, financial dashboards"):
  translucent cards `bg-cookbook-bg/85 backdrop-blur-xl`, 1px theme border, soft wide shadow, radius 24–32px.
- Magic UI accents (shimmer button, border beam, blur fade) only on key moments (main CTA, milestones).
- Avoid: pure white page backgrounds, generic flat design, neon effects.

## Color tokens

All UI color comes from theme tokens (`src/index.css`), never raw hex in components.

| Token | Tailwind | Use |
|---|---|---|
| `--theme-bg` | `cookbook-bg` | page and card surfaces |
| `--theme-text` | `cookbook-text` | text; secondary text uses `/70` minimum |
| `--theme-border` | `cookbook-border` | dividers, card borders |
| `--theme-primary` | `cookbook-primary` | CTAs, active states |
| `--theme-on-primary` | `cookbook-on-primary` | labels/icons on primary surfaces |
| `--theme-gold` | `cookbook-gold` | premium highlights, gradients (decorative only) |

Default for new accounts: **Rosé** (skill palettes "Beauty/Spa — soft pink + lavender" and
"Wedding — romantic pink + elegant gold"): bg `#FFF7F8`, text `#3D2229`, primary `#C04F6A`, gold `#D4A574`.

Contrast rules (checked for every theme):

- White on primary ≥ 4.5:1 in light themes (primaries were darkened on the same hue to comply).
- Dark themes (Meia-noite, Cereja) use dark `on-primary` labels.
- Body/secondary text ≥ 4.5:1: `text-cookbook-text/70` is the lightest allowed text.
- Gold never carries text information on light backgrounds (≈2:1).

## Typography

- Headings: **Cormorant Garamond** (serif, editorial/romantic). Skill match: "Classic Elegant — luxury, beauty, fashion".
- Body/UI: **Inter**, tabular numbers for money (`data-money`).
- Minimum size 11px (uppercase micro labels only); body 14–16px; inputs render at 16px on phones (no iOS zoom).

## Spacing & layout

- 4/8px rhythm; card padding 20px (`p-5`); section gap 16–24px.
- Content width `max-w-md` on phones, bottom nav ≤ 5 items, respects safe areas.
- No horizontal scroll (`overflow-x: clip`).

## Interaction

- Touch targets ≥ 44×44px. Icon-only buttons (with `aria-label`) get an invisible 44px hit area
  from `index.css`; dense grids opt out with `.no-hit-expand`.
- Press feedback: `active:scale-95/98` plus color change, 150–300ms.
- Visible `:focus-visible` outline in the theme primary.
- `prefers-reduced-motion`: CSS animations are neutralized and `MotionConfig reducedMotion="user"` covers motion/react.
- Toasts and undo snackbar are `role="status"` live regions.

## Forms

- Visible labels above fields (placeholder is only an example), `autoComplete` set, errors next to
  the field with `role="alert"` and `aria-describedby`.

## Icons

- Lucide for all controls and navigation; emojis only as decorative content (never as the only label).
- Every icon-only button has an `aria-label`.

## Pre-delivery checklist

- [ ] Contrast checked in a light and a dark theme
- [ ] Touch targets ≥ 44px, no content under the bottom nav or notch
- [ ] Tested at 375px and 430px
- [ ] Reduced motion respected
- [ ] Icon buttons labeled, focus visible
