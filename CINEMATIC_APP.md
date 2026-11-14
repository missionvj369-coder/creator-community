# Human Within · Cinema edition

The visual and audio language now continues across the full app: the opening, all fifteen independent experiences, the reading room, personal space, wallpaper studio and living body book. The existing five-part collection order remains. Ebooks remain separate.

## Experience

- Calm cross-dissolves, light, depth and restrained motion connect the reception and immersive interiors. Small-screen layouts keep reading and transport controls available. Reduced-motion preferences are respected.
- Fifteen experiences have fifteen distinct original scores. Reading, arrival, personal space and the body bring the total to nineteen instrumental arrangements. Each ships as 48 kHz stereo AAC at 256 kb/s, with prepared loop joins and a 2.6-second transition between scores.
- Twenty recorded welcomes introduce the rooms and experiences. Nine recorded cues guide the opening and original grounding sequence, with device narration as a fallback. This does not replace every chapter with recorded narration: the existing optional read-aloud controls remain.
- A common mixer controls master volume, music, welcome guidance and soft effects. Music lowers under narration. Native frequency sessions and recorded meditation take precedence over background music. Settings are included in local profile backups.
- The three welcome messages share one continuous film file, including the optional message picker. Original individual films are retained with the source; no video or audio quality is reduced to meet the hosting package limit. The largest offline ebook is assembled from its existing full-quality assets when downloaded, avoiding a second hosted copy. Its self-contained HTML is checked against the exact original offline-reader SHA-256; the original ZIP parts are retained with the source.
- The automatic entrance remains: title reveal, three continuous founder messages, the five-minute Still Room, then the original 116-second settling sequence and the requested destination. Browsers require one tap to enable sound; the visuals continue automatically without it.
- Twenty Minutes Down uses the existing twenty-minute recorded night practice, followed by twenty minutes of original music that fades to silence. Pause, resume, end and replay use the real media clock; ending stays on the quiet Goodnight screen.

## Preserved content

All fifteen independent products, 375 content units, 105 situations, six ebooks, thirty individual downloadable wallpapers, and all ninety-nine body discoveries remain. The real reference anatomy, organ close-ups, function sequences, software-rendering fallback, original reading packs, progress, saved items and backups remain available.

## Validation

The full npm test suite passes, including content integrity, original opening/meditation timing, profile and backup compatibility, all fifteen experience flows, anatomy geometry, new audio hashes, gesture gating, crossfades, native-session mute and late-loading voice cancellation.

`content-source/cinema/audio-verification.json` records FFmpeg measurements of all 54 shipped new/remastered audio files. The nineteen scores measure between -23.03 and -23.00 LUFS. The highest measured true peak across the checked files is -2.99 dBTP. These are decoded file measurements before app mixing and volume, not a claim about device output or subjective listening quality.

Browser checks at 320 × 568 and 390 × 844 cover the collection, reflection world, chapter entry, reading room, profile, embedded sanctuary, tone-session master mute and recorded sleep playback/pause/resume/quiet ending. The title reveal and film playback, meditation exit into the original grounding sequence, and body atlas are also checked. Long duration timing and the continuous three-film handoff are covered by automated media/timeline checks; the full forty-minute sleep practice is not timed end to end in the browser.

Scores and voices are locally rendered original assets, with credited sampled instruments. SoundFont copyright and attribution are shipped under `public/cinema/audio/`. Reproduction scripts are in `scripts/render-cinema-scores.py`, `scripts/render-cinema-voices.py` and `scripts/analyse-cinema-audio.py`. Headphones and device speakers differ; the app makes no claim to a cinema certification, clinical outcome, or validated healing frequency.
