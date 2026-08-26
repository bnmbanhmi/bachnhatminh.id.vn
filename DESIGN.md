# Design System Tokens & Guidelines (bachnhatminh.id.vn)

This document serves as the AI-legible design token specification and UI standard for `bachnhatminh.id.vn`.

---

## 1. Color Palette Tokens

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| `bg-color` | `#FDF6F0` | Primary app background (warm cream) |
| `accent-color` | `#FF7A5C` | Primary interactive brand color (warm coral) |
| `accent-hover` | `#E86547` | Hover state for accent buttons |
| `accent-light` | `#FFE8E0` | Subdued highlight tint / badge backgrounds |
| `card-top` | `#FF9A85` | Hello card header & notification strip |
| `card-body` | `#FFF1E6` | Secondary container fill / card background |
| `card-body-hover`| `#FEEBE0` | Hover state for secondary cards |
| `text-color` | `#7A6863` | Body typography (warm muted brown) |
| `heading-color` | `#4A3A35` | High-contrast headings and active labels |
| `muted-color` | `#BFAAA5` | Micro-copy, timestamps, inactive borders |
| `border-color` | `#F0DDD1` | Clean structural dividers & card borders |
| `badge-bg` | `#FFE5D9` | Feature pills background |
| `badge-text` | `#B3543D` | Feature pills high-contrast text |

---

## 2. Typography Hierarchy

- **Primary Sans-Serif**: `Lexend`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
  - Body: `14px` (`text-sm`) or `12px` (`text-xs`), line-height: `1.6–1.8`
  - Subheadings: `16px–20px` (`text-base` to `text-xl`), font-weight: `700`
  - Display Headings: `28px–48px` (`text-3xl` to `text-5xl`), font-weight: `800`, letter-spacing: `-0.02em`
- **Technical Monospace**: `Space Grotesk`, `monospace`
  - Used strictly for metrics (`+630%`, `10.0%`), telemetry keys, Base36 IDs, timestamps, and code snippets.

---

## 3. Spacing & Border Radius Scales

- **Spacing Base**: `4px` / `8px` systematic grid (`p-1`, `p-2`, `p-3`, `p-4`, `p-5`, `p-6`, `p-8`)
- **Radius Scale**:
  - `rounded-lg`: `8px` for buttons, inputs, filter chips
  - `rounded-xl`: `12px` for nested cards, widgets, code snippets
  - `rounded-2xl`: `16px` for primary feature containers
  - `rounded-full`: `9999px` for status pills, segmented pills, avatars

---

## 4. State Completeness Checklist

Every interactive component must define:
1. `default`: Clean border `#F0DDD1`, warm background.
2. `hover`: Subtle lift (`-translate-y-0.5`), warm border highlight, or bg transition.
3. `active / press`: `scale-95` micro-scale feedback.
4. `loading`: Skeleton pulse with `#FFE8E0` or animated icon.
5. `empty / zero-state`: Descriptive heuristic guidance + 1-click fallback trigger.
6. `error`: Non-destructive recovery option with plain, actionable language.
