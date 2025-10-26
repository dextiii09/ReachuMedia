# ReachUp Media — Static Website

A modern, minimal, and professional multi-page website for ReachUp Media (influencer marketing and artist management agency in India).

## Pages
- `index.html` — Home (hero, about blurb, services summary, artist highlight, case study, CTA)
- `about.html` — Vision, story, team placeholders
- `services.html` — Detailed services and how we work
- `portfolio.html` — Case studies with Minimalist Skincare and Dheer Official sections
- `contact.html` — Contact form (mailto fallback), WhatsApp link, contact info

## Design
- Fonts: Poppins (headings) and Inter (body)
- Accent: `#1A73E8` (deep blue)
- Subtle reveal animations, soft cards, responsive grid

## Customize
- Replace placeholder images (Unsplash) in `index.html` and `portfolio.html` with your own assets.
- Update Dheer Official links (look for `href="#"` near media thumbnails) with YouTube/Instagram URLs.
- Update team details in `about.html`.
- To wire a real contact form, use Formspree/Netlify Forms or connect a backend and set the `action` on `#contact-form`.

### Logo
- Place your logo file at `assets/img/logo.png` (PNG recommended, ~512×512). This image is used in:
	- The top-left brand mark in the header on every page
	- The footer brand mark on pages with footers
	- The browser favicon and the Open Graph `og:image`
- If the file is missing, the header/footer will simply hide the image automatically to avoid a broken icon.

## Preview locally
Use any static server. For example with Python:

```powershell
# from the project folder
python -m http.server 5500
# then open http://localhost:5500/index.html
```

Or use VS Code's Live Server extension (recommended on Windows).

## Deploy
- GitHub Pages: push this folder to a repo, enable Pages from the `main` branch.
- Netlify/Vercel: drag-and-drop or connect the repo; build command not required (static).

## Contact
- Email: suraj@reachupmedia.in / dhruv@reachupmedia.in
- Phone: +91 7973043372
- Instagram: @reachup__media
- Location: India (Pan-India operations)
