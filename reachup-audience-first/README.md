# Reachup Media — audience-first redesign

This is a separate site. The parent website files are untouched. The original Reachup Media logo is used unchanged in the header, footer and favicon. Readable typography overrides live in `dist/typography.css`; the mobile quote uses the full width without the decorative asterisk. Creator content appears immediately after the case-study introduction.

## Preview locally

From this folder run `python -m http.server 4173 --directory dist`, then open http://localhost:4173.

Static page previews require no package installation. The Vercel email function uses Nodemailer; run `npm install` for backend development. Regenerate pages after editing `src/render.mjs` with `node src/render.mjs`. Styling and interactions live in `dist/styles.css`, `dist/app.js` and `dist/enquiry.js`. The dependency-free motion layer is in `dist/motion.css` and `dist/motion.js`: automatic one-time scroll reveals, sticky navigation, hover feedback and dialog/menu transitions that follow the device motion preference. There are no visitor-facing animation controls or replay buttons. Content stays visible when animation is unavailable.

## Content and claims

- CabBazar and Space Seven Fitness are the only real clients shown, as confirmed in the supplied brief.
- Both campaigns are completed. CabBazar: 607,000+ total video views and 30 creators; Space Seven Fitness: 350,000+ total video views and 8 creators. Counts, regions, campaign roles and selection strategy were supplied by Reachup Media in this chat; views are explicitly distinguished from unique reach.
- Client feedback is quoted from the original website. Attribution was confirmed as Nandani, Marketing Head at CabBazar, and Manik, Manager at Space Seven Fitness. The Space Seven card uses the first sentence of the original quote.
- The About page uses the original team photos and Instagram links with the confirmed titles: Suraj, Founder; Dhruv, Co-founder; Rishi, Chief Financial Officer. Reachup Media is based in Mohali and handles campaigns across India.
- CabBazar includes the six supplied creator-content cards with Instagram embeds loaded only after a visitor clicks “Load Reel preview”. The direct Instagram link always remains available. No Instagram iframe or embed script is loaded before that choice.
- Selected Instagram links are sourced from the original website's `assets/js/gallery-links.js`. Link availability belongs to Instagram and the content owner.
- Independent concepts are labelled separately throughout the site. They are proposed ideas, not completed client campaigns.
- Every figure in the audience comparison is hypothetical and clearly labelled as illustrative.
- Photography is editorial stock, not client campaign imagery. Sources are in `dist/assets/credits.json`. Client logos are copied from the existing website.
- Contact details are sourced from the original site: letstalk@reachupmedia.in and +91 7973043372.

## Enquiry functionality

The campaign form submits on the same page to a Vercel Node function using Zoho SMTP, with email and WhatsApp alternatives. Configuration is described in `VERCEL-EMAIL-SETUP.md`. The user confirmed that a test enquiry from the Vercel preview arrived in the Zoho inbox on 16 October 2026. Local tests use a fake mail transport. The form displays success only after SMTP accepts the business inbox recipient. No website database stores submissions.

## Hosting

The main website runs on Vercel. Keep the repository Root Directory at `./`; the root configuration builds this folder and serves `reachup-audience-first/dist`. The earlier Sites prototype remains separate.

The build generates eight public pages, a branded `404.html`, `robots.txt` and an eight-page sitemap. Canonical URLs use `https://www.reachupmedia.in`, matching the production domain redirect. Legacy portfolio URLs redirect to `/work`; legacy thank-you URLs redirect to `/contact`, where enquiries now confirm delivery inline.

The old chatbot endpoint returns HTTP 410 and does not call Gemini. Its original source is retained at the repository's `legacy-api/chat.js`. The campaign enquiry endpoint remains active. Enquiry rate limits are per instance; configure Vercel firewall limits as described in `VERCEL-EMAIL-SETUP.md` for broader abuse protection.
