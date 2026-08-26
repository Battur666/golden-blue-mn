# Golden Blue Quartz — single-product fullpage site

A vertically swipeable/scrollable one-page site for Golden Blue Quartz only
(no other whisky lines). Built with Swiper.js (vertical, fullpage, touch +
mousewheel) so it behaves the same on iOS, Android, and desktop web — no
traditional header nav, the scroll/swipe itself is the navigation.

```
golden-blue-quartz/
├── frontend/
│   ├── index.html        8 fullpage slides (hero, statement, about,
│   │                     mood tiles, serve, big statements, merch, contact)
│   ├── styles.css
│   ├── script.js         Swiper init + hover/tap reveal logic + form
│   └── images/           quartz-white.png / quartz-blue.png included;
│                         other slides use placeholder blocks — see
│                         HTML comments for exact <img> tags to paste in
└── backend/               Express server, /api/contact endpoint
    ├── server.js
    ├── package.json
    └── .env.example
```

## Run it

```bash
cd frontend
npx serve .
```

Backend (handles the order-request emails):
```bash
cd backend
npm install
cp .env.example .env   # fill in your SMTP details
npm start
```

## Fonts (matching the real Golden Blue brand)

- **Bebas Neue** — free, loaded from Google Fonts. Used for the big
  condensed statement type (hero, "THE FIRST [ ]" / "FALL IN [ ]").
- **Pretendard** — free/open-source, loaded from its official CDN
  (`cdn.jsdelivr.net/gh/orioncactus/pretendard`). Used for body copy.
- **OverusedGrotesk** — this is a **paid commercial font** from Displaay
  Type Foundry, so it isn't bundled here. `fonts.css` has the `@font-face`
  rules already wired up and pointing at `frontend/fonts/`; drop your
  licensed files in there with these exact names and it activates
  automatically, no code changes needed:
  - `OverusedGrotesk-Medium.woff2`
  - `OverusedGrotesk-SemiBold.woff2`
  - `OverusedGrotesk-Bold.woff2`

  Until those files are added, section headings fall back to **Space
  Grotesk** (a free lookalike) so the site still looks reasonable.

## Notes on behavior

- **No header bar** — matches the reference: scrolling/swiping through
  Swiper slides is the only navigation.
- **Bracket reveals** (`[ hidden text ]`) — on desktop these reveal on
  hover; on touch devices (`hover: none` in CSS media match) they instead
  auto-reveal via IntersectionObserver as each one scrolls into view,
  since there's no hover to trigger on mobile.
- **Merch tee** — click/tap toggles the color on any device; hover also
  works on devices that support it, using your original script logic.
- **Contact form** fields: name, phone, quantity, optional email, optional
  message — emails your inbox via the backend. Instagram/Facebook links
  are placeholders (`instagram.com` / `facebook.com`) — swap in your real
  handles in `index.html`.
- **Images**: the merch tee photos you sent are already wired in. Every
  other photo slot (bottle, botanicals, pairing board, mood tiles,
  cocktail) is a labeled placeholder block with the exact `<img>` tag
  commented above it — send those photos and I'll drop them in.
