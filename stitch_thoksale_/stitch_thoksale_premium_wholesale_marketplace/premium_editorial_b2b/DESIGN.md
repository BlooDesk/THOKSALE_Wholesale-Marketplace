---
name: Premium Editorial B2B
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#775a1a'
  on-secondary: '#ffffff'
  secondary-container: '#fdd488'
  on-secondary-container: '#785a1b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002114'
  on-tertiary-container: '#069669'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdea4'
  secondary-fixed-dim: '#e8c177'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
  data-mono:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1440px
---

## Brand & Style
The design system for this B2B marketplace balances high-end editorial aesthetics with the structural rigour of an institutional trade platform. The brand personality is authoritative, reliable, and premium, moving away from "consumer-lite" SaaS trends toward a sophisticated commerce environment. It targets high-volume wholesalers and manufacturers who value clarity and efficiency as much as prestige.

The visual style is **Modern Editorial Ecommerce**. It utilizes a warm, porcelain-toned background to soften the interface and differentiate it from sterile white-label competitors. The design emphasizes content density without clutter, using subtle borders and generous whitespace to create a "commercially dense" layout that feels organized rather than overwhelming.

## Colors
This palette is grounded in a sophisticated neutral base to ensure product imagery remains the focus.
- **Primary:** A deep Slate (#0F172A) used for maximum legibility in typography and primary navigation elements.
- **Accent:** Signature Gold (#B5924D) is used sparingly for call-to-actions, verified badges, and premium membership indicators to evoke a sense of high-value trade.
- **Background:** The "Soft Porcelain" (#F9F8F4) provides a warm, non-glare canvas that makes white cards and surfaces pop with subtle contrast.
- **Functional:** Success is represented by a rich Emerald to denote trust and verified status, while Amber and Red handle system-level feedback without breaking the editorial tone.

## Typography
The typography system relies exclusively on **Manrope** to provide a modern, geometric yet approachable feel. 
- **Tight Kerning:** Across all headlines, a slightly negative letter-spacing is applied to achieve that premium, editorial look.
- **Weights:** Use 800 for high-impact displays, 600 for sub-headers, and 400 for long-form reading.
- **Numerical Data:** For prices, MOQs (Minimum Order Quantities), and SKU counts, use the `data-mono` role which enables tabular lining figures to ensure numbers align perfectly in lists and tables.
- **Hierarchy:** Ensure a clear distinction between transactional labels (uppercase) and descriptive body text.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to maintain an editorial structure, while transitioning to a fluid model on mobile. 

- **Desktop (1440px):** A 12-column grid with 24px gutters. Content is centered with wide 48px margins to frame the "porcelain" background.
- **Commercial Density:** In product grids and data tables, use the `sm` (16px) spacing unit to maximize information visible above the fold. 
- **Editorial Breathing Room:** For landing pages and brand stories, increase vertical rhythm to `lg` (40px) or `xl` (64px) to emphasize premium quality.
- **Mobile:** Transition to a 4-column fluid grid with 16px side margins.

## Elevation & Depth
Depth is created through structural layering rather than dramatic shadows.
- **Tonal Layers:** The primary depth indicator is the contrast between the #F9F8F4 background and #FFFFFF surfaces.
- **Subtle Borders:** Use 1px solid borders in a very light neutral (Slate at 10-15% opacity) to define card boundaries.
- **Soft Shadows:** Reserved exclusively for floating elements like dropdowns, modals, and hover states on product cards. Use a multi-layered shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Low-Contrast Outlines:** Buttons and input fields use thin, high-quality outlines to maintain a clean, institutional feel.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a subtle modern touch without the "bubbliness" of consumer-facing social apps.
- **Standard UI Elements:** Buttons, inputs, and small cards use a 4px radius.
- **Large Containers:** Product detail cards or featured sections use `rounded-lg` (8px).
- **Interactive Elements:** Checkboxes use a tight 2px radius to maintain a professional, sharp appearance. Avoid pill-shaped buttons unless used for secondary "tag" style chips.

## Components
- **Buttons:** Primary buttons use the Slate (#0F172A) background with white text. Secondary buttons use a fine 1px border. The Gold (#B5924D) is reserved for "Buy Now" or "Contact Supplier" actions to draw immediate attention.
- **Product Cards:** Minimalist white containers with a 1px border. Price is set in `data-mono` (Medium weight). Hover state should trigger a subtle soft shadow and a slight lift (2px).
- **Data Tables:** Used for bulk pricing tiers. High density, no vertical borders, only horizontal dividers. Header row should be in the `label-md` style with a light gray background.
- **Chips/Badges:** Used for MOQs and Shipping status. Small, 12px font, using a 2px radius. Colors should be muted (e.g., light green background with dark green text for "In Stock").
- **Input Fields:** Clean, white background with a 1px Slate-200 border. On focus, the border transitions to Gold (#B5924D) with a 2px soft outer glow in the same hue.
- **Institutional Elements:** Use "Verified Supplier" badges featuring a small gold seal icon and Manrope SemiBold text.