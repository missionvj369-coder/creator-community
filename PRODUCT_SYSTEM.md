# Human Within · The living thread

The app helps a person move one real situation forward and learn from the result. Its central process is **Understand → Make space → Choose a step → Try it in life → Notice & learn**.

Home offers one primary next action. An unfinished situation, including partially written answers and the exact exercise prompt, stays available when the person returns. There is one active thread. A name and account are not required to begin.

## Six connected tools

| Tool | Purpose | Result |
| --- | --- | --- |
| Signal Map | Name the situation, context, and capacity available today | One suggested approach, with its reason |
| Untangle | Separate an observation from its interpretation | One part within the person's influence |
| Choice Lab | Compare two possibilities against personal priorities and practical capacity | A small trial or an information step |
| Conversation Studio | Work with an observation, need, and request | Editable, copyable words for a real conversation |
| Small Step | Give an intention an action, cue, time allowance, and easier fallback | A personal pocket plan to copy or download |
| Pattern Lens | Reflect on what happened after the person tried something | Personal evidence for a later suggestion |

Exercises use short guided prompts. The person can change the proposed approach. Low capacity steers toward a manageable beginning, with a conversation route retained where specifically chosen. Choices that would be hard to undo produce an information-gathering step before commitment.

## Return and learn

A plan stays open until the person returns. Reflection distinguishes a useful shift, no clear shift, a harder experience, and a step that never happened. An untried plan is never counted as a completed action. A follow-up can reuse what helped, shrink a blocked step, or try another approach. Earlier answers and context carry forward.

Pattern Lens needs three tried-and-reviewed steps before showing its first picture. An approach needs at least three reports for the same situation and capacity, with at least two thirds reported helpful, before those reports influence a recommendation. The reason shows the count. Time in the app does not count as evidence of benefit.

All suggestions use explicit local rules. Conversation drafts use local templates and the person's answers. There is no connected AI model, cloud account, or scheduled notification service in this version.

## Supporting library

The fifteen original experiences support the journey. All 375 content units, 105 everyday situations, six eBooks, thirty original wallpapers, and extra tools remain accessible through Library. A live plan offers a relevant brief pause and experience in an optional section. Exploring never replaces the active thread.

## Data and future integration

The current version saves in browser storage. JSON backups preserve drafts, plans, reflections, profile, reading positions, and existing saved content. Older backups migrate to an empty journey. Threads are bounded to the most recent 100 and app activities to 600 to keep local storage manageable. Export a snapshot to retain older history.

Database and account integration are deferred. The pure journey model is in public/js/journey-model.js and persistence in public/js/journey.js. A future account layer must handle consent, cross-device conflict resolution, deletion, and clear sync status. This version makes no sync claims.

Run npm test to validate the original catalogue and the new guided process, including sixty combinations of situation, capacity, and context; all four exercise methods; blocked steps; truthful completions; feedback; migration; backup/restore; and duplicate completion protection.
