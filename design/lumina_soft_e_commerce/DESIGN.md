---
name: Lumina Soft e-Commerce
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#4d4450'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#7e7381'
  outline-variant: '#cfc2d2'
  surface-tint: '#7f43a5'
  primary: '#7f43a5'
  on-primary: '#ffffff'
  primary-container: '#d896ff'
  on-primary-container: '#622587'
  inverse-primary: '#e5b4ff'
  secondary: '#76574e'
  on-secondary: '#ffffff'
  secondary-container: '#fed4c8'
  on-secondary-container: '#795950'
  tertiary: '#5847d2'
  on-tertiary: '#ffffff'
  tertiary-container: '#afa6ff'
  on-tertiary-container: '#3c24b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f4d9ff'
  primary-fixed-dim: '#e5b4ff'
  on-primary-fixed: '#30004b'
  on-primary-fixed-variant: '#66298b'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#e6beb2'
  on-secondary-fixed: '#2c160f'
  on-secondary-fixed-variant: '#5d4037'
  tertiary-fixed: '#e4dfff'
  tertiary-fixed-dim: '#c6bfff'
  on-tertiary-fixed: '#160066'
  on-tertiary-fixed-variant: '#4029ba'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 16px
  margin-tablet: 24px
  gutter: 16px
  touch-target-min: 48px
---

## Brand & Style

The design system is crafted for a mobile-first e-commerce experience that feels curated, professional, and inherently approachable. It draws inspiration from the provided logo—incorporating a soft lavender and pink-infused aesthetic to create a sense of calm and luxury without sacrificing clarity.

The visual style leans into **Modern Minimalism** with subtle **Glassmorphism** highlights. This ensures that the focus remains entirely on the products while providing a tactile, high-end feel through translucent layers and airy whitespace. The goal is to evoke trust and delight, making the shopping journey feel like a premium concierge service rather than a cluttered marketplace.

## Colors

The palette is anchored by a sophisticated **Lavender (Primary)** which serves as the brand's signature for core actions and active states. A **Soft Pink (Secondary)** is utilized for backgrounds and decorative elements to soften the interface.

- **Primary (#D896FF):** High-visibility actions, active navigation, and brand-defining icons.
- **Secondary (#FAD0C4):** Subtle backgrounds, badges, and secondary call-to-actions.
- **Tertiary (#6C5CE7):** Used sparingly for high-contrast highlights or information that requires immediate attention.
- **Neutral (#2D3436):** Dark charcoal for body text and primary headers to ensure maximum accessibility and readability on a light background.

## Typography

This design system uses a dual-font strategy to balance professional structure with friendly accessibility. **Manrope** is used for headlines to provide a modern, geometric clarity that communicates authority. **Plus Jakarta Sans** is used for body copy and labels; its soft, rounded terminals echo the friendly nature of the brand logo while maintaining excellent legibility at small sizes.

Mobile-specific overrides are applied to large headers to prevent awkward text wrapping on smaller viewports. All line heights are optimized for touch-based reading, ensuring that links and interactive text elements have sufficient vertical clearance.

## Layout & Spacing

This design system employs a **Fluid Grid** model optimized for mobile-first consumption. The base unit is 4px, creating a consistent 8pt-based rhythm for all padding and margins.

- **Mobile:** 4-column grid with 16px side margins and 16px gutters.
- **Tablet/Desktop:** 12-column grid with a maximum container width of 1280px.
- **Touch Targets:** A strict minimum of 48x48px for all interactive elements to accommodate mobile users.

Spacing should favor a "top-down" hierarchy where vertical gaps between distinct sections are larger (e.g., 40px) than gaps between related items within a section (e.g., 12px), creating a clear visual flow for scrolling shoppers.

## Elevation & Depth

Visual hierarchy in this design system is achieved through **Tonal Layers** and **Ambient Shadows**.

1.  **Level 0 (Base):** Soft Pink or pure White background.
2.  **Level 1 (Cards):** Slightly elevated using a very diffused 10% opacity shadow with a hint of lavender (#D896FF) to anchor the element.
3.  **Level 2 (Modals/Overlays):** Stronger elevation with a backdrop blur (Glassmorphism) to keep the user’s context visible while focusing on the new task.

Avoid heavy borders; instead, use 1px subtle lavender strokes (#E9D5FF) to define boundaries where tonal separation is insufficient.

## Shapes

The shape language is **Rounded**, mirroring the organic lines of the logo's central illustration. 

- **Standard Buttons & Inputs:** 0.5rem (8px) radius.
- **Product Cards:** 1rem (16px) radius for a friendlier, tactile look.
- **Feature Chips & Badges:** Fully rounded (pill-shaped) to distinguish them from actionable buttons.

This consistent use of rounded corners softens the interface and makes the platform feel more approachable and less "corporate."

## Components

- **Buttons:** Primary buttons use the Lavender fill with white text. Secondary buttons use a Lavender stroke with Lavender text. All buttons have a height of 48px to ensure ease of use on mobile.
- **Product Cards:** Feature a large image area with the price and name in Manrope. A floating "Add to Cart" button (Lavender) is placed at the bottom right.
- **Chips:** Used for categories and sizes. These have a 1px soft-pink border and switch to a solid Lavender fill when selected.
- **Input Fields:** Minimalist design with a 1px stroke that shifts to the Primary Lavender on focus. Labels sit permanently above the field in Label-sm typography.
- **Checkboxes & Radios:** Rounded edges with a Lavender fill when active.
- **Bottom Navigation:** A mobile-essential component using Glassmorphism (backdrop-blur) with Lavender icons to indicate the active state.