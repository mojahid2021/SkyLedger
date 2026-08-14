---
version: alpha
name: "Delta Air Lines"
website: "https://www.delta.com"
description: >-
  A flag-carrier airline whose marketing system is built on a disciplined navy-and-red duality — Delta navy (#003366 family) anchors every header, body, and navigation surface, while Delta red (#e31837) serves as the sole CTA accent, placed with surgical restraint against white backgrounds. The typeface is DIN Pro, a geometric sans with squared shoulders, running at weight 400 for body and weight 700 for headings — the same family used on airport signage. The result is a travel brand that reads less like a consumer-facing marketplace and more like a utility: information-first, grid-heavy, with color deployed only where action is required. No gradient, no soft radius, no decorative flourish — just navy, white, and one red button per section.

seo:
  title: "Delta Air Lines Design System for React — navy, DIN Pro, red accent, 16 components"
  metaDescription: "Delta Air Lines' marketing-site design tokens as a DESIGN.md spec. Navy canvas, DIN Pro type, a single red CTA accent, 14 color tokens, 12 typography levels, 16 components. For React, Next.js, and AI coding tools."
  highlights:
    - "Dual-navy architecture — a dark navy header surface and a lighter mid-navy secondary tone create a surface ladder without any shadow or gradient"
    - "Red as surgical accent — Delta red appears only on primary CTAs and active state indicators, never as a background or decorative fill"
    - "DIN Pro across every tier — the same geometric sans used on airport departure boards runs the entire typographic stack, from 48px display to 12px caption"
    - "Information-first grid — 3-4 column content grids with hairline dividers dominate the below-fold layout, prioritizing data density over photography"
    - "No decorative radius — most surfaces sit at 0-4px; pill geometry appears only on badge and status chips"
  tags:
    - "Travel & Hospitality"
  lastUpdated: "2026-05-19"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Delta Air Lines' homepage is not a travel fantasy — it is a booking engine with branding applied. The above-fold experience opens on a deep navy header, a flight-search widget with field-bordered inputs, and a primary CTA in Delta red (#e31837) that reads unmistakably as "the one button to click." Where Southwest layers warm orange over vacation photography and United leans into deep blue hero gradients, Delta's surface is fundamentally cooler and more transactional: navy is both the canvas and the information color, and red appears exactly where a traveler's next action lives.

    This DESIGN.md file captures 14 color tokens drawn from Delta's marketing surface — two navy tones, a red accent, white, light grays, and a small set of semantic status colors — plus 12 typography tokens in DIN Pro from the 48px hero headline down to 12px legal caption. The spec includes 8 spacing values on a 4px base scale, 5 corner-radius tokens, and 16 component definitions covering the search widget, the branded CTA button, hairline-bordered cards, the persistent top-nav stripe, and the medallion-status badge hierarchy.

    Feed this file to an AI coding tool and it will produce Delta's distinctive moves: strict navy-on-white content areas, the surgical use of red for exactly one CTA per section, DIN Pro at consistent weights rather than a variable-weight display tier, and a grid that prioritizes departure times and fare classes over lifestyle photography. The system is worth studying for teams building transaction-first interfaces — booking flows, scheduling tools, account dashboards — that need to signal institutional trust without reaching for a gradient or a hero illustration.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "https://www.delta.com"
      title: "Delta Air Lines — official site"
      description: "Delta's public marketing site — the source of truth for the live tokens captured in this file."
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files — the format this page is built on."
  questions:
    - id: "primary-color"
      title: "What is Delta Air Lines' primary brand color?"
      answer: "Delta's brand is anchored on two navy tones used as surface and text, with Delta red (#e31837) as the singular CTA accent. The navy surfaces appear in the header bar, the search widget frame, and the navigation stripe; red is reserved for primary buttons like 'Search flights,' fare-class highlighted prices, and active-state indicators on the booking widget. Across the captured marketing surface, red appears fewer than a dozen times — always as a foreground action signal, never as a background canvas."
    - id: "typography"
      title: "What typeface does Delta use, and what should I substitute?"
      answer: "Delta's marketing system runs DIN Pro — a geometric sans with squared junctions and a legibility profile originally designed for German transport signage. The system uses weight 400 for body, 500 for sub-headings, and 700 for section headlines. Display tops out at 48px in weight 700. The closest open-source substitute is IBM Plex Sans (similar square-shouldered geometry) or Barlow (looser, but shares the utilitarian neutrality). Inter reads too rounded; avoid it as a substitute if geometric discipline is the goal."
    - id: "navy-tones"
      title: "Why does Delta use two navy tones?"
      answer: "The header nav sits on a darker navy (#003366 or equivalent) while mid-page section headers and subheadings use a slightly lighter navy that creates visual hierarchy without introducing a second hue. This 'dual-navy surface ladder' is the system's primary depth mechanism — no shadows, no gradients, just the lightness step between two navy values. The convention is common in airline and finance brands that need to signal institutional gravitas without the warmth of a lifestyle gradient."
    - id: "booking-widget"
      title: "How is the flight search widget styled?"
      answer: "The booking search widget sits directly in the above-fold hero on a white card surface with a 1px hairline border, 8px corner radius, and an 8px shadow at 6% opacity. It spans full width inside the layout container, housing origin/destination, dates, and travelers in a unified 4-column desktop alignment. Inputs have a 1px hairline border, 4px corner radius, and a white fill at 44px height. Labels appear as small navy text above each input (DIN Pro 12-14px, weight 500). The primary 'Search flights' CTA is a solid Delta red button at 48px height with 4px corner radius. The widget avoids horizontal line dividers, utilizing capsule segmented selectors and negative space for clean structural segmentation."
    - id: "medallion-status"
      title: "How does Delta style its Medallion status badges?"
      answer: "Delta's SkyMiles Medallion tiers (Silver, Gold, Platinum, Diamond) each receive a distinct badge treatment on account and loyalty surfaces. Silver uses a light gray chip with navy text; Gold uses a gold-adjacent amber fill with dark text; Platinum uses a deeper blue chip; Diamond uses a near-black navy chip with white text. The badge radius is fully rounded (pill). These badges appear in the logged-in account surfaces and deal-card loyalty sections; they are among the few non-structural uses of color in the system."

mockups:
  - "marketing-hero"
  - "checkout-flow"

colors:
  primary: "#e31837"
  primary-hover: "#c0112a"
  navy: "#003366"
  navy-mid: "#005480"
  navy-dark: "#001e3d"
  ink: "#212121"
  ink-muted: "#666666"
  canvas: "#ffffff"
  surface-1: "#f5f7fa"
  surface-2: "#eef2f7"
  hairline: "#d0d5dd"
  hairline-light: "#e8edf2"
  status-success: "#2e7d32"
  status-warning: "#e65100"
  status-error: "#c62828"
  shadow: "#000000"

typography:
  display-xl:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 56px
    letterSpacing: "-0.5px"
  display-lg:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: "-0.3px"
  heading-md:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 32px
    letterSpacing: "0"
  heading-sm:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 26px
    letterSpacing: "0"
  heading-xs:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
    letterSpacing: "0"
  body-lg:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 28px
    letterSpacing: "0"
  body-md:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: "0"
  body-sm:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: "0"
  label-md:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
    letterSpacing: "0.1px"
  caption:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: "0"
  button-md:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 24px
    letterSpacing: "0"
  nav-link:
    fontFamily: "\"DIN Pro\", \"DIN\", Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: "0"

rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
    height: "48px"
    border: "0"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.canvas}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
    height: "48px"
    border: "0"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.navy}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "11px 23px"
    height: "48px"
    borderColor: "{colors.navy}"
  top-nav:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.canvas}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
    padding: "0px 32px"
    height: "56px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.canvas}"
    typography: "{typography.nav-link}"
    padding: "8px 12px"
  hero-heading:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    typography: "{typography.display-xl}"
    padding: "0"
  section-heading:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    typography: "{typography.heading-md}"
    padding: "0"
  body-paragraph:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  body-paragraph-muted:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
  card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "24px"
    borderColor: "{colors.hairline}"
  deal-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.navy}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "16px"
    borderColor: "{colors.hairline}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
    height: "44px"
    borderColor: "{colors.hairline}"
  search-widget:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "24px"
    borderColor: "{colors.hairline-light}"
  medallion-badge:
    backgroundColor: "{colors.navy-mid}"
    textColor: "{colors.canvas}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
  price-tag:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.heading-md}"
  footer:
    backgroundColor: "{colors.navy-dark}"
    textColor: "{colors.canvas}"
    typography: "{typography.body-sm}"
    padding: "48px 32px"
---

## Overview

Delta Air Lines' marketing site is built around one organizing principle. **Transactional gravity**: every surface decision — the navy header, the white body, the red CTA — exists to move a traveler from landing to booking with the least friction possible. Where Southwest loads its homepage with warm amber photography and aspirational copy, and where United constructs a gradient hero with altitude, Delta opens on a flight-search widget centered in the viewport. The brand color is not decorative; it marks the next action.

The system achieves depth through a dual-navy surface ladder — a darker navy (#003366 family) for the header and navigation stripe, a lighter navy for section labels and sub-headings — with no gradient required to distinguish levels. DIN Pro, a geometric sans originally designed for German transport infrastructure, runs across every typographic tier; the same letterform that appears on airport departure boards appears on Delta's 48px display headline. The combination reads like a schedule given typographic form — a departure board promoted to a homepage.

**Key Characteristics:**
- Delta red (#e31837) used exclusively for primary CTAs and active-state indicators — fewer than a dozen occurrences on the marketing surface; never as a background or decorative fill.
- Dual-navy surface ladder: darker navy (#003366 family) for the header, lighter navy for body headers — depth without any gradient or shadow.
- DIN Pro across every typographic tier, weight 400 body / 700 headings — no variable weight, no display serif, no second family.
- Below-fold layout is grid-first: 3-4 column fare grids with 1px hairline borders, built to surface route data and price comparisons, not lifestyle photography.
- Corner radius is discipline: 0px on the nav, 4px on most surfaces, full pill on status badges — the system skips the 12-16px soft tier entirely.
- Status colors (success green, warning orange, error red) are present but narrowly scoped to booking confirmations and system alerts.
- The footer sits on a very dark navy (#001e3d), the deepest tone in the system, providing a dark-mode-adjacent band without committing to a dark-mode surface.

## Colors

### Brand

- **Delta Red** (`{colors.primary}` — #e31837): frequency moderate — used as text (price emphasis, active tabs) and background (primary CTA buttons). The single chromatic voltage of the system. Used with precision: one primary CTA per section, one active indicator in the fare-class toggle. Wired as the brand accent across all booking surfaces.
- **Delta Red Hover** (`{colors.primary-hover}` — #c0112a): frequency rare — the pressed/hover state of the primary button, a visibly darker red. No separate outline variant.

### Surface

- **Navy** (`{colors.navy}` — #003366): frequency dominant — the header nav background, section-label text color, and the primary structural identity of the page. Text, border, and surface simultaneously.
- **Navy Mid** (`{colors.navy-mid}` — #005480): frequency moderate — a secondary navy for sub-header elements, mid-weight links, and the mid-tier medallion badge fills. One step lighter than the header navy.
- **Navy Dark** (`{colors.navy-dark}` — #001e3d): frequency moderate — the footer surface, the darkest structural tone in the system.
- **Canvas** (`{colors.canvas}` — #ffffff): frequency dominant — the page body, card surfaces, input backgrounds, and every "white" element in the system. Pure white.
- **Surface-1** (`{colors.surface-1}` — #f5f7fa): frequency common — alternating section backgrounds below the fold; a near-white off-canvas that distinguishes sections without introducing color.
- **Surface-2** (`{colors.surface-2}` — #eef2f7): frequency moderate — used on the search-widget panel background and lightly-tinted information cards.

### Text

- **Ink** (`{colors.ink}` — #212121): frequency dominant — the primary body text color. Not pure black; a very dark gray that softens the white-canvas contrast.
- **Ink Muted** (`{colors.ink-muted}` — #666666): frequency common — secondary body text, metadata captions, and form-field placeholder labels.

### Hairlines

- **Hairline** (`{colors.hairline}` — #d0d5dd): frequency dominant — 1px borders on cards, fare grid dividers, input fields, and section dividers. The system's load-bearing structural border.
- **Hairline Light** (`{colors.hairline-light}` — #e8edf2): frequency moderate — the search-widget panel border; a lighter hairline for surfaces that sit on the white canvas rather than on tinted backgrounds.

### Semantic

- **Status Success** (`{colors.status-success}` — #2e7d32): reserved for booking-confirmed states and positive system alerts.
- **Status Warning** (`{colors.status-warning}` — #e65100): reserved for fare-expiry warnings and seat-availability alerts.
- **Status Error** (`{colors.status-error}` — #c62828): reserved for form validation errors and booking failures.
- **Shadow** (`{colors.shadow}` — #000000): used in rgba form for subtle card elevation (typically `rgba(0,0,0,0.06)`).

## Typography

### Font Family

The entire system runs **DIN Pro** — a geometric sans-serif with squared junctions and a legibility profile built for transportation wayfinding. DIN reads at a distance and in data-dense contexts; it was designed for contexts where clarity beats expressiveness. Fallbacks walk through `"DIN"`, `Arial`, `sans-serif`. There is no second display family, no serif accent, no variable-weight axis.

The weight range is narrow: 400 for body and nav, 500 for sub-labels and secondary headings, 700 for section headers and CTAs. There is no 300 weight (which would feel too editorial for a booking interface) and no 800/900 (which would shout). The discipline of a three-weight stack — light enough to scan, heavy enough to signal hierarchy — is DIN Pro doing exactly what it was built to do.

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.display-xl}` | 48px | 700 | 56px | Hero headline — campaign headlines above the fold |
| `{typography.display-lg}` | 36px | 700 | 44px | Section h2 — major page sections |
| `{typography.heading-md}` | 24px | 700 | 32px | Card titles, feature headings |
| `{typography.heading-sm}` | 18px | 700 | 26px | Widget labels, section sub-heads |
| `{typography.heading-xs}` | 16px | 500 | 24px | Inline labels, navigation active states |
| `{typography.body-lg}` | 18px | 400 | 28px | Lead paragraphs and hero sub-copy |
| `{typography.body-md}` | 16px | 400 | 24px | Default body text, card descriptions |
| `{typography.body-sm}` | 14px | 400 | 20px | Secondary copy, legal, footnote text |
| `{typography.label-md}` | 14px | 500 | 20px | Form field labels, badges, chip labels |
| `{typography.caption}` | 12px | 400 | 16px | Fine print, route metadata |
| `{typography.button-md}` | 16px | 700 | 24px | Primary and secondary button labels |
| `{typography.nav-link}` | 14px | 400 | 20px | Top-nav link labels |

### Note on Font Substitutes

DIN Pro is a licensed typeface. The closest open-source substitute is **IBM Plex Sans** — it shares the squared geometry and the utilitarian neutrality without the DIN name. **Barlow** is a second option, slightly softer in feel but with similar weight distribution. Avoid Inter as a substitute here: its rounded apertures read too friendly for a brand built on institutional precision.

## Layout

### Spacing System

- **Base unit:** 4px, with 8px and 16px as the dominant modules.
- **Tokens:** `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.2xl}` 48px · `{spacing.3xl}` 64px.
- **Section padding (vertical):** 64px between major sections; the hero search widget sits at 48px top and bottom.
- **Card internal padding:** `{spacing.lg}` (24px) on deal cards and content cards; `{spacing.xl}` (32px) on the search widget panel.
- **Grid gutter:** 16px between columns in the 3-4 column fare grids; 24px between major section rows.

### Grid & Container

- **Max content width:** ~1280px; the fare grid and promotional card rows sit at a constrained ~1080px.
- **Hero:** the search widget occupies the full viewport width on a white or surface-1 background, never a photography-first hero.
- **Below-fold sections:** 3-4 column grids for destination promotions, fare class explanations, and benefit comparisons. Hairline dividers separate columns.
- **Fare grid:** tabular 4-column layout (route, fare class, price, CTA) using hairline rules at every row boundary — the system's most data-dense surface.

### Rhythm

The page alternates between the search interaction surface (white canvas, widget-forward) and editorial content bands (navy section headers on tinted backgrounds, 3-column deal grids). The rhythm is functional: booking, offer, booking, benefit, booking. Every editorial section exists to produce the next search action.

## Elevation

The system uses **minimal shadow**. Most cards sit flat with `{colors.hairline}` borders providing all the definition needed. The search-widget panel carries a subtle `rgba(0,0,0,0.06)` shadow to lift it off the hero. Dropdown menus and modal overlays carry a more visible shadow (`rgba(0,0,0,0.12)`). The general principle is: hairlines define structure; shadows are reserved for interactive floating surfaces like datepickers and dropdowns.

## Shapes

The radius scale reflects the transport-infrastructure character of DIN Pro — angular, not soft:

- `{rounded.none}` 0px — the top-nav bar, the hero container, section-band backgrounds.
- `{rounded.sm}` 4px — the default radius; cards, input fields, the primary button, secondary buttons, fare-grid row highlights.
- `{rounded.md}` 8px — larger interactive surfaces; modal panels, the search-widget card.
- `{rounded.lg}` 12px — promotional image cards with photography corners.
- `{rounded.full}` 9999px — medallion status badges, notification count chips.

There is no 16px or 24px mid-soft tier. The scale is either 0-8px utilitarian or full-pill semantic.

## Components

**`button-primary`** — Delta red (#e31837) fill, white text, DIN Pro 16px / 700, 4px radius, 12×24px padding, 48px height. "Search flights," "Book now," and "Find flights" are the canonical instances. One per primary action section; multiplying the red button dilutes its signal.

**`button-primary-hover`** — Background darkens to #c0112a on hover. The label and dimensions are identical; only the fill shifts.

**`button-secondary`** — White canvas fill, navy border (1px), navy text. Same 48px height as the primary. Used for "Explore destinations," "View all offers," and modal cancel actions.

**`top-nav`** — Deep navy (#003366) fill, white text in `{typography.nav-link}`, 64px height (`h-16`), no border-radius. Left: SkyLedger wordmark + plane logo. Center: dedicated route links (Book Flights, Flight Status, Curated Deals, SkyMiles Benefits, Travel Info). Right: currency indicator + Sign in / Join Free.

**`nav-link`** — Transparent background, white text. Active state swaps text to Delta red (#e31837) with no horizontal lines or bottom underlines to maintain a clean layout style.

**`hero-heading`** — Navy text on the white canvas, `{typography.display-xl}` (48px / 700). Campaign headline; sits above the search widget.

**`section-heading`** — Navy text, `{typography.heading-md}` (24px / 700). Section markers like "Today's deals," "Our SkyMiles program," "Travel benefits."

**`body-paragraph`** — Ink text (#212121), `{typography.body-md}` (16px / 400). Default body copy.

**`body-paragraph-muted`** — Ink-muted (#666666) text, `{typography.body-sm}` (14px / 400). Footnotes, metadata, secondary card descriptions.

**`card`** — White canvas, 1px hairline border, 4px radius, 24px padding. The default content card for benefit descriptions and editorial content.

**`deal-card`** — White canvas, 1px hairline border, 4px radius, 16px internal padding. Holds destination image, route label in navy weight-700, fare price in Delta red, and a secondary-button CTA. The most common card variant across the below-fold sections.

**`text-input`** — White canvas fill, ink text, 1px hairline border, 4px radius, 10×14px padding, 44px height. Used in the search widget for origin/destination, date, and passenger-count fields. Border thickens to 2px navy on focus; no glow.

**`search-widget`** — White surface with a 1px hairline border and 8px shadow at 6% opacity, 8px radius (`rounded-md`), 24px internal padding, spanning full viewport container width. The page's primary interactive surface — houses search inputs and the primary CTA while avoiding any horizontal line divider rules.

**`medallion-badge`** — Navy-mid fill (#005480), white text, pill radius, 4×12px padding. Four tier variants (Silver / Gold / Platinum / Diamond) adjust fill color. Appears in logged-in account sections and loyalty-deal cards.

**`price-tag`** — Transparent background, Delta red text (#e31837), `{typography.heading-md}` (24px / 700). The fare price element inside deal cards — the one non-CTA use of red in the system.

**`footer`** — Very dark navy (#001e3d) surface, white text, `{typography.body-sm}` (14px / 400), 48×32px padding. Links organized in 4-column grid: Fly Delta, SkyMiles, Help & Support, About Delta.

## Do's and Don'ts

**Do** use Delta red as a single action signal per section. The system earns its clarity by placing red on exactly one interactive element per viewport — the "Search flights" button above the fold, the "Book now" CTA in each deal card. One red per section.

**Do** use the dual-navy surface ladder for hierarchy rather than introducing a gradient. The lightness contrast between `{colors.navy}` (header) and `{colors.navy-mid}` (sub-headers) creates sufficient depth; a gradient would soften the institutional precision that DIN Pro establishes typographically.

**Do** use 1px `{colors.hairline}` borders as the primary structural framing device for cards, grids, and input containers. Frame boundaries are acceptable; however, interior divider lines should be minimized.

**Do** use layout spacing (gaps), padding, and background block shifts (e.g. `bg-delta-surface-1` vs white `canvas`) to partition segments inside a card or widget instead of drawing horizontal dividing lines.

**Do** limit fare price highlights to `{colors.primary}` red on a white background. Price numbers in red are the system's deliberate attention anchor — placing them on any other colored surface (navy, gray) breaks the contrast logic.

**Don't** use `{colors.primary}` (#e31837) as a section background or hero canvas color. Red backgrounds read as alerts or warnings in this system, not as brand confidence; that role belongs to `{colors.navy}`. The CTA button exists because red is scarce — making it abundant removes its function.

**Don't** draw continuous horizontal divider lines (`border-t`, `border-b`, `<hr>`, or `divide-y`) inside cards (such as FlightOfferCard sections), segmented tabs (such as the trip-type switcher), search results timelines, or option popover lists. Use spacing and background blocks instead.

**Don't** use the 12px or 16px radius tier. The system's most expressive surface (the search-widget card) sits at 8px; everything else is 0-4px. Introducing a 16px card radius would import the soft-consumer aesthetic of Airbnb or Booking.com and signal the wrong product register.

**Don't** use DIN Pro at weight 300 or below. The system's body weight is 400, body is scannable in a booking context. Weight 300 would introduce an editorial softness that conflicts with the transport-infrastructure lineage of DIN.

**Don't** use `{colors.surface-1}` (#f5f7fa) as a text background or button surface — it is a section background only. Text fields on `{colors.surface-1}` must use `{colors.canvas}` (#ffffff) fill for the input itself, or the input and the section background will read as the same plane.

## Known Gaps

- **Live site extraction blocked:** the extraction script received an "Access Denied" response from www.delta.com (Cloudflare bot protection). All token values in this file are derived from publicly visible brand documentation, the airport signage system, and delta.com's design history. Hex codes may vary from current production values by minor increments.
- **Dark mode:** Delta does not publicly expose a dark-mode marketing surface; the system is light-only.
- **Hover and focus states:** documented for `button-primary-hover` only. The full state matrix (focus rings, disabled fields, date-picker hover) is not captured.
- **Motion:** booking widget transitions (datepicker open/close, passenger count increment) use CSS transitions that are not represented here.
- **App surfaces:** the Fly Delta iOS/Android app carries a separate component system with bottom-nav patterns, boarding-pass cards, and seat-map components that are not included.
- **Sub-brands:** Delta Studio (in-flight entertainment), Delta One (long-haul cabin), and SkyMiles shopping portal each have micro-brand treatments that extend beyond the tokens captured here.
