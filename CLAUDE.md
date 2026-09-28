# Pote Sagrado — notes for Claude

- UI/UX work: use the `ui-ux-pro-max` skill (`.claude/skills/ui-ux-pro-max`) and follow
  `design-system/pote-sagrado/MASTER.md` (theme tokens, contrast, touch targets, forms).
- Colors only via theme tokens (`cookbook-*`); labels on primary use `text-cookbook-on-primary`,
  on gold `text-cookbook-on-gold`; lightest text is `text-cookbook-text/70`.
- Icons: illustrative icons come from `src/components/ui/app-icon.tsx` (Phosphor duotone: `IconBadge`, `EmptyState`,
  `IconPicker`); Lucide only for controls; no emojis as icons.
- Checks: `npx tsc --noEmit`, `npm run build`, `npm run test:rules`; `npm run dev:emulators` for local Firebase.
