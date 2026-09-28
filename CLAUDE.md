# Pote Sagrado — notes for Claude

- UI/UX work: use the `ui-ux-pro-max` skill (`.claude/skills/ui-ux-pro-max`) and follow
  `design-system/pote-sagrado/MASTER.md` (theme tokens, contrast, touch targets, forms).
- Colors only via theme tokens (`cookbook-*`); labels on primary use `text-cookbook-on-primary`,
  on gold `text-cookbook-on-gold`; lightest text is `text-cookbook-text/70`.
- Checks: `npx tsc --noEmit`, `npm run build`, `npm run test:rules`; `npm run dev:emulators` for local Firebase.
