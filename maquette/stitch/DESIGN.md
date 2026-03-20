# Design System Strategy: The Digital Architect

## 1. Overview & Creative North Star
The core identity of this design system is **"The Digital Architect."** It is a philosophy of precision, intelligence, and hyper-acceleration. Unlike standard SaaS platforms that rely on flat, utilitarian grids, this system treats the interface as a multi-dimensional workspace. 

We break the "template" look through **Atmospheric Depth**. By utilizing high-contrast typography scales (Plus Jakarta Sans for impact, Inter for utility) and intentional asymmetry, we create an environment that feels less like a website and more like a high-performance command center. We favor overlapping elements and light-refractive surfaces to give the user a sense of "looking into" the future of their career, rather than just looking at a screen.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a "Deep Dark" spectrum, using the `background` (#101419) as a canvas for high-energy AI accents.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established solely through:
1.  **Background Color Shifts:** Placing a `surface-container-low` (#181c21) element against a `background` (#101419) floor.
2.  **Tonal Transitions:** Using vertical whitespace (`spacing-8` or `spacing-12`) to allow the eye to perceive separation without structural "walls."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to create a "nested" logical flow:
*   **Lowest Level:** `surface-container-lowest` (#0a0e13) for the deepest background elements or inactive utility panels.
*   **Base Floor:** `surface` (#101419) for the primary application canvas.
*   **Raised Content:** `surface-container` (#1c2025) for primary content cards.
*   **Focused State:** `surface-container-highest` (#31353b) for active dialogs or "pop-out" architectural elements.

### The "Glass & Gradient" Rule
To achieve the "Digital Architect" aesthetic, floating elements (Modals, Hover Cards, Navigation) must use **Glassmorphism**. 
*   **Recipe:** Apply `surface-variant` with 60% opacity, combined with a `backdrop-filter: blur(20px)`.
*   **Signature Textures:** Main CTAs must utilize a dynamic gradient: `primary` (#4be277) to `primary-container` (#22c55e) with a 10% `tertiary` (#d1bdff) highlight in the top-right corner to simulate a digital light source.

---

## 3. Typography
Our typography is the "structural steel" of the system. We pair the geometric precision of **Plus Jakarta Sans** with the technical clarity of **Inter**.

*   **Display & Headlines (Plus Jakarta Sans):** Used for high-impact moments—career milestones, AI insights, and section headers. The `display-lg` (3.5rem) should be used sparingly with tight letter-spacing (-0.02em) to feel authoritative.
*   **Title & Body (Inter):** Used for all functional data. Inter provides the "utility" feel of a high-end IDE. 
*   **Editorial Contrast:** Always pair a `headline-lg` with a `label-md` in `on-surface-variant` (#bccbb9) to create a sophisticated, high-end editorial hierarchy.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering** and **Ambient Glows**.

*   **The Layering Principle:** Stacking is visual logic. A `surface-container-low` card placed on a `background` provides a "soft lift." No shadow is required for static elements.
*   **Ambient Shadows:** For floating elements (like an AI suggestion card), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a "void" rather than a grey smudge.
*   **The "Ghost Border":** If a container requires a border for accessibility, use the `outline-variant` (#3d4a3d) at **15% opacity**. It should be felt, not seen.
*   **Interactive Glow:** On hover, key components should emit a subtle outer glow using the `surface-tint` (#4ae176) at 5% opacity to simulate the energy of the AI "accelerating."

---

## 5. Components

### Buttons
*   **Primary:** Gradient-filled (`primary` to `primary-container`), `rounded-md`, with a subtle white inner-shadow (top-only, 10% opacity) to give a tactile, "glass-button" feel.
*   **Secondary:** Ghost style. No background. `outline-variant` border at 20%. Text in `on-surface`.
*   **Tertiary:** Pure text using `label-md`. Use `primary` color for the text to indicate actionability.

### Input Fields
*   **Base:** `surface-container-lowest` background. 
*   **Focus State:** The border transitions from 0% opacity to 100% `primary` (#4be277) with a `4px` outer blur (glow effect).
*   **Forbid:** Never use a solid grey border for "resting" states. Use a background shift instead.

### AI Insight Cards
*   **Style:** Glassmorphic (`surface-container-high` at 70% opacity + blur).
*   **Detail:** Add a 1px "Light Streak" on the top edge using `primary-fixed-dim` (#4ae176) at 30% opacity.
*   **Spacing:** Use `spacing-6` (2rem) for internal padding to ensure "Elite" breathing room.

### Status Chips
*   **Action Chips:** `surface-container-highest` background, `rounded-full`, with `label-sm` typography. 
*   **Selection:** When active, use `secondary-container` (#0566d9) with `on-secondary-container` text.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. Place a large `display-md` header offset to the left, with body text shifted further right to create "Architectural Pathing."
*   **Do** use `spacing-20` and `spacing-24` for section gaps. Premium design is defined by the space you *don't* fill.
*   **Do** use `tertiary` (#d1bdff) as a "spark" color—sparingly, for AI-generated highlights or special notifications.

### Don't
*   **Don't** use 100% black (#000000). It kills the depth of the "Deep Dark" theme. Use `background` (#101419).
*   **Don't** use dividers or horizontal rules (`<hr>`). Use a `spacing-4` gap or a subtle color shift between `surface-container-low` and `surface-container-lowest`.
*   **Don't** use standard "drop shadows." If it doesn't look like ambient light or physical stacking, remove it.