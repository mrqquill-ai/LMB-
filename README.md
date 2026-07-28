# LMB Website

Public marketing and booking site for the **Lagos Musical Band**, an NYSC Community Development
Service group in Lagos State. Separate product from `lmb-attendance`, which is the internal
attendance app.

Built from the Claude Design handoff `# LMB Home Hero Plan` (`LMB Home Hero v2.dc.html`).

## Before you deploy

Two values need real content or the site ships broken in ways that are easy to miss:

1. **`VITE_SITE_URL` in `.env`** is a `.example` placeholder. It is substituted into the canonical
   link, the Open Graph card and the structured data at build time. Until it points at the live
   domain, WhatsApp and search previews will not resolve.
2. **A booking channel in `src/data/contact.ts`.** See "Turning booking on" below.

## Stack

React 18, TypeScript, Vite. No CSS framework: every value in the design is expressed through the
LMB design tokens, so the site uses plain CSS with custom properties instead.

```bash
npm install
npm run dev      # http://localhost:5175
npm run build    # type-check, then production build to dist/
npm run images   # regenerate image derivatives from assets-src/
npm run preview
```

## Images

`assets-src/` holds the band's originals, which are 1920x2560 phone portraits and are never served.
`npm run images` writes AVIF, WebP and JPEG derivatives at 480, 720, 1080 and 1440 wide into
`public/assets/`, plus the 1200x630 social card and a 320w logo, and records the intrinsic
dimensions in `src/data/imageSizes.json` so `<img>` can reserve its box.

Measured against the originals, which the page used to serve directly:

| | before | after |
|---|---|---|
| Desktop, 1x | 2023kB | **295kB** |
| Phone, 1x | 2023kB | **122kB** |
| Phone, 2x | 2023kB | **266kB** |

Adding a photograph means dropping it into `assets-src/photos/`, running `npm run images`, and
referencing it by filename through the `Photo` component. `PhotoName` widens automatically.

## Cut-outs

`assets-src/cutouts/` holds eleven instrument cut-outs on a real alpha channel, for the scroll-linked
travelling object and the per-section statics. They ship as AVIF and WebP with a PNG fallback, never
JPEG, at their native width and 60% of it. A fixed width ladder would not suit them: the mace is
157px wide and the trombone 1099px.

They were generated on a flat magenta field and keyed locally:

```bash
node scripts/cutout.mjs <shot.png> assets-src/cutouts/<name>.png
node scripts/split-sheet.mjs <sheet.png> assets-src/cutouts name1,name2,name3
```

`cutout.mjs` samples the background from the corners, feathers the alpha between two distance
thresholds, and despills a three-pixel band inward from the cut edge, where the render's own
antialiasing mixed magenta into the object. `split-sheet.mjs` traces connected regions so several
objects can share one generated frame, and drops stray render fragments by keeping only the largest.

Magenta is the key colour because nothing in the set, brass, chrome, drum head or wood, comes near
it.

The mace needed more work than the rest. It generated with a European crown and eagle finial, where
a real marching mace of this kind carries a plain rounded ball. The finial is cut off at the cord
binding, because the fluted socket above it flares upward and any cut through it leaves an open cup,
and polished gold shows a flat cut edge that masking cannot shade away. `scripts/mace-head.mjs` then
renders a replacement ball in the shaft's own material. It is drawn rather than photographed because
the generation balance was spent; polished metal models well, being mostly a vertical environment
gradient with a specular highlight, a fresnel rim and a warm bounce off the gold cord below. That
script is a one-off already applied to the asset, and re-running it would stack a second head on the
first.

**These are all stand-ins.** They are generic instruments, not the band's own. Replace them with
photographs of the band's actual gear when it can be shot: plain background, even daylight, one
object per frame, and the same scripts will process them.

## Layout

```
src/
  App.tsx                 route shell, skip link, nav, page transition
  sections/               Hero, About, ServicesPreview, Gallery, ServicesPage, Contact
  components/
    NavBar.tsx            fixed nav, and the mobile menu sheet
    BookingForm.tsx       the booking form and its validation
    Photo.tsx             responsive AVIF/WebP/JPEG picture, and the logo
    PackageCard.tsx       formation card, preview and full variants
    CadenceRule.tsx       the dashed drumline divider
  data/
    packages.ts           the five formation packages and their terms
    contact.ts            the band's contact channels and the enquiry composer
    content.ts            content slots that render only once they are filled
    photos.ts             the PhotoName type, derived from the image build
    imageSizes.json       written by npm run images, do not edit by hand
  lib/
    useRoute.ts           hash routing, out/in transition, back and forward
    useParallax.ts        scroll-linked drift on the photographs
    useScrolled.ts        nav condense past 40px
    scrollToSection.ts    anchor jump that clears the fixed nav
    scroll.ts             one shared passive scroll listener, one frame per tick
    motion.ts             reduced-motion check, shared fade-in
  styles/
    site.css              all layout, hover and responsive rules
    tokens.css            the design system's own entry point, unused, see below
    tokens/               colors, typography, spacing, motion, effects, fonts
scripts/build-images.mjs  the image derivative pipeline
assets-src/               original photography and logo, never served
```

`site.css` imports the individual token files rather than the vendored `tokens.css`, because that
file chains through `tokens/fonts.css` and buries the Google Fonts request three stylesheets deep.
The font request lives in `index.html` instead. Both vendored files are left untouched, so a newer
version of the design system can still be dropped straight in.

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
- **The travelling mace.** The mace leads the formation down a street, so it leads the reader down
  the page. It stands upright in the hero's open right-hand space, passes off-canvas through About,
  swings out to the right across Services and Gallery, and plants itself upright beside the booking
  form. It is `position: fixed` with its transform driven by page scroll progress, eased between
  five waypoints held as fractions of the viewport so the route keeps its shape at any width. It
  replaced the photograph parallax rather than joining it: two scroll-linked behaviours competing in
  one viewport is where these pages start to feel busy.
- **Section statics.** One instrument per section bleeding off an edge, purely CSS-positioned.
- **Route transition.** The outgoing view fades and lifts out over 240ms before the incoming view
  enters. Back and forward are handled through `popstate`.
- Easing is `cubic-bezier(0.16, 1, 0.3, 1)` everywhere. Nothing uses linear or a default ease.
- **`prefers-reduced-motion: reduce`** drops the reveal, the travelling mace and the route
  transition. Every element renders directly in its final state. The mace is removed rather than
  frozen, since the travel is the whole point of it. The statics stay.

Below 900px the mace comes off: there are no gutters for it to travel through and the copy runs the
full width. The statics stay at every width, since an edge bleed reads at any size.

The mace is mounted outside `<main>`. That element carries a transform during route transitions, and
any transform on an ancestor makes `position: fixed` resolve against it instead of the viewport.

## Accessibility notes

- Every text pairing meets WCAG AA. Two muted values are held as tokens in `site.css`
  (`--text-faint-on-deep` at 5.5:1, `--text-muted-on-forest` at 4.8:1) rather than tuned per
  component, because four per-component alphas had drifted below 4.5:1.
- Form errors never depend on colour. Brand red measures 2.7:1 on deepest green, so the invalid
  state is a full-contrast cream border plus a red marker plus a written message. Errors appear on
  blur, clear as soon as the value becomes valid, and carry `role="alert"` with `aria-invalid` and
  `aria-describedby`. Submitting an incomplete form focuses the first invalid field.
- Inputs are at least 48px tall and set at 16px, which keeps iOS from zooming on focus.
- A skip link is the first tabbable element and targets `#main`.
- The nav pill crosses the hero photograph, where contrast cannot be measured against a fixed
  background. It carries a 0.72 scrim and a hairline edge so the labels hold over bright frames.

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
