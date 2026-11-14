# Know Your Body — the living book

Know Your Body opens from the Ebooks reading room, both through its invitation and the original body ebook's card. It is a visual companion to **The Body You Live In by neoXhuman**. The original reader, its 164 pages, glossary, references, bookmarks and offline reader pack remain available. The main collection still contains fifteen independent products and six ebooks.

## Content and visual structure

The generated `public/content/body-atlas.json` preserves the exact title and complete text of all 99 original discoveries. Each discovery retains its chapter and source page. Rebuild it with `npm run build:body`; the extraction script reads the canonical ebook instead of maintaining a second edited text.

Twelve chapters move from cells through nerves, senses, circulation, breathing, digestion, water balance, movement, defence, hormones, sleep and everyday body knowledge. Twenty-one body-part entrances allow direct exploration. Thirty-eight distinct local SVG views explain processes, including a nephron, synapse, retinal light path, alveolar exchange, muscle filaments, placental exchange and separate uterus and testes anatomy. A transparent full-body context highlights the relevant system alongside each close-up.

All art is original vector code, with no external anatomy image downloads or runtime rendering dependencies. The artwork is intentionally illustrative: proportions, motion and timing are not measurements. The front-facing body places its left on the viewer's right. Rose/blue distinguish circulation routes; the About dialog explains that human blood is always red. The composite overview is not a model of every person's anatomy.

Fifteen anatomy references in the About dialog link to NIH institutes and NCI SEER training: cells, nervous system, eyes, hearing, heart, lungs, digestion, kidneys, skeleton, muscles, skin, lymphatics, hormones and reproductive anatomy. Original ebook credits and its source material remain intact.

## Guided reading

The user chooses Begin, Explore or any atlas entrance. A guided tour advances through every discovery using text length and selected pace, with gentle automatic scrolling for long copy. Manual Next/Back, search, chapter selection, a discovery slider and Look closer offer control. Inspecting a close-up, opening a dialog, manually scrolling the copy or hiding the tab pauses the tour. Finishing reaches a quiet ending with replay and reading-room choices.

Device narration and ambient sound require an explicit gesture. Narration holds the next discovery until speech ends, uses cancellation tokens and a bounded watchdog, and falls back to complete text if the device voice fails. Voice quality and availability depend on the browser/device. Artwork can be made still and respects reduced-motion preferences. Hidden tabs stop the tour, voice and ambient pad; returning does not restart sound automatically.

Discovery position and opened discoveries persist on the device and are included in existing backups. They remain separate from the original ebook page position. Visits do not create false completed practices. The original-page link opens the corresponding ebook page and Keep my place returns to the living book.

## Verification

`scripts/test-body.mjs` compares all 99 discoveries to the source, validates chapter boundaries and part entrances, parses all 38 animated diagrams and two body renderings as XML, checks unique diagrams, simulates the full 99-stop tour, and tests pause, delayed ticks, narration hold, disposal and backup migration. It also parses scripts in the four native experiences changed in this release.

Browser checks at 320 × 568 and 390 × 844 verified rendering, fixed transport controls, no horizontal overflow, automatic advancement, pause, nephron search and close-up, source page 76/164, source links, rapid dialog changes, the final discovery and ending, reproductive part selection, still visuals, and the six-book reading-room integration. The preview browser could not play its device voice; the unavailable-voice message and full-text fallback were verified. Device speech playback remains a browser-dependent capability; no cross-device audio-quality guarantee is made.
