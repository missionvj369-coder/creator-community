> Historical implementation record. The three writing-based studios were retired from the active app at the user’s request. Their saved data remains compatible with backups. Replacement features require a separate product discussion. See docs/WRITING_FREE_EXPERIENCE.md.

# Human Within — eighteen experiences

The original fifteen experiences retain their content, routes and numbers. Three personal studios are added as 16, 17 and 18 and featured prominently on Home. They share the cream, sage, lilac and forest identity, with individual artwork and working interactions.

## Mind Unfold

Enter up to twelve thoughts, one per line. Give each a place: an action, something to leave for now, a question to investigate, or something to share. A live map shows the distribution. Pick one thought and a concrete next move with a time or cue. Keep the complete clarity map as a card.

Thought identities survive insertion and reordering; classifications cannot silently move onto a different thought. Limits are explained before proceeding. The user chooses the classifications.

## Human Bridge

Choose a conversation partner or relationship, an intention and a tone. Describe an observation, its impact, what matters, and a clear request or boundary. Rehearse one of three explicitly scripted responses. Choose to listen, restate or pause, then edit the next line in your own words. The resulting card keeps the opening, practice scenario, response and suitable time.

This is preparation for an everyday conversation. It does not simulate or predict an actual person and does not send messages.

## Possibility Studio

Name two or three paths and up to three priorities. Set importance and fit ratings, leaving unknowns unknown. The comparison shows transparent weighted scores and coverage. It compares paths only when ratings are complete; it never selects the user's path. The user chooses an experiment, the question it could answer, a starting cue and a limit. Return to record whether it was tried and what was learned.

Changing the order or selection of priorities preserves ratings against the correct priority. Zero, missing ratings and equal scores have distinct handling. Scores are a reflection of the person's own ratings, not predictions or recommendations.

## Shared behavior

- Drafts autosave on this device, restore to a valid step and are included in profile backup/restore.
- Saved cards are updated by identity; repeated saves do not create duplicates. The latest 100 cards are retained.
- Your space provides studio continuations and saved-card counts. The original ebooks and reading positions are preserved.
- Complete UTF-8 text cards can be copied or downloaded. Input is inserted as text, including punctuation and user wording.
- Home and global Mute remain available. Existing scores and soft cues are used. The studio modules load on demand; no new film or sound files are fetched to fill out the features.
- Each card offers an optional silent two-minute timer with pause/resume, background pause and exit cleanup.
- Entries are processed in the browser without an AI service. There are no account, medical, sleep or predictive claims.

## Verification

The full `npm test` suite passes, including all original content, body assets, reader packs, opening and meditation contracts. New tests cover 18-product routing, distinct SVG references, thought insertion/reordering, validation, card deduplication, all nine conversation-response combinations, weighted comparisons, unknowns/zeros/ties, priority remapping, storage normalization and ebook/body-safe backup migration.

Browser checks exercised the full three studio flows with fictional examples, validation of a blank draft, editable outputs, saving and updating cards, profile continuation, timer pause/resume and mobile headers at 320 and 390 pixels. The real conversation-card download was read back and its Unicode and edited wording verified. A real exported profile backup contained all three studio drafts and all three saved cards alongside reading state. Console inspection reported no application errors. Desktop and narrow-screen visual checks were completed.

Physical iPhone/Android acceptance testing remains a separate device check. Account synchronization and paid access remain deferred as previously scoped.

## Visibility and navigation correction

The studios now appear as three individual cards in the eighteen-card Home catalogue and in a dedicated Studios page, linked from the persistent desktop/mobile navigation. The Home action opens the dedicated page. The existing selector is an additional preview, rather than the only entry. The welcome gate preserves direct Studios links.

Release builds attach a content-based version to the app entry, CSS and every application module import, including lazy imports. Original ebook bytes remain unchanged. Build checks verify the full application import graph, syntax, ebook integrity and hosting size. Browser regression checks inspect the rendered Home and directory so a model-only product-count test cannot miss absent cards.
