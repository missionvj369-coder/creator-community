# Experiences without writing activities

The active app lets people watch, listen, notice and follow a simple invitation. It does not ask for journal entries, written reflections or personal plans.

- Removed the reader and immersive-chapter reflection controls and the profile journal composer.
- Retired Mind Unfold, Human Bridge, Possibility Studio and the old written planning routes. Home retains the original fifteen independent experiences, with six ebooks and the wallpaper gallery separately available. Version 12 adds Wonder Engine, The Unseen and The Creation Field as three gesture-led discovery rooms, bringing the active collection to eighteen.
- Old studio, guide and thread bookmarks return to Home. Old studio entries are no longer offered in profile history or favourites.
- Previous notes, drafts and saved cards remain in the data model and JSON backups. Existing notes can be read in Your space.
- Reworked written exercises in Clarity, Awakening, ONE, Rewire and all relevant real-life scenarios. Matrix Escape now provides twenty-one direct practices without an external AI prompt or a request to describe a situation.
- Revised the two wallpaper cues that previously requested writing, including their SVG, PNG, preview and full download pack. All thirty distinct designs remain downloadable.
- Adapted writing exercises in the parenting and evening-reading books and two manual preparation instructions in the AI book. Narrative scenes, historical references to writing, sources, licences and AI-generated-writing examples remain meaningful book content.
- Rebuilt affected offline reader packs. Split downloads use content-addressed part names so an earlier cached part cannot be combined with a new archive.
- Profile naming is optional, including when saving preferences without entering a name. Search remains available.

The title reveal, continuous three-film welcome, five-minute Still Room and automatic grounding sequence remain in their existing order. Pause, resume, global mute and Home controls retain their existing behaviour.

## Verification

`npm test` checks all retained product routes and 375 units, non-writing activities, retired-link recovery and preservation of previous material. `scripts/browser-qa/qa-no-writing-checks.html` exercises the actual Home, profile and reader DOM. `python3 scripts/verify-book-packs.py` compares every offline book against its current online edition and checks split-part hashes. The static release checks still validate every versioned application import, ebook bytes and hosting limits.
