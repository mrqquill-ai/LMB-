# LMB Website

Public marketing and booking site for the **Lagos Musical Band**, an NYSC Community Development
Service group in Lagos State. Separate product from `lmb-attendance`, which is the internal
attendance app.

Built from the Claude Design handoff `# LMB Home Hero Plan` (`LMB Home Hero v2.dc.html`).

## Stack

React 18, TypeScript, Vite. No CSS framework: every value in the design is expressed through the
LMB design tokens, so the site uses plain CSS with custom properties instead.

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # type-check, then production build to dist/
npm run preview
```

## Layout

```
src/
  App.tsx                 route shell, nav, page transition
  components/             NavBar, CadenceRule, PackageCard
  sections/               Hero, About, ServicesPreview, Gallery, ServicesPage, Contact
  components/BookingForm.tsx
  data/
    packages.ts           the five formation packages and their terms
    contact.ts            the band's contact channels and the enquiry composer
    content.ts            content slots that render only once they are filled
  lib/
    useRoute.ts           hash routing, out/in transition, back and forward
    useParallax.ts        scroll-linked drift on the photographs
    useScrolled.ts        nav condense past 40px
    scrollToSection.ts    anchor jump that clears the fixed nav
    scroll.ts             one shared passive scroll listener, one frame per tick
    motion.ts             reduced-motion check, shared fade-in
  styles/
    site.css              all layout, hover and responsive rules
    tokens.css            imports the design system token files verbatim
    tokens/               colors, typography, spacing, motion, effects, fonts
```

`src/styles/tokens/` is copied unchanged from the design system bundle, so a newer version of the
system can be dropped straight in.

## Routes

Two routes, both on the hash: `#/` (Home) and `#/services` (Services). The Home page carries the
About, Services preview and Gallery sections as anchors (`#about`, `#services`, `#gallery`). The
booking and footer block (`#contact`) sits outside the routed view, so it stays put while routes
cross over and every "Book the band" control can reach it from either route.

Below 900px the nav links collapse into a full-screen sheet behind a Menu button. The sheet closes
on Escape, on a backdrop tap, and on the Close button, and returns focus to the button it came from.

## Turning booking on

The booking form is built and validated but cannot send until the band supplies a channel. Fill in
either field in `src/data/contact.ts` and everything wires itself up:

```ts
whatsapp: '2348012345678',   // digits only, international format, no plus
email: 'bookings@example.com',
```

With `whatsapp` set, a completed enquiry opens WhatsApp with the date, venue, formation and contact
details already written out. With only `email` set, it composes a `mailto:` instead. Until one of
them is set the submit button stays disabled with a plain explanation, and the footer's Contact
column is not rendered at all rather than listing details that do not exist.

## Motion

One signature moment, everything else quiet, per the brief.

- **Cadence load-in.** On Home, the gold dashed rule draws itself left to right, then the headline
  reveals line by line through a clip-path mask, 100ms apart. The seam between type and photograph
  draws downward, the photograph settles from a 1.06 scale, and the subhead and CTAs land last.
- **Scroll-linked drift** on three photographs (band major, assembly, snare), tied to scroll
  position rather than a fade once visible.
- **Route transition.** The outgoing view fades and lifts out over 240ms before the incoming view
  enters. Back and forward are handled through `popstate`.
- Easing is `cubic-bezier(0.16, 1, 0.3, 1)` everywhere. Nothing uses linear or a default ease.
- **`prefers-reduced-motion: reduce`** drops the reveal, the parallax and the route transition.
  Every element renders directly in its final state.

## Accessibility notes

- Every text pairing meets WCAG AA. Two muted values are held as tokens in `site.css`
  (`--text-faint-on-deep` at 5.5:1, `--text-muted-on-forest` at 4.8:1) rather than tuned per
  component, because four per-component alphas had drifted below 4.5:1.
- Form errors never depend on colour. Brand red measures 2.7:1 on deepest green, so the invalid
  state is a full-contrast cream border plus a red marker plus a written message. Errors appear on
  blur, clear as soon as the value becomes valid, and carry `role="alert"` with `aria-invalid` and
  `aria-describedby`. Submitting an incomplete form focuses the first invalid field.
- Inputs are at least 48px tall and set at 16px, which keeps iOS from zooming on focus.

## Content still pending from the band

Each of these is a slot in `src/data/`. Nothing on the page announces its own absence; the layout
adapts until the content arrives.

- **Choir photograph** (`content.ts` → `choirPhoto`). Until it lands, the Choir column shows a
  composed panel carrying the arm's name in the display face.
- **A client quote** (`content.ts` → `testimonial`). Until it lands, the snare photograph takes the
  whole right column of the Gallery grid.
- **Contact channels** (`contact.ts`). See "Turning booking on" above.
- **A real gallery.** "View the full gallery" still points at the `#gallery` section, which holds
  two photographs. Either build the route or rename the link.
