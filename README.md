# Oaks Shade Advocates · website

The website for Oaks Shade Advocates, Kampala. It's a static site: Vite, plain JavaScript, GSAP and
Lenis, with no server or database.

## Run it

```bash
npm ci
npm run dev       # http://localhost:3270
npm run build     # writes dist/
npm run preview   # serves dist/ on :3271
```

Node 20 or later.

## Where things live

The content sits in `src/data/`: `practice.js` (the ten practice areas), `people.js` and `contact.js`.
`scripts/build-pages.mjs` turns them into the practice, profile, contact and 404 pages, and fills
the lists on the homepage. It runs on its own before every `dev` and `build`. The generated folders
(`practice/`, `people/`, `contact/`, `404.html`) are git-ignored, so edit the data files and the
templates in `src/templates/`, never the output.

Header, menu and footer live once, in `index.html`, between the `partial:` comments, and every
other page copies them from there. `design.md` holds the design rules.

## Contact form

The site has no backend. While `endpoint` in `src/data/contact.js` is empty, the form opens the
visitor's email app with the message written out. Set it to a form service URL (Formspree,
Web3Forms or similar) and the form sends JSON there directly.

## Deploying to Vercel

Import the repository and keep the defaults. `vercel.json` already sets the build (`npm run build`,
output `dist/`), trailing-slash URLs and security headers.

**The site is hidden from search engines** until the Firm approves it: `vercel.json` sends
`X-Robots-Tag: noindex, nofollow` on every response. Take that header out when the Firm signs off
on the wording and the site moves to its own domain.
