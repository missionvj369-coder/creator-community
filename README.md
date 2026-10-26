# Human Within

A little space to be human. A premium, responsive app with a guided journey from one situation to a useful action and personal learning, supported by 15 experiences, six eBooks, and 30 original wallpapers.

## Run

Node.js 18 or later is required. Extract the folder and run:

```sh
npm start
```

Open http://localhost:3000. No dependencies need installing. On Windows, double-click START_HUMAN_WITHIN.bat.

```sh
npm test
PORT=8080 npm start
```

You can also deploy the contents of `public/` to the root of any static host. Open the app over HTTP; JavaScript modules require a web server rather than double-clicking its index.html.

## The core process

**Understand → Make space → Choose a step → Try it in life → Notice & learn.**

Home offers one clear next action. Signal Map suggests a suitable approach. Untangle, Choice Lab, and Conversation Studio guide a person through short prompts. Small Step turns their words into an action, a recognisable cue, and an easier fallback. The plan stays open while they try it in daily life. Their reflection determines whether to reuse, shrink, or change the next approach.

Pattern Lens uses actual reported outcomes. Drafts, plans, and the exact exercise prompt are saved as the person goes. A blocked attempt is kept as useful feedback and never counted as a completed action. Copy or download the personal pocket plan. Read PRODUCT_SYSTEM.md for the implemented product model.

Main navigation is Home, My journey, Library, and You. All fifteen experiences, 375 content units, 105 everyday situations, six books, wallpapers, and extra creations remain in the supporting library. Brief guided pauses remain available.

## A profile that works on this device

The current app uses browser storage and makes no account or sync requests. Database and account integration are deferred. The legacy Node API remains available in the source as a future integration point, but the frontend does not use it.

Working profile features:

- First name or nickname, colour, goals, and suggested moment length.
- Real completed moments, visible time in activities, days with a completion, and reading progress. Merely opening a screen does not mark a practice complete.
- Saved experiences and books, with remove controls.
- Notes with dates and individual removal.
- Gentle interface motion and an actual ambient sound control.
- JSON backup export and validated restore, including all journey drafts, plans, reflections, and the original readers' stored reading preferences.
- A confirmed reset that clears only this app's keys in this browser.

No personal data is included in the package. The profile clearly states that data is saved in this browser. If browser storage is unavailable, it identifies the session as temporary.

## Faster eBooks

The online readers retain their complete text, illustrations, page turning, accessibility, contents/search, and original reading controls. Embedded artwork and fonts have been moved into cached assets. They are fetched as needed instead of transferring every picture before the first page. The body eBook's HTML is about 182 KB, compared with about 47 MB before this change.

The app records the actual page reported by each reader and restores a returning reader's position. Adjacent pages in the large image-based readers preload after the first page is ready. Lossless image compression is used where it reduces file size.

Each book also has a complete offline reader ZIP. Extract it and open the HTML file inside; the downloaded HTML embeds its own artwork and fonts. These optional download packs are not loaded while reading online. Their inclusion accounts for much of the full source archive's size.

The six books are:

1. The Human Journey — Shanmugam Vijay Balakrishnan
2. How to Work With Me — Astralyon
3. Why Am I Like This? — The Human Within
4. Your Child’s Growing Mind — neoXhuman
5. Why Can’t I Switch Off? — Vijay Balakrishnan
6. The Body You Live In — neoXhuman

## Individual visual identities

Each of the 15 products has a separate editorial illustration: headphones, sun and moon, a growing plant, interconnected voices, a winding human journey, connected people, an opening, a continuous loop, a phone canvas, a resting moon, a passage, a tuning fork, mirrored faces, a faceted reflection, and a sheltered garden.

The wallpaper collection contains 30 different compositions, rather than repeating a few motifs with new words. Each is linked to its daily cue: a lighthouse for focus, a staircase for beginning, a feather for a gentle exhale, a kintsugi bowl for learning from error, a compass for the next step, and so on.

All wallpapers are available as 1080 × 2340 PNGs, with WebP gallery previews, editable SVG sources, individual downloads, full-size image links, and a complete 30-image ZIP. A site cannot apply a phone wallpaper automatically; save it and choose it from the phone's Photos or wallpaper settings.

## Key files

- `public/js/views/moment.js` — the simple three-step moment
- `public/js/views/you.js` — the working profile
- `public/js/personal.js`, `space-model.js`, `store.js` — device persistence, activity and backup logic
- `public/js/views/hub.js` — Home, Explore, products and situation catalogue
- `public/js/product-art.js` — individually authored product illustrations
- `public/js/views/library.js`, `book-bridge.js` — reader integration and actual reading positions
- `public/books/`, `public/assets/books/` — lightweight readers and cached illustrations/fonts
- `public/books/downloads/` — standalone offline book readers
- `public/wallpapers/` — 30 individual artworks and downloads
- `public/css/human-within.css` — premium theme, profile and moment layouts

The original daily progression engine remains in the source for compatibility. Normal app navigation now uses open browsing and the simpler moment, without forced locks or seals.

## Verification

`npm test` checks the retained engine/API, all 15 products and 375 content units, all 105 situation mappings, all book assets and offline packs, all 30 wallpaper originals, local profile persistence, full timestamp precision, deduplicated completions, saved items, and backup/restore.

For maintainers, `scripts/make-wallpapers.py` rebuilds the vector and PNG collection with the system SVG renderer and Pillow. `scripts/package-books.py` builds the self-contained offline readers. Prebuilt files are included; Python is not required to run the app.
