# Reachup Media — audience-first redesign

This is a separate site. The parent website files are untouched. The original Reachup Media logo is used unchanged in the header, footer and favicon. Readable typography overrides live in `dist/typography.css`; the mobile quote uses the full width without the decorative asterisk. Creator content appears immediately after the case-study introduction.

## Preview locally

From this folder run `python -m http.server 4173 --directory dist`, then open http://localhost:4173.

Static page previews require no package installation. The Vercel email function uses Nodemailer; run `npm install` for backend development. Regenerate pages after editing `src/render.mjs` with `node src/render.mjs`. Styling and interactions live in `dist/styles.css`, `dist/app.js` and `dist/enquiry.js`. The dependency-free motion layer is in `dist/motion.css` and `dist/motion.js`: automatic one-time scroll reveals, sticky navigation, hover feedback and dialog/menu transitions that follow the device motion preference. There are no visitor-facing animation controls or replay buttons. Content stays visible when animation is unavailable.

## Content and claims

- CabBazar and Space Seven Fitness are the only real clients shown, as confirmed in the supplied brief.
- Their dedicated pages intentionally leave campaign objective, role/strategy and verified results for completion. No metrics or testimonials have been invented.
- CabBazar includes the six supplied creator-content cards with Instagram embeds loaded only after a visitor clicks “Load Reel preview”. The direct Instagram link always remains available. No Instagram iframe or embed script is loaded before that choice.
- Selected Instagram links are sourced from the original website's `assets/js/gallery-links.js`. Link availability belongs to Instagram and the content owner.
- Independent concepts are labelled separately throughout the site. They are proposed ideas, not completed client campaigns.
- Every figure in the audience comparison is hypothetical and clearly labelled as illustrative.
- Photography is editorial stock, not client campaign imagery. Sources are in `dist/assets/credits.json`. Client logos are copied from the existing website.
- Contact details are sourced from the original site: letstalk@reachupmedia.in and +91 7973043372.

## Enquiry functionality

The campaign form submits on the same page to a Vercel Node function using Zoho SMTP, with email and WhatsApp alternatives. Direct delivery requires Vercel environment configuration; see `VERCEL-EMAIL-SETUP.md`. Local tests use a fake mail transport. The form displays success only after SMTP accepts the business inbox recipient. No website database stores submissions.

## Hosting

Sites hosts `dist/`, as configured in `.openai/hosting.json`. The new Sites project is separate from reachupmedia.in and starts private. Source repository credentials must never be saved into this folder.
