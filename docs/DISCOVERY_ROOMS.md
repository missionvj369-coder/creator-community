# Discovery rooms — version 12

Wonder Engine, The Unseen and The Creation Field are the accepted replacements for the retired writing studios. The collection now contains eighteen independently accessible experiences in six chapters. Discover is a direct tab; the three new cards also appear on Home. Ebooks retain their separate reading room. The automatic welcome, five-minute Still Room and restored grounding handoff are unchanged.

## Interaction

Wonder Engine includes five experiments: identical colours in changing surroundings, a Kanizsa-type undrawn triangle, two-source wave interference, a slowed hammer-and-feather model with adjustable air resistance, and idealised pendulum phases that realign every minute. The Unseen includes original illustrated comparisons for visible/near-infrared light, a thermal still life and a dipole field. The scenes label what is a model and offer optional short explanations with primary references. They are not telescope images, camera feeds, temperature measurements or diagnostic tools.

The Creation Field uses deterministic Canvas 2D rendering. Silk, Bloom and Orbit have different structures; three palettes and four proportions change the result. Up to 24 normalised gestures are retained, with 96 points per gesture and 20 in-memory Undo states. A button supplies a gesture for keyboard users. The current composition autosaves locally. Exporting keeps one of the four most recently saved compositions; Your space renders a thumbnail from the actual seed, form, palette and gesture data. Reopening a saved composition retains those values. Exporting the same composition as another format updates its existing gallery entry.

PNG exports use the selected native dimensions: 1080 × 1350, 1080 × 2340, 1080 × 1080 or 1920 × 1080. Modern browsers encode a silent six-second, 180-frame WebM at 30 fps using WebCodecs and a small source-included WebM writer. Supported MediaRecorder formats provide a fallback. Browsers without video support receive a clearly labelled six-second animated SVG preserving the selected form, palette, seed and strokes. Export progress, cancellation, stale-result guards and hidden-tab cancellation are included.

## Playback and data

The three original, sample-free scores are Curiosity, Invisible and Atelier. They use 48 kHz stereo AAC, matched to the existing library. Gentle touch notes respect the master mute, effects setting, hidden state and room pause. Sounds start through the existing gesture unlock. Pause freezes the room clock and holds its score. A hidden tab pauses the room and requires an explicit Resume. RAF, observers, media tracks, voice, activity timers, pending exports and audio holds are cleaned up on leaving.

The new state is bounded and normalised by `discovery-model.js`, included in existing JSON backups and compatible with old backups. Existing notes, retired studio drafts, books, body atlas and course progress are retained. No new typing activity, daily checklist, account, database or payment flow is added.

## Primary references

- Exploratorium, Sliding Gray Step: https://annex.exploratorium.edu/exhibits/gray_step/
- Scientific Reports, Kanizsa contour study: https://pmc.ncbi.nlm.nih.gov/articles/PMC5766606/
- University of Colorado Boulder, PhET Wave Interference: https://phet.colorado.edu/en/simulations/wave-interference
- NASA, Apollo 15 hammer-feather drop: https://science.nasa.gov/resource/the-apollo-15-hammer-feather-drop/
- PhET Pendulum Lab: https://phet.colorado.edu/en/simulations/pendulum-lab
- NASA, near-infrared Pillars of Creation: https://science.nasa.gov/asset/hubble/a-near-infrared-view-of-the-pillars-of-creation/
- NASA HEASARC, infrared light: https://heasarc.gsfc.nasa.gov/docs/xte/learning_center/universe/infrared.html
- PhET Magnet and Compass: https://phet.colorado.edu/en/simulations/magnet-and-compass
- W3C WebCodecs: https://www.w3.org/TR/webcodecs/
- WebM container guidelines: https://www.webmproject.org/docs/container/

## Verification

Pure tests cover all eighteen routes, retirement of old writing tools, bounded/malformed state, stable gallery IDs and deduplication, backup migration, vacuum fall equality, air resistance, wave symmetry, pendulum alignment, dipole rotation, pause/resume timing, video format selection, vector fallbacks, touch-note mute/hold gating and WebM headers.

Browser checks cover the actual room modules at 320 and 390 px, all five/three/three scene selectors, canvas drawing, no typing activity, pause and horizontal overflow. Real app checks include Home/Discover entry, returning Home, palette and gesture persistence, saving and reopening an actual gallery composition, slider updates, explanation dialogs, PNG download and video download. The verified portrait PNG is 1080 × 1350; the verified motion download is VP8 WebM, 720 × 900, 180 decoded frames, 30 fps and exactly 6.000 seconds. Native iOS and Android hardware testing remains outside this pass.

The complete audio audit measures 57 shipped assets and all 22 scores. The three new scores decode to 48 kHz stereo, 62.5 seconds, approximately -23.0 LUFS with no true-peak overs. Phone directory checks additionally assert four tabs, three cards, readable card columns and no artwork/text overlap. Export cancellation and the writing-free Home/profile/reader fixtures pass.
