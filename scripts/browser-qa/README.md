# Browser checks for The Still Room

These pages are controlled test fixtures, not production experiences. Copy the needed HTML files into `public/` only while testing in the internal preview, then remove those copies before running the static build. Open `/qa-room-workflows.html` for behavior checks and `/qa-room-layout.html` for six phone states. The fixture deliberately substitutes media and a clock so long endings and errors can be checked without waiting twenty minutes. It saves and restores the local test profile. Verify the actual recorded five-minute playback separately in the app. Never publish the fixtures.

The restored arrival checks are in the extended workflow page. For native timing and phone spacing, use `qa-grounding-preview.html` and `qa-grounding-layout.html`; they render the same production component with a test-only ending message. The original welcome, three garden stages and return last 116 seconds.

The sound lifecycle fixture substitutes audio start/stop counters and a simulated document visibility state. It exercises the production session component: begin, simulate hidden (Resume and one stop), simulate visible (Resume remains and no automatic start), then resume/close to inspect cleanup. It is an internal integration fixture, not a native-device background test.

## Daily journey checks

`qa-daily-workflows.html` uses clearly labelled seeded progress to exercise the production app without waiting through 99 calendar days. It retains an original local backup and has a Restore original profile button. Cases include a nearly finished sound session, saved reading, interacted versus untouched immersive visits, the final daily step, and the reduced queues after 21, 66 and 99 complete days. These seeds are test data, not claims of real listening or completed practice. `qa-daily-layout.html` embeds the real app at 320 px and 390 px. Copy the two fixtures into public for internal browser checks and remove them before the static build.

## Independent experience flow (current)

`qa-experience-layout.html` hosts the unchanged production app at 320 px and 390 px. Copy it temporarily to `public` for browser inspection, then remove it before packaging. The daily-plan fixtures above are historical; the default app no longer contains a daily runner.

## Immersive experiences (version 8)

`qa-immersive.html` hosts the production entry and reading screens at 320 px and 390 px, with controls for the seven upgraded worlds. Copy it temporarily to `public`, then remove it before packaging. It sets only the QA tab admission flag; it does not create seeded completion data.


## Native entrance continuity (version 8.1)

`qa-portals.html` hosts all fifteen production entrances at 320 px and 390 px, including the eight native products. It only sets the QA admission flag. Check distinct artwork, entry links, the three-part orientation, search where available, section navigation, matching native viewer controls and the quiet return. Remove the public copy before packaging.

`qa-body.html` exercises the production body route and original playback experiences at 320 × 568 and 390 × 844. Copy it temporarily to public for browser checks; remove that copy before packaging.
