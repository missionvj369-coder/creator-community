# Human Within

A premium, responsive app with eighteen independent experiences, arranged through stillness, self-understanding, choice, connection, return and discovery. Every product opens on its own and keeps its own collection. Six ebooks remain in a separate reading room. The cinematic opening, five-minute Still Room practice and automatic calming sequence welcome each new session.

## Guided experiences with no writing activities

Chapter reflections, the profile journal composer, and written exercises have been removed. Activities now use observation, listening and simple real-world actions. Matrix Escape supplies each practice inside the app. Profile naming is optional. All thirty wallpaper images and their downloads use the revised reminders; affected ebook exercises and offline packs match.

The three writing-based studios remain retired. Wonder Engine, The Unseen and The Creation Field are their gesture-led replacements. The active collection has eighteen experiences, six ebooks and the wallpaper gallery. Old studio/planning links return safely to Home. Existing notes, studio drafts and cards remain in backups, and previously saved notes can still be read in Your space.

See [docs/WRITING_FREE_EXPERIENCE.md](docs/WRITING_FREE_EXPERIENCE.md) for scope and checks.

## A living body book

Open **Know Your Body** in Ebooks to explore all 99 discoveries from *The Body You Live In* through a transparent body and 38 distinct animated close-ups. Choose a guided tour, search the anatomy atlas, move chapter by chapter or read at your own pace. Optional device narration, ambient sound, still visuals and saved position keep the experience in your hands. The original ebook and reader pack remain beside it.

See [the visual experience notes](docs/BODY_VISUAL_EXPERIENCE.md) and [the playback audit](docs/PLAYBACK_AUDIT.md). Rebuild the preserved text data with `npm run build:body`.

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

For static hosting, run `node scripts/build-static.mjs`, then `npm run test:release`, and deploy `dist/`. The build versions app scripts and styles so clients can load a fresh release. Open the app over HTTP; JavaScript modules require a web server rather than double-clicking its index.html.

## A continuous opening comes first

Every new tab session opens with a 12-second Human Within title reveal: light gathers into an abstract human contour, then opens into a luminous silk portal. The subtitle is “A quieter world begins within.” The existing sage, cream and lilac identity continues throughout.

The three welcome messages play from one continuous film so there is no new buffering gap between clips. They lead automatically into the five-minute Still Room practice. A single tap can enable sound during the opening; without it, captions and visuals can continue automatically, with an Add sound control available in the practice.

The opening now follows: title reveal → three welcome films → five-minute Still Room meditation → the restored automatic quiet arrival → app features. The restored arrival retains the original welcome (15 seconds), three garden stages (90 seconds total) and return (11 seconds). It runs automatically after a completed daytime opening meditation and opens the originally requested app page afterward. Standalone repeat practices retain their gentle finish. Bedtime stays dark and quiet until the user chooses to return. Leave, pause, still-scene and eyes-open options remain available.

Entry is remembered for the current tab session, so ordinary navigation does not force a repeat. The side link replays the cinematic welcome. The header icon opens the Still Room. Direct links to books and experiences are preserved after arrival. The profile database remains deferred; practice history and backups work on the device.

## An independent experience flow

**Stillness → Self → Choice → Connection → Return.**

The main tabs are Home, Discover, Ebooks and Your space. Home lists all eighteen experience cards in six chapters. Discover opens the three new interactive rooms directly. The chapter index moves directly to any part of the collection; every product remains independently accessible. There is no daily checklist or writing assignment.

Each product has an overview, its complete collection or immersive world, and a natural next invitation. Finishing a reading or sound session, or choosing Leave gently in a visual world, opens a quiet transition with choices to continue the same collection, explore the next product or return to the experience home. Sound starts only through user interaction. Brief route fades and subtle movement respect reduced-motion preferences.

Ebooks keep their own shelf, bookmarks and download packs. Rewire contains all thirty downloadable wallpapers. Clarity includes the original affirmation companion. Prior daily-plan progress remains preserved in backups and carries into each independent course's position; retired daily links resolve to the relevant product. The old daily planner screens and engagement bridge are removed.

See [PRODUCT_SYSTEM.md](PRODUCT_SYSTEM.md) for the current flow and [docs/EXPERIENCE_FLOW.md](docs/EXPERIENCE_FLOW.md) for implementation and verification details.

## Living experiences

The Loop, Matrix Escape, ONE, Sixty-Six Days of Awakening, One God, One Voice and Clarity now open as distinct full-screen worlds at the level of The Human Sanctuary. The Human Journey receives the same reading treatment. Each has its own visual form and stage structure: an opening ribbon, light maze, human constellation, unfolding bloom, hall of arches, dawn-to-dusk horizon and thread of life.

Every original text remains available. The seven upgraded collections contain 324 adapted chapters; the app preserves the original fifteen products and 375 adapted units, with writing assignments adapted into non-writing practices. Reading is split into clear parts, with a complete-chapter view, a searchable collection, explicit completion and a matching quiet finish. Matrix Escape keeps all 105 real-life situations. Clarity's morning/evening choice changes both the content and horizon, and its affirmation companion remains available.

Stage positions save locally and survive JSON backup/restore. Previous reflection drafts remain in backups; the active reading interface has no reflection fields. Ambient sound and read-aloud start through explicit controls. Still visuals, keyboard navigation, cleanup on exit and hidden-tab handling are included. Books, profile, the sound-session room and the wallpaper studio receive surrounding design refinements. No daily scheduler is added.

See [docs/IMMERSIVE_EXPERIENCES.md](docs/IMMERSIVE_EXPERIENCES.md) for the design and verification record.

## A profile that works on this device

The current app uses browser storage and makes no account or sync requests. Database and account integration are deferred. The legacy Node API remains available in the source as a future integration point, but the frontend does not use it.

Working profile features:

- Optional first name or nickname, colour, goals, and suggested moment length.
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

`npm test` checks the retained engine/API, all 18 products and 375 content units, all 105 situation mappings, all book assets and offline packs, all 30 wallpaper originals, local profile persistence, full timestamp precision, deduplicated completions, saved items, and backup/restore.

For maintainers, `scripts/make-wallpapers.py` rebuilds the vector and PNG collection with the system SVG renderer and Pillow. `scripts/package-books.py` builds the self-contained offline readers. Prebuilt files are included; Python is not required to run the app.

## Hosted download packaging

The two largest optional offline book ZIPs are served as checked 8 MiB pieces in this hosted copy. A download page assembles the original ZIP bytes and offers the same complete offline reader. Online books, their content and the arrival videos are unchanged. This source keeps the same chunked download pages, with hashes checked before the complete ZIP is offered.

## The Still Room (v6)

The accepted title reveal and three continuous welcome films lead automatically into the signature practice, followed by the restored quiet-arrival sequence before app features. The later 84-entry expansion has been removed. The original fifteen experiences, six books, thirty wallpapers and guided real-life journey remain available.

The practice offers a five-minute daytime ending, a five-minute quiet bedtime ending and an optional twenty-minute bedtime session. The voice and music are complete static MP3s, with synchronized captions. The five-minute recording is freely downloadable from the practice hub. The longer session is available in this private preview; payment processing is not connected.

Read `docs/THE_STILL_ROOM_RESEARCH.md` for evidence, limits and exact timing. The original sequence is informed by research, not a clinically validated protocol. It does not promise thought suppression, deep sleep, a sleep stage or a particular emotional outcome.

Source narration is in `content-source/meditation/script.json`. The measured runtime copy is `public/content/meditation/session.json`. `scripts/generate-meditation-bed.py --output-dir /absolute/scratch/audio` reproduces the original score. `scripts/render-meditation-audio.py --runtime /absolute/runtime --model /absolute/kokoro-v1.0.onnx --voices /absolute/voices-v1.0.bin --bed /absolute/bed.wav --cache /absolute/scratch/voice-cache` renders narration and music with local dependencies. Keep model files, dependencies and intermediate WAVs outside the checkout.

`npm test` verifies the original collection, persistence and journey, continuous opening, real MP3 metadata, measured cue spacing, credited playback time, pauses, buffering, seeking, caption timing, resume and backup compatibility. Browser QA covers the actual five-minute recording and phone layouts; controlled media tests cover quiet endings, background behavior and error fallback. QA pages must remain outside `public/` in a release build.

“Leave gently” from meditation now continues into the quiet-arrival sequence before app features, including directly opened and resumed sessions. Sound and still-scene choices are carried into the transition. Leaving early preserves partial playback without marking the practice complete.


Version 8.1 continues the Sanctuary-level design through the eight native experience entrances, all fifteen collection/return identities, and the native viewer controls. See [premium continuity](docs/PREMIUM_CONTINUITY.md) for scope and validation.

## Discovery rooms — version 12

- **Wonder Engine:** five interactive experiments with contrast, illusory contours, wave interference, gravity and pendulum phases. Optional Auto explore advances within this room only.
- **The Unseen:** three original illustrated comparisons for visible/near-infrared light, thermal views and magnetic fields. Every scene labels the model and provides context and a primary reference. No camera or sensor measurements are taken.
- **The Creation Field:** three distinct generative forms (Silk, Bloom, Orbit), three palettes, four proportions and up to 24 touch gestures. Undo, Start fresh and a keyboard-accessible gesture action support exploration. Export a full-resolution PNG or a silent six-second MP4/WebM loop. Browsers without recording support receive a clearly labelled animated SVG instead.

The current composition and four most recently exported compositions stay on this device and in profile backups. Your space shows thumbnails rendered from the actual composition, and opens each saved work. Global mute covers the new original scores and gentle touch tones. Pause freezes visuals and holds the room score; returning from a hidden tab requires Resume. The existing opening and all six ebook/offline packs remain unchanged.

See [discovery design and verification](docs/DISCOVERY_ROOMS.md).
