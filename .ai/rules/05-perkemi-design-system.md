# Rule 05: Perkemi e-Dojo Visual Design System & Anti-AI Slop

## 1. Brand Philosophy: Shorinji Kempo Perkemi
Perkemi (Persaudaraan Bela Diri Kempo Indonesia) embodies discipline, martial arts precision (*Goju Ittai*, *Chiyo Bunken*), honor, and Indonesian sports excellence.
The digital interface must feel **authoritative, clean, refined, and athletic** — avoiding both corporate blandness and toy-like styling.

### Aesthetic Tokens
- **Primary Navy (Kurogane)**: `#0B132B` (deep background/header) and `#1C2541` (secondary dark surface)
- **Kempo Vermilion (Shushu Red)**: `#DC2626` (primary brand accent, urgent states, danger actions)
- **Dojo Gold (Obi Brass)**: `#D97706` (honor badges, Dan rankings, premium indicators, active highlights)
- **Neutral Light**: `#F8FAFC` (page background), `#FFFFFF` (card surfaces)
- **Borders & Dividers**: `#E2E8F0` (light mode), `#334155` (dark mode)
- **Text**: `#0F172A` (primary text, 4.5:1+ contrast), `#475569` (secondary text)

## 2. Anti-AI Slop Rules (Strictly Enforced)
To avoid generic, templated AI designs, follow these prohibitions:
1. **NO Emojis as UI Icons**: Never use emojis (🥋, 🥊, 🏆, 🚀, ⚙️) as icons in buttons, navigation, or data tables. Always use certified SVG icons (`lucide-react`).
2. **NO Generic Cliché Themes**:
   - Avoid the ubiquitous "warm cream background (`#F4F1EA`) with terracotta (`#D97757`)".
   - Avoid the "pitch black (`#0B0B0B`) with neon acid-green".
   - Avoid identical rounded cards everywhere with heavy generic blur shadows (`rgba(0,0,0,0.1)`).
3. **NO Decorative All-Caps Eyebrows**: Do not prepend random `ALL CAPS · TRACKED · LABELS` above every heading unless denoting a true document reference code.
4. **NO Arbitrary Card Fragmentation**: Group content logically using whitespace, subtle dividers, and typography instead of boxing every single metric into an isolated floating card.
5. **No Layout-Shifting Hover States**: Never apply transform `scale(1.05)` that jolts neighboring elements. Hover feedback must be color, background, and crisp subtle border transitions (`duration-150 ease-out`).
6. **No Unneeded Motion**: Do not animate every card with staggered fade-in upon scrolling. Motion must be purposeful: drawer slides, modal reveals, accordion expansions, and button loading spinners.

## 3. Typography & Hierarchy
- **Font Family**: Modern, legibility-first sans-serif (`Instrument Sans` / `Plus Jakarta Sans` / `Inter`).
- **Heading Scale**:
  - H1 (Page Title): `text-2xl font-bold tracking-tight text-slate-900`
  - H2 (Section Title): `text-lg font-semibold text-slate-800`
  - H3 (Subsection/Card): `text-base font-medium text-slate-800`
  - Body: `text-sm text-slate-600 leading-relaxed`
  - Small / Caption: `text-xs font-medium text-slate-500`
- **Line Length**: Max 75 characters for prose/reading blocks (`max-w-prose`).

## 4. Interaction, Focus & Accessibility (a11y)
- **Keyboard Navigation**: All interactive elements (buttons, inputs, links, dropdowns) must provide a visible focus ring:
  ```css
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600
  ```
- **Cursor State**: Every clickable element MUST have `cursor-pointer`.
- **Contrast**: Maintain minimum 4.5:1 contrast for normal text and 3:1 for large text.
- **Screen Reader Support**: Use proper ARIA attributes (`aria-label`, `aria-expanded`, `aria-haspopup`, `role="dialog"`).
- **Reduced Motion**: Respect system motion preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
