# Know Your Body — cinematic reference anatomy

Version 10 retains the original visual ebook's 99 complete discoveries, 12 chapters, 21 body-part entrances, original-page links and neoXhuman credit. All six original books and the fifteen independent products remain available. No daily plan or new product has been added.

## Presentation

The body viewer now loads locally hosted reference geometry from the Human Reference Atlas v1.2 and a separate BodyParts3D skeletal reference. Tissue colours and warm directional lighting provide form; the models retain the datasets' anatomical proportions and registered organ positions. The body opens in an upper-body context, with a full-body control. Relevant organ discoveries open close-ups; drag, turn, front/back, zoom, skin visibility and a section plane support inspection. Structures absent from the source dataset are explained in diagrams instead of fabricated models. Female reproductive reference anatomy and the lymph node have separate reference frames, identified in the interface.

Cinema view expands the visual, retains next/back/tour controls and displays the current discovery title. Camera transitions ease between views; supported WebGL devices add a very slow camera arc until the reader interacts. Reduced motion stops automatic movement. The reading view remains page by page. All 38 function sequences have numbered steps, play/pause, previous/next and a quiet end with replay. Heart circulation uses the actual reference chambers and valves with illustrative gold route highlights; other functions retain explanatory schematic animations.

The collection hero uses the same forest, ivory and warm light palette. The existing opening films, meditation and automatic calming sequence keep their original order. Bedtime behavior and the separate reading room are preserved.

## Loading and compatibility

Three.js 0.187.0 and its loaders/controls are vendored and lazy-loaded for this experience. Four detailed GLBs are each below the 25 MiB hosting limit. The immediate poster remains visible until geometry is ready. Devices without WebGL use a genuine Canvas 2D triangle renderer of lightweight versions of the same meshes; rotation, zoom, organ selection and clipping remain interactive. Lightweight models total about 3.5 MB and are built with the checked-in meshoptimizer simplifier. Software rendering redraws when the view changes rather than running a continuous decorative animation.

## Sources

See `public/anatomy/CREDITS.md` and the in-app About panel for model authors, source URLs, licences and modifications. `manifest.json` records file sizes, SHA-256 hashes and structural bounds. Reference anatomy represents reference bodies, not every individual's anatomy. Highlights, diagram routes and timings explain concepts rather than displaying measurements.

## Verification

`npm test` covers the original app regression suites, all original body texts/pages, chapter mapping, saved state and backup restoration, all 38 diagrams/processes, the tour through discovery 99, eight GLB files and hashes, finite vertex/normal values, valid indices and size budgets, valid model targets, and software projection/clipping using real camera geometry.

Browser checks and their device/rendering limits are recorded in the release handoff. A browser without GPU access cannot verify WebGL shading; it can verify the actual software-rendered anatomy, routing, controls and responsive presentation.

### Browser review, 12 November 2026

Reviewed at 320 × 568, 390 × 844 and desktop size. Confirmed reference body loading through the software renderer; named-organ selection; heart close-up; interactive section/turn controls; four heart route steps; automatic progression to Replay; atlas search and navigation to the kidneys and skeleton; Cinema view and return; and the reading-room/collection handoff. Adjusted camera refitting after viewport changes and moved the desktop cinema caption away from orientation controls. Increased lightweight geometry detail and added interpolated vertex lighting after visible faceting appeared in review. GPU rendering remains unverified in this browser because WebGL is unavailable.
