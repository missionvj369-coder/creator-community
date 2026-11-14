> Historical implementation: retired on 6 November 2026 at the user’s request. The current product system is documented in EXPERIENCE_FLOW.md. The old ledger remains only for backup compatibility.

# Unified daily journey — 5 November 2026

Version 7.0.0 combines the original 15 non-ebook products into one daily journey. The main navigation is My day, Progress, Ebooks and You. The old product grid no longer competes with the guided flow.

## Behavior

- One activity from each active course/ritual per day, in a fixed morning → daytime → evening order.
- Continue opens the next unfinished activity. Completing it immediately opens the next one.
- A numbered course advances once per local day. Its own pointer is preserved when another course finishes, or when a calendar day is missed.
- Pause preserves the current course item, active time and a typed reflection. Closing or merely opening a page does not complete it.
- Ebooks retain their independent positions and downloads. Rewire supplies the day's wallpaper; Clarity contains the extra affirmation world.
- The nine numbered courses end after their original lengths; the six unnumbered immersive experiences remain repeatable daily rituals.
- Native audio/visual experiences retain their full duration. The daily requirement is a short, explicitly labelled visit after an interaction, followed by confirmation.
- Frequency chooses the next scenario automatically. The three visual collections open at the next scene on each daily visit, wrapping after the collection ends; Passage and Sleep remain continuous rituals.
- The entry videos, Still Room and automatic calming sequence remain in front of the app.

With a complete daily flow from day one:

| Day | Activities in the daily flow |
| --- | --- |
| 1–21 | 15 |
| 22–30 | 12 |
| 31–32 | 10 |
| 33–55 | 9 |
| 56–66 | 8 |
| 67–99 | 7 |
| 100 onward | 6 repeatable daily rituals |

This schedule counts completed course activities. If users pause or miss days, each course continues from its own actual place.

## Source

The pure rules are in `public/js/daily-plan-model.js`; the store adapter is `daily-plan.js`; production screens are `views/daily.js`. The existing reader and sound-session components accept a daily host so their existing content stays intact. A small same-origin bridge connects the six immersive pages to the daily host.

Local backup normalization preserves the daily plan. Legacy contiguous sequence completion migrates once. Lifetime daily totals survive the rolling recent-session limit. No cloud scheduler, account or new database was introduced.

## Verification

The automated suite passed after implementation, including 100 simulated days, all course completion boundaries, local midnight, duplicate and stale completion attempts, skipped calendar dates, contiguous migration, backup/restore and ebook-state preservation. Browser checks verified the resumed sound → Clarity handoff, saved reading/reflection drafts, Clarity → Rewire handoff, interaction-gated Frequency → Mirror handoff, the final sleep visit → day-complete screen, 12/7/6-activity queues after 21/66/99 days, all nine course-complete badges and the separate six-book section. Fixtures use labelled seeded progress to avoid claiming 99 real days of practice.

At 320 px and 390 px widths, the production home has no horizontal overflow and retains all four navigation destinations. The 320 px activity screen keeps its header and next-step footer visible around a scrollable activity. On a seeded second daily visit, Frequency selected scenario 02 and Mirror opened world 02 of 14; loading the page alone left completion disabled.

Native iOS/Android device testing remains outside this pass. All progress remains local to this browser unless exported. The user's existing publishing audience is preserved.
