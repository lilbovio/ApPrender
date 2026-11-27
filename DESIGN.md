# ApPrender DESIGN.md — UI/UX rules

> Approved v2 spec. Inspired by the `getdesign.md` analyses (Figma, Apple, Airbnb, Linear, Claude, PostHog) and the Figma Community motion design system. Not affiliated with those brands. Visual source of truth: Figma file `tF4Sk7ECGqnN0H506lJY4x`. Documentation is in English for token efficiency; quoted Spanish strings are user-facing product copy and must be implemented verbatim.

---

## 0. Diagnosis: why the previous artifact felt AI-generated

Remove these, do not disguise them:

- Radial gradients and decorative floating blobs on every screen.
- Every section is a white card with border, shadow, and a large radius. Flat rhythm.
- Emojis used as the icon system (`🍎`, `🎧`, `✋`, `⭐`).
- Too many pastel accents competing at once, with no clear action color.
- Permanent centering, symmetrical compositions, generic copy (`¡Genial!`, `¡Vamos!`).
- Decorative animation instead of functional animation.
- The same frame structure repeated ten times.

**Goal:** move from "generic kids app" to a **premium adventure notebook** — warm, editorial, with its own character, clearly child-friendly without being childish.

---

## 1. Governing principles

1. **One canvas, one accent.** Warm cream paper is the hero; deep grape is the only action color. Pastels are *story surfaces*, not buttons or confetti.
2. **Hierarchy through weight and size, not shadow.** Confident typography, high contrast, almost no elevation.
3. **Illustration with character, not emoji.** A recurring mascot (`Pilo`, a little paper plane) and a custom 2 px round-cap stroke icon set.
4. **One screen = one decision.** One primary action per view. If two CTAs exist, demote one to action-quiet.
5. **Movement with intent.** Every animation answers a child's action or a state change. Nothing moves "just because".

---

## 2. Color

```yaml
colors:
  canvas: "#FBF7F1"          # warm cream paper, replaces pure white
  canvas-alt: "#F3EDF7"      # grape block for English moments
  surface: "#FFFFFF"
  surface-soft: "#F7F3FB"
  hairline: "#E4DCEA"

  ink: "#2E2A44"             # plum ink, never pure black
  body: "#4A465F"
  muted: "#77728B"

  accent: "#6B4CA8"          # the only action color
  accent-hover: "#7E5CBD"
  accent-soft: "#E7DEF7"
  on-accent: "#FFFFFF"

  celebration: "#E8895F"     # coral, REWARD/artwork only, never a CTA
  celebration-soft: "#FFE2D2"

  math-surface: "#F6D9C2"
  math-ink: "#A85E35"
  english-surface: "#DFD2F4"
  english-ink: "#5E42A0"

  mint: "#CFE8DC"
  sky: "#D9EAF7"
  rose: "#F6D9E4"
  butter: "#F7E4B4"

  success: "#5E9C7A"
  error: "#C46A6A"
  error-soft: "#F8DEDE"
```

### Color rules

- At most **one large pastel block per screen**. Everything else returns to cream paper.
- The accent appears only on: primary CTA, selected state, keyboard focus, and progress line. Never as a decorative background.
- Celebration coral appears only in the reward and its badge; never in navigation or buttons.
- Ink text on pastel always. Never light text on a light pastel.
- No gradients. Color changes through flat blocks, as in Figma or Claude.

---

## 3. Typography

```yaml
typography:
  story:
    fontFamily: "Fraunces, Georgia, serif"
    weight: 500/600
    tracking: -0.02em
    lineHeight: 1.08
    sizes: [40, 32, 28]
    use: "Screen titles and story moments"
  ui:
    fontFamily: "Fredoka, Nunito, sans-serif"
    weight: 500/600
    tracking: -0.01em
    lineHeight: 1.2
    sizes: [20, 18, 16]
    use: "Buttons, chips, numbers, lesson titles"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    weight: 400/600/700
    lineHeight: 1.5
    sizes: [17, 16, 14]
    use: "Instructions, feedback, support text"
  micro:
    fontFamily: "Nunito"
    weight: 700
    size: 11
    tracking: 0.1em
    transform: uppercase
    use: "Category labels. Use sparingly"
```

### Typography rules

- Fredoka remains the child-friendly UI voice, but **Fraunces** supplies the editorial/premium feel in headlines. This is the biggest change from the previous artifact.
- Screen title: Fraunces 32 px / 600, never Fredoka 42 px bold.
- Instructions: maximum 12 words, one idea, Nunito 17 px.
- Large progress/XP numbers use Fredoka 600 (round and legible for children).
- No `text-transform: uppercase` in body copy. Micro-labels only.

---

## 4. Space, shape, and elevation

```yaml
spacing: [4, 8, 12, 16, 24, 32, 48, 80]   # 4 px base
radius:
  xs: 4      # small chips
  sm: 8      # inputs and compact buttons
  md: 12     # cards and rows
  lg: 20     # large panels
  pill: 9999
  none: 0    # full-bleed story blocks
```

### Shape rules

- Replace radii 16 / 24 / 32 **everywhere** with the scale above. Smaller radius = more mature and more intentional.
- Cards: 1 px `hairline`, **no shadow**. Surface change creates hierarchy.
- Only one shadow is allowed: `0 12px 30px rgba(46,42,68,0.10)`, reserved for the reward sticker / floating mascot.
- Mobile gutters: 20 px. Maximum useful width: 480 px inside the 390 px frame.
- Story blocks may be full-bleed with no radius: the color change is the separator.

---

## 5. Illustration and iconography

- **Pilo**, a little paper plane with eyes, 2 px stroke, round caps, three colors (ink, accent, butter). Appears **once per screen**, in a corner or guiding the gaze. Never repeated as a pattern.
- Custom stroke icons (home, book, star, user, play, drag, check, lock), 24 px, `stroke-width: 2`, `stroke-linecap: round`. **Emoji as UI icons are prohibited.**
- Progress = a **path of footprints or stars** that lights up, not a generic bar.
- Reward = a specific illustrated badge ("Sumaste hasta 10"), not an emoji star shower.
- Keep the existing vector logo, but redraw it with the same stroke as Pilo so they share a family.

---

## 6. Motion

```yaml
motion:
  ease-ui: "cubic-bezier(0.22, 1, 0.36, 1)"
  ease-joy: "cubic-bezier(0.34, 1.56, 0.64, 1)"
  duration-micro: 180ms    # tap, focus, check
  duration-screen: 280ms   # view change
  duration-joy: 520ms      # reward
  stagger: 90ms
```

### Grammar

- **Character:** curious, kind, gently propulsive. Like turning a notebook page.
- **Functional:** screen entry `opacity 0→1`, `y 8→0`, 280 ms. Buttons `scale 1.03 / 0.97`. Focus ring in the accent color.
- **Expressive (reward only):** Pilo pops with `backOut`, path stars light up with 90 ms stagger, confetti runs 2.4 s and fades out. No confetti on every correct answer.
- **Gesture-based:** in kinesthetic lessons the object follows the finger and snaps with a soft spring. A tap alternative is always available.
- **Duration follows distance:** 8 px → 180 ms; screen → 280 ms; celebration → 520 ms.
- **Signature gesture:** page-turn when switching subject (visual → auditory → kinesthetic).
- **Reduced motion:** opacity and color changes only; no transforms, no confetti, no wave.

---

## 7. UX rules for ages 6–12

- One goal per screen, one primary CTA with a **concrete verb**: `Empezar`, `Comprobar`, `Escuchar otra vez`, `Guardar`. Never `OK`, `Aceptar`, or a generic `Continuar`.
- Minimum touch target **48 × 48 px**, minimum 12 px spacing between targets.
- Feedback in under 200 ms. Friendly error: `Casi. Prueba con 4 manzanas.` + 180 ms shake + a hint. Never alarm red.
- No punishing counters. Celebrate the streak; never threaten to lose it.
- Contrast ≥ 4.5:1 for text; body copy 17 px on mobile.
- **Do not mix VAK modalities:** visual = countable objects; auditory = waveform + replay; kinesthetic = drag with tap fallback.
- Reward states **what was learned**, not just "¡Bien hecho!".
- Empty states must describe the first real action, never celebrate completion for a new user. Use a concrete invitation such as `Elige tu primera lección` and keep one primary CTA.
- Sign-out always returns to the landing at `/`. Clear auth storage and use a full navigation so the protected-route guard cannot redirect to `/login`.

---

## 8. Anti-AI checklist (run on every screen review)

- [ ] Gradients or blobs? Remove them.
- [ ] More than two cards with visible shadow? Demote one to hairline.
- [ ] Emojis acting as icons? Replace with custom strokes.
- [ ] Two vivid colors competing? Return one to a surface tone.
- [ ] Everything centered? Introduce asymmetry with a clear focal point.
- [ ] Generic copy? Make it specific to the lesson.
- [ ] Something moving without a reason? Remove the animation.
- [ ] Two CTAs with equal weight? Demote one to quiet.
- [ ] Illustration everywhere? Keep a single appearance.

---

## 9. Do / Don't

### Do
- Continuous cream paper with one pastel block per screen.
- Fraunces for the title, Fredoka for action, Nunito for reading.
- Pilo once, looking toward the important content.
- Stroke icons, progress path, hairline surfaces.
- Grape CTA. Coral only in the reward.
- Movement that confirms a child's action.

### Don't
- Pure white canvas, cold gray.
- Fredoka 700 in large headlines.
- Emojis, blobs, gradients.
- Stacked shadowed cards.
- Three accents at once.
- A bare `¡Genial!` as feedback.
- Decorative animation at rest.

---

## 10. How Claude Code uses this file

- This file governs everything visual. `CLAUDE.md` governs scope (`client/` only, backend untouched).
- The journey in section 12 is approved; `design-review.html` is the approved v2 reference and must not be treated as provisional.
- `builder-haiku` and `reviewer-sonnet` must cite token names from this file, never loose values.
- Final verification: `npm --prefix client run build`, `git diff --check`, `git status --short`.

---

## 11. Known gaps

- Figma text nodes `3:34` and `3:67` still need width adjustments.
- Fraunces, Nunito, and Fredoka load from Google Fonts; a local fallback is pending a decision.
- Pilo and the custom icon set are not drawn in Figma yet; only the logo exists.

---

## 12. Approved journey (v2)

```text
Landing → Auth (register mode / login mode)
        → [new registration, or login without VAK profile] VAK survey (12 questions)
        → Dashboard "Tu camino de hoy"
        → Subjects → Lesson (visual / auditory / kinesthetic)
        → Quiz → Reward → Profile → back to Dashboard
```

### Senior decisions (including refutations)

**Landing: clouds accepted, but they do not orbit the logo.**  
Clouds around the logo are charming, but orbiting reads as a loading spinner and competes with the CTA. Improvement: a containing **sky band**; clouds drift horizontally once on entry, with subtle pointer parallax, and stop under `prefers-reduced-motion`. The logo stays anchored and Pilo crosses the scene toward the CTA. Same charm, zero noise.

**Auth: one surface, two modes.**  
Not two separate forms and not three steps. A single `AuthSurface` component with a segmented control (`Soy nuevo` / `Ya tengo cuenta`), mounted on the existing `/register` and `/login` routes. Registration asks for a **nickname**, `Correo de tu adulto`, a password, and one of three drawn avatars. No full name and no birth date: privacy and less friction for ages 6–12. CTAs use verbs: `Crear mi cuenta` / `Entrar`.

**VAK: 12 questions, not an arbitrary longer set.**  
More than 12 questions increases abandonment in 6–12 year olds. Use 12 = 4 per modality, one question per screen, path-style progress, a `No lo sé` option, and an announced duration of 2 minutes. **Never show the Visual/Auditory/Kinesthetic labels**: present concrete scenarios with three illustrated options and rotate the option order so the first option is not always Visual. Result: `Tu superpoder es Visual` plus a secondary modality, in "superpower" language rather than clinical language.

**Logic change: allowed, but bounded.**  
Only expand the bank from 6 to 12 questions and add dominant/secondary calculation in the client. The server contract is unchanged: `PUT /api/vak` accepts exactly `{ vakType: "visual" | "auditivo" | "kinestesico" }` (`server/src/controllers/vakController.js:9`), and `User` stores only `vakType` (`server/src/models/User.js:23`). Internally, record each answer as `{ questionId, optionId }` and resolve its modality through the question bank. Send only the dominant modality to the existing endpoint; keep the secondary modality in a namespaced `localStorage` key for the current browser only. Reuse `AuthContext.saveVAKType` instead of duplicating the API call. Do not touch API contracts, models, or the database. UI guard: if a user logs in without a VAK profile, show the survey before the dashboard.

**Dashboard: one primary action, not a widget board.**  
The previous home had streak, XP, mission, subjects, and "Ver todas" competing. Improvement: `Tu camino de hoy` with one primary stop `Continuar donde lo dejé` and two secondary doors `Matemáticas` / `Inglés`. The streak becomes an informational chip. At most three visible actions, each with a verb and a single destination.

---

## 13. VAK bank — 12 questions

Each option adds +1 to one modality. Option order rotates between questions to avoid positional bias. The Spanish scenarios and options below are product copy literals.

| # | Scenario | Option A | Option B | Option C | Example dominant |
|---|---|---|---|---|---|
| 1 | Al aprender algo nuevo… | Ver un dibujo (V) | Escuchar una historia (A) | Mover piezas (K) | rotated |
| 2 | Para recordar una palabra… | Una imagen (V) | Repetirla en voz alta (A) | Escribirla con bloques (K) | rotated |
| 3 | Resolver un problema… | Dibujarlo (V) | Contarlo en voz alta (A) | Construirlo (K) | rotated |
| 4 | En un cuento recuerdas mejor… | Mover las figuras (K) | Los dibujos (V) | Las voces (A) | K / V / A |
| 5 | Te explican una suma… | Con un dibujo (V) | Con una rima (A) | Con fichas (K) | rotated |
| 6 | Cuando estás triste te calma… | Mirar un cuadro (V) | Escuchar música (A) | Apretar una pelota (K) | rotated |
| 7 | En clase te gusta… | Mirar láminas (V) | Escuchar y hablar (A) | Armar y tocar (K) | rotated |
| 8 | Para aprender "apple"… | Ver una manzana (V) | Oír y repetir (A) | Poner una ficha en una cesta (K) | rotated |
| 9 | Aprender a contar… | Con dibujos (V) | Cantando números (A) | Saltando y contando (K) | rotated |
| 10 | Armas un rompecabezas… | Mirar la imagen (V) | Preguntar en voz alta (A) | Girar las piezas (K) | rotated |
| 11 | Actividad favorita… | Pintar (V) | Escuchar cuentos (A) | Construir con bloques (K) | rotated |
| 12 | Al terminar te gusta… | Ver tu dibujo ganador (V) | Oír tu nombre felicitado (A) | Tocar tu insignia (K) | rotated |

**Result rule:** highest score wins; on a tie, show the first modality as primary and the other as secondary. Never show a numeric score to the child. Internal answers use `{ questionId, optionId }`; the wire payload stays `{ vakType: dominant }`.

---

## 14. Responsive layout (mobile-first, not mobile-only)

The 390 px layout is the reference, not a fixed phone frame. `Screen.module.css` and `BottomNav.module.css` currently cap content at 480 px on every viewport; that cap must become a breakpoint-dependent max width.

```yaml
breakpoints:
  mobile: "0-599px"      # single column, bottom nav
  tablet: "600-899px"    # two-column cards, bottom nav
  desktop: "900-1279px"  # side rail nav, content max 1120px
  wide: ">=1280px"       # content max 1200px, extra whitespace

contentMax:
  mobile: 480px
  tablet: 720px
  desktop: 1120px
  wide: 1200px

gutter:
  mobile: 20px
  tablet: 24px
  desktop: 32px
```

### Shell rules

- Define `--content-max` in `index.css` and override it per breakpoint. Use `width: min(100% - 2 * var(--gutter), var(--content-max)); margin-inline: auto;` instead of a hard `max-width: 480px`.
- Bottom nav remains only below 900 px. At >= 900 px it is replaced by a fixed left rail (icon + label, 240 px) with the same four destinations. Never show both.
- Keep 48 × 48 px minimum targets at every width. Hover effects apply only to fine pointers.
- No horizontal scroll at 320, 390, 768, 1024, or 1440 px.

### Per-screen reflow

- **Landing:** full-bleed sky band stays. At >= 900 px, copy/CTA occupies the left column and Pilo/sky art the right; the headline grows to Fraunces 48 px. Do not keep a centered 480 px column on a wide screen.
- **Auth:** form card max 460 px on mobile. At >= 900 px, two columns inside a 960 px shell: form left, privacy/error/destination notes right.
- **VAK:** still one question per screen. Widen to 720 px on tablet/desktop, increase option cards, and keep the star path. Never show multiple questions at once.
- **Dashboard:** primary stop and two doors become a two-column grid at >= 900 px. The streak/XP chips stay informational. Side rail replaces bottom nav.
- **Subjects:** lesson rows become a 2-column grid at >= 900 px, 3 columns at >= 1280 px. Keep done/current/locked states.
- **Lesson / Quiz:** content max 900 px, exercise area widens, and answer options sit in a row on desktop. Keep one Pilo and one CTA.
- **Reward:** centered card capped at 520 px even on wide screens; celebration must not stretch.
- **Profile:** two columns at >= 900 px: identity and badges left, progress and settings right.

### Type scale by breakpoint

```yaml
story: { mobile: 32px, tablet: 40px, desktop: 48px }
ui:    { mobile: 18px, tablet: 20px, desktop: 20px }
body:  { mobile: 17px, tablet: 17px, desktop: 18px }
```

Reduced-motion rules from section 6 are unchanged at every breakpoint.

---

## 15. Dashboard richness and profile settings

The responsive dashboard is correct but too sparse. Bring back the *informational value* of the legacy app, not its rejected visual patterns. Keep exactly one primary CTA on Home.

### Bring back, redesigned

- Time-aware greeting: `¡Buenos días, Ana!` / `¡Buenas tardes, Ana!` / `¡Buenas noches, Ana!`.
- Level chip next to the streak and XP chips.
- Seven-day streak as a small path of dots/stars, not a generic bar. Never threaten to lose it.
- Subject doors show a star progress path and `X de Y lecciones` instead of a plain percentage bar.
- Trophy shelf: up to three earned badges with custom stroke icons and names, plus a quiet link `Ver todas` to `/profile#logros`.
- Weekly goal: a compact five-step path only when real progress data exists. Use a hairline surface, no button.

### Do not bring back

- Clouds on the dashboard (they belong only to the landing).
- The `ACEPTAR` daily-mission button or any second primary CTA.
- Emoji badges, generic progress bars, or five competing actions.
- Dark mode; no dark tokens are defined.

### Profile settings

The real endpoint is `PUT /api/users/profile`, which accepts `{ name, email, avatar, password }` (`server/src/controllers/userController.js:31`). The legacy `userService.js` endpoints (`/user/:id`, `/user/:id/password`, `/user/update`) do not exist; do not restore them.

- Edit the nickname and the adult email; CTA `Guardar cambios`.
- Change password: `Nueva contraseña` + `Repite la contraseña`, minimum 8 characters, inline friendly validation. Known limitation: the server does not require the current password; do not claim otherwise.
- Avatar: keep the three preset stroke companions. Add an optional photo upload compressed client-side to <= 256 px and <= 120 KB, stored as a data URL in `avatar`. There is no server upload endpoint or multer; do not add one.
- Keep the existing `Repetir la encuesta` VAK action.
- Do not add dead toggles for dark mode, notifications, or language.

Badge icons must come from the custom stroke set in section 5. No emoji anywhere.

**Weekly-goal limitation:** the server stores no completion dates, so the five-dot goal is recorded in browser-local `apprender.week` only after `POST /progress/<subject>/complete` succeeds. It deduplicates by lesson id, resets on a new week or user, and is cleared on sign-out. It must never be presented as server-synced history.
