# Dash design system

Dash should feel like a tool an engineer keeps open, not a portal they are sent to. Calm, dense, precise. One accent colour. No decoration.

This file is the contract. UI that is not in here does not get invented in the moment.

## Principles

1. **Hairline, not shadow.** Depth comes from 1px borders and white-on-cream contrast. No drop shadows, no glass, no gradients on chrome.
2. **One voltage.** Orange is for the primary action on a screen, and almost nowhere else. Status uses semantic green and red, not orange.
3. **Weight 400 until it earns 600.** Headings are not bold by default. Titles that label a record (service name, team name) may use 600.
4. **Code is first-class.** Service keys, repo names, rule identifiers, and API tokens render in JetBrains Mono.
5. **British English in the UI.** Catalogue, organisation, colour. Code and JSON stay in US identifiers (`organization`, `catalog`) so the API matches the rest of the industry.
6. **Empty states tell you what to do.** Never a blank table with a shrug.

## Colour

Warm cream canvas. Warm ink. Not pure white, not pure black, not a dark-IDE theme.

| Token | Hex | Use |
| --- | --- | --- |
| `--canvas` | `#f7f7f4` | Page background |
| `--canvas-soft` | `#fafaf7` | Inset panes, code wells |
| `--surface` | `#ffffff` | Cards, tables, dialogs |
| `--ink` | `#26251e` | Titles, primary text, icons |
| `--body` | `#5a5852` | Running text |
| `--muted` | `#807d72` | Meta, timestamps, placeholders |
| `--hairline` | `#e6e5e0` | Default borders |
| `--hairline-strong` | `#cfcdc4` | Hovered / active borders |
| `--accent` | `#f54e00` | Primary CTA only |
| `--accent-active` | `#d04200` | Pressed CTA |
| `--on-accent` | `#ffffff` | Text on CTA |
| `--success` | `#1f8a65` | Passing rules, gold/silver achieved |
| `--danger` | `#cf2d56` | Failing rules |
| `--warning` | `#c08532` | Stale, missing recommended |

Do not introduce a second brand colour. Do not use pastels as status.

## Typography

- UI: **Inter**, 400 / 600. Inter is the open substitute for a licensed grotesque. Do not bundle a proprietary face.
- Code: **JetBrains Mono**, 400.

| Style | Size | Weight | Line | Use |
| --- | --- | --- | --- | --- |
| Display | 36 / 26px | 400 | 1.2 | Marketing headlines only |
| Title | 18px | 600 | 1.35 | Service name on a detail page |
| Body | 14px | 400 | 1.5 | App body |
| Caption | 12px | 400 | 1.4 | Meta, table secondary |
| Label | 11px | 600 | 1.3 | Uppercase section labels, `letter-spacing: 0.06em` |
| Code | 13px | 400 | 1.45 | Keys, repos, tokens |

App chrome is 14px. Marketing may go larger. Do not set app body to 16px; it wastes density.

## Shape and space

- Radius: 6px controls, 8px cards, 9999px pills (badges, levels).
- Icon buttons: 32px. Primary buttons: height 36px, padding 10px 14px, radius 8px.
- Page padding: 24px. Section gap: 24px. Table cell padding: 10px 12px.
- Sidebar: 220px, hairline right border, canvas background.

## Components

**Primary button.** `--accent` fill, `--on-accent` label, 8px radius. One per view.

**Secondary button.** White fill, hairline border, `--ink` label. Hover: `--hairline-strong`.

**Ghost button.** Transparent, `--body` label. Used in the sidebar and toolbars.

**Badge / level pill.** Fully rounded. Bronze `#c08532` on cream is too loud; use a hairline pill and coloured text instead: Bronze muted gold text, Silver body text, Gold `--success`. Failed: `--danger`.

**Table.** White surface, hairline around, no zebra. Header caption-uppercase in `--muted`. Row hover `--canvas-soft`. Clickable rows.

**Score.** A compact fraction (`12/14`) plus a level pill. Do not draw donut charts.

**Command palette.** `Cmd+K`. White surface, hairline, no shadow. Groups: Services, Teams, Scorecards, Settings.

## Product chrome

Left nav, not a top megamenu. Nav items: Catalogue, Teams, Scorecards, Settings. Wordmark top-left: "Dash" in Inter 600 14px, no tagline in the app.

The service page is the product. It answers, in this order: what it is, who owns it, where the code is, whether it is production-ready, which rules failed.

## Anti-patterns

- Gradient backgrounds, glassmorphism, hero illustrations of abstract blobs
- "AI-powered" badges, sparkles, or purple accents
- Dark mode as a default (not in v1)
- Cards inside cards
- More than one orange element competing for attention
- Placeholder grey boxes labelled "coming soon" on the service page
