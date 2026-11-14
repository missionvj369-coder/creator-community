# Playback and continuation audit

The collection remains fifteen independent experiences. Autoplay is used inside an experience when it supports listening or an uninterrupted visual journey. Reflection and reading retain deliberate progression. No feature automatically starts another product or awards a practice completion just for visiting.

| Experience | Progression | Controls and ending |
| --- | --- | --- |
| Sound Reset | Timed sound session | Begin, Pause, Resume, End; returns to the collection |
| Frequency Playground | User-selected sounds | Added Previous/Next within the current category; stops the old sound; explicit Start listening |
| Human Sanctuary | Fourteen scenes, automatic seventeen-minute journey | Added visible Back/Next and final Finish; existing chapter jumps, Pause/Resume and quiet ending retained |
| Mirror | Automatic visual passages | Next and autoplay/pause retained |
| Mirror reimagined | Thirty-six visual steps | Next and autoplay/pause retained |
| The Passage | Seven automatic worlds over ten minutes | Added persistent Back, Pause/Resume, Next/Finish and Leave; seeks actual world thresholds and pauses the timer, audio and visual clock |
| Rewire | Thirty independent wallpaper activities | Added Previous/Next in one stable preview dialog; filtered order and all download/open/share actions retained |
| Twenty Minutes Down: Sleep | Twenty minutes guided settling; fades to silence by minute forty | Added Pause/Resume for timing, speech, sound and breathing visuals; End remains available; ending stays dark |
| The Loop | Staged immersive reading | Continue, deliberate reflection save, next chapter and collection |
| Matrix Escape | Staged immersive reading plus scenario collection | Continue, deliberate reflection save, next chapter and retained scenarios |
| ONE | Staged immersive reading | Continue, deliberate reflection save and next thought |
| Sixty-Six Days of Awakening | Independent chapters | Continue, deliberate reflection save and next chapter |
| One God, One Voice | Independent chapters | Continue, deliberate reflection save and next chapter |
| Clarity | Independent chapters | Continue, deliberate reflection save and next chapter; companion retained |
| The Human Journey | Independent chapters | Continue, deliberate reflection save and next chapter |

The seven reading worlds preserve all 324 adapted chapters and their explicit progression. The original session/reader/experience route and catalogue tests remain in `npm test`.

The new Know Your Body companion is in Ebooks. Its guided 99-discovery tour has optional autoplay, manual Next/Back, pace, pause, atlas search, still visuals and source-page links; it does not add a sixteenth main product.

The opening remains title reveal → three continuous welcome films → five-minute Still Room → restored automatic calming sequence → the requested page. Sleep does not automatically open a bright app screen. The pre-existing independent-product transition choices remain available on Leave gently.

## Browser verification

The existing seven staged readers, both mirrors and Sound Reset were exercised during this task before workspace recovery; their source is unchanged in this release. After recovery, live checks again verified the body tour, filtered frequency navigation, sanctuary scene advance/pause/resume, all seven Passage thresholds while paused, sleep pause/resume/end, and a single wallpaper preview moving from day one to day two and back with matching PNG links. Automated regression checks cover the retained catalogue, independent progression, local data, opening and meditation flows.

Sleep cleanup now closes the ending session's captured AudioContext, preventing a delayed cleanup from closing a freshly replayed session. Shared sheets deactivate pointer/assistive interaction immediately when closing, so rapid successive dialogs work during the exit animation.
