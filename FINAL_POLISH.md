# Human Within — final playback and navigation polish

The fifteen independent experiences, six ebooks, 99 body discoveries, wallpapers and original sound library are retained.

## Changes

- Pause and resume keep the same tone session, clock and breathing phase. Pausing holds background music; leaving releases audio promptly.
- Delayed media promises and unlock requests obey the latest pause, mute or exit. A stale request cannot restart a departed room.
- Meditation restores media position after metadata is ready. Adding sound to paused captions keeps the practice paused. Buffering, interrupted audio and native pause events keep controls consistent.
- Sleep saves the listening position, offers Continue and Start from the beginning, preloads the quiet tail earlier and preserves pause during a track handoff. Its position is included in backup and restore.
- Explicit Home and one-tap global Mute are available throughout immersive rooms, loading and completion screens. Fullscreen keeps the room toolbar. Download and other reader actions remain in a compact menu on mobile.
- Mirror journeys now pause their playback and sound together. Body narration uses pause/resume within a discovery; changing discovery cancels the old narration.
- Views load on demand, stale route imports cannot paint over newer navigation, and transitions no longer wait for a network load before showing feedback.
- Initial static JavaScript dependency graph: 53 modules / 450,330 bytes to 33 modules / 217,729 bytes (about 52% fewer bytes). This measures source dependencies, not a guaranteed device loading time.

## Verification

`npm test` passes the complete existing suite and the new playback regression tests. Coverage includes delayed play/close races, stale rejections, pending unlock cancellation, metadata seek/cancel, paused clocks, oscillator reuse, global native-audio mute, backup compatibility, all catalogue assets and the offline body reader.

Browser checks use production screens at 320 and 390 pixels. Controlled meditation checks pass start, pause/resume, daytime background pause, saved positions, interrupted-audio captions and the original post-meditation calming sequence. Native sound lifecycle checks confirm one start across repeated resumes and one cleanup on exit. Actual recorded sleep playback, mute while paused, Home exit and saved Continue entry were checked. Controlled sleep checks also pass saved quiet-tail restoration, inactive-tail preload, explicit restart, pause at track handoff and a quiet natural ending. Fullscreen retains Home. Mobile headers and reader menus fit the narrow layout.

The browser environment does not provide hardware WebGL; the body viewer's lightweight 3D fallback was checked. Full GPU rendering, physical-device audio quality and iOS lock-screen behavior still need device acceptance testing. Accounts and paid access remain outside this release, as previously scoped.
