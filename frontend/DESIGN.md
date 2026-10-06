# Hot Potato UI

Apple-minimal. Neutral surfaces, one accent, system type, generous whitespace, hairline borders,
large radii, soft shadows. Content is the hero; chrome stays quiet. Everything must look finished at
375px and at 1440px.

## Tokens

Defined as CSS variables in `src/styles/globals.css` (light default, `html.dark` overrides) and exposed as
Tailwind colors in `tailwind.config.mjs`. Never hardcode a color; never use `dark:` variants, the
variables flip for you.

| Tailwind class | Use |
| --- | --- |
| `bg-bg` | page background (`#f5f5f7` / `#000`) |
| `bg-surface` | cards (white / `#1c1c1e`) |
| `bg-surface-muted` | inputs, inset sub-surfaces, hover states |
| `bg-surface-strong` | skeletons, pressed states |
| `bg-elevated` | sheets and popovers |
| `border-line`, `border-line-strong` | hairlines |
| `text-fg`, `text-fg-secondary`, `text-fg-tertiary` | primary / secondary / placeholder text |
| `bg-accent`, `text-accent`, `bg-accent-soft` | the one accent (ember orange) |
| `success`, `danger`, `warning` (+ `-soft`) | semantic states only |
| `shadow-sm`, `shadow-md`, `shadow-lg` | card, hover, sheet |
| `rounded-xl` 14px, `rounded-2xl` 18px, `rounded-3xl` 24px, `rounded-4xl` 32px | controls, inset, cards, hero panels |
| `ease-apple` | easing for all transitions |
| `animate-fade-up`, `animate-fade-in`, `animate-pulse-soft` | only animations in use |
| `.tnum` | tabular numbers (timers, stats, tables) |
| `.pixelated` | pixel-art hand images |
| `.pb-safe` | bottom safe-area padding for fixed bars |
| `max-w-page` | 72rem page column |

## Type

System stack (`font-sans`). Sizes are explicit pixel values, Apple-style:

- Hero: `text-[40px]` → `sm:text-[56px]` → `lg:text-[64px]`, `font-semibold tracking-tight`, line-height ≤1.1
- Page title: `text-[28px] sm:text-[40px]`
- Card title: `text-[17px] font-semibold`
- Body: `text-[15px]` or `text-[17px] leading-7` for lede copy
- Secondary: `text-[13px] text-fg-secondary`
- Caption / eyebrow: `text-[12px] uppercase tracking-wide font-medium text-fg-secondary`
- Big numbers: `text-[34px]` or larger, `font-semibold tracking-tight tnum`

No gradients on text. No glow. No emoji in headings (an emoji is fine as a small status glyph).

## Primitives (`src/components/ui`)

Use these instead of ad-hoc markup. All accept `className`.

- `Card` (`variant`: `default` padded card, `plain` no padding for tables/lists, `inset` muted
  sub-surface), `CardHeader {title, subtitle, action}`
- `Button {variant: primary|secondary|ghost|danger, size: sm|md|lg, loading, block, leading}`,
  `ButtonLink {href, external, ...same}`, `buttonClasses()`
- `Stat {label, value, hint, tone, align, size}`, `StatRow` (2 cols mobile / 4 desktop, hairline dividers)
- `Badge {tone: neutral|accent|success|danger|warning, dot, pulse}`
- `Field {label, hint, error}` wrapping `Input`, `Select`, `Textarea`
- `Segmented {options, value, onChange, size}` iOS-style segmented control
- `Skeleton`, `Spinner`
- `SectionHeader {eyebrow, title, description, align, size: md|lg|xl}`

Shell: `AppShell {title, description, width: narrow|wide|full, bottomBar, footer}` renders `<Head>`,
the fixed 56px `Navigation`, a centered `<main>` with `pt-14`, and the `Footer`. Pages render
`<AppShell>` and nothing else at the top level. Theme comes from `useTheme()` (`darkMode`, `toggle`);
components never take a `darkMode` prop.

`ConnectWalletButton {block, size}` is already restyled.

## Layout rules

- One column on mobile, stacked in priority order. Fixed bottom action bar (`fixed inset-x-0 bottom-0`,
  `bg-nav backdrop-blur-xl border-t border-line`, `.pb-safe`) only for the single primary action of the
  moment; the page gets `bottomBar` so content clears it.
- Desktop: a 12-column grid, main column 8 / side column 4 (`lg:grid-cols-12`), side column
  `lg:sticky lg:top-20`. Never three columns.
- Section spacing `space-y-6` inside pages, `py-16 sm:py-24` between landing sections.
- Cards don't nest inside cards; use `variant="inset"` for a sub-surface.
- Touch targets ≥ 40px. Inputs `h-10`, primary CTAs `size="lg"` on mobile.
- Tables: `Card variant="plain"`, `overflow-x-auto`, header row `text-[12px] uppercase tracking-wide
  text-fg-secondary`, rows `border-t border-line`, numbers `tnum text-right`. On mobile the same table
  may collapse to a list of rows with two lines each.
- Empty states: an eyebrow-less `SectionHeader` sized `md`, one sentence, one button. Centered.
- Loading: `Skeleton` blocks shaped like the content, not spinners, except inside buttons.
- Images: the hand art is pixel art, show it on `bg-surface-muted rounded-2xl` with `.pixelated`.
  The potato GIFs from `public/assets/images` are allowed at small sizes as accents, never as
  backgrounds. No `WebBackground*.png`.
- Motion: `transition-colors duration-200 ease-apple` on hover, `animate-fade-up` once on mount for
  hero and summary blocks, nothing continuous except `animate-pulse-soft` on a live dot.

## Don'ts

Old classes are gone: `card`, `card-dark`, `card-hover`, `btn-primary`, `gradient-text`, `normal`,
`darkmode`, `font-darumadrop*`, `animate-float`, `animate-bounce-slow`, `animate-pulse-slow`. No
`dark:` prefixes, no `gray-*`/`orange-*`/`amber-*`/`red-*` palette classes, no `drop-shadow`, no
`backdrop-blur` except the nav and bottom bar, no `bg-gradient-*`, no `transform hover:scale-105`
on large blocks, no borders thicker than 1px, no all-caps buttons.
