# The Still Room

Research and design notes · 29 October 2026

The Still Room is Human Within’s signature opening practice: a quiet water scene, an original ambient score and recorded synthetic narration. The original fifteen experiences, six books and thirty wallpapers remain as supporting resources. The later 84-entry expansion has been removed.

## What the evidence can support

Five minutes is a practical, low-demand introduction to guided rest. Research on brief breathing and mindfulness supports investigating changes in mood, stress and repetitive thinking. It does not establish that this original combination puts anyone into deep sleep in five minutes. The sequence and timings below are editorial design choices informed by research, not an independently validated clinical protocol. No evidence establishes twenty minutes as the optimum duration or guarantees a purchase after a free session.

| Source | What was studied | Finding and limit | Design consequence |
| --- | --- | --- | --- |
| [Balban et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9873947/) | 108 adults; five minutes of breathing or mindfulness daily for 28 days | Mood and state-anxiety changes were reported. Wearable sleep duration, efficiency and sleep scores, and daytime sleep-related disturbance did not significantly improve. This was repeated practice, not a test of our hybrid session. | Offer a short introduction without promising sleep or reproducing the more demanding breathing methods. |
| [Sommerhoff et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10398553/) | 68 adults; five-minute bedtime body scan daily for ten days versus no training | Questionnaire-based repetitive negative thinking improved at follow-up; perceived stress improved after training. Acute EMA effects were not established. The small sample, self-reported adherence and no-training control limit inference. | Include a gentle body scan. Do not call it an immediate thought-stopping or deep-sleep technique. |
| [Harvey, 2003](https://link.springer.com/article/10.1023/A:1026322310019) | 30 people with insomnia and 30 good sleepers; presleep thought suppression versus allowing thoughts | The suppression instruction led to worse estimated sleep-onset latency and sleep quality. Outcomes were subjective. | Invite thoughts to come and go; never make an empty mind a target. |
| [Fincham et al., 2023](https://www.nature.com/articles/s41598-023-49279-8) | 400 adults; about ten minutes daily for four weeks; 5.5 breaths/minute versus a credible 12 breaths/minute comparison | The slow pattern did not outperform the comparison for the main wellbeing outcomes. | Make paced light optional. No claim of a unique effective respiratory rate. |
| [Black et al., 2015](https://pubmed.ncbi.nlm.nih.gov/25686304/) | 49 older adults with sleep disturbance; six weeks of two-hour weekly mindfulness classes and homework | Self-reported sleep quality improved versus sleep-hygiene education. This was a substantially longer, repeated programme in a particular population. | A bedtime option is reasonable to explore, but a single short audio cannot inherit these results. |
| [NHS breathing guidance](https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/) | Public guidance for comfortable breathing during stress | Gentle breathing without forcing; optional equal in/out counting. This is not evidence for our shorter breathing segment as a treatment. | Own pace is the default; no holds, forced depth or fast breathing. |
| [NHLBI: stages of sleep](https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep) | Physiological description of non-REM and REM sleep | Deep sleep is non-REM stage 3. Calm appearance or time spent in an app cannot establish sleep stage. | Record practice playback and optional self-report only. Never infer sleep or biometrics. |

## Five-minute sequence

| Time | Guidance | Visual and sound |
| --- | --- | --- |
| 0:00–0:45 | Find support; an eyes-open option from the beginning. | Calm water, distant banks and warm diffuse light. Voice over original soft ambient music. |
| 0:45–1:57 | Notice ordinary breaths; smaller comfortable breaths and own rhythm are always allowed. | Optional light follows five seconds in / five out, with no holds. The cue is a design option, not an efficacy claim. |
| 1:57–2:23 | Release the count; soften the gaze or optionally close the eyes. | Water and interface gradually darken. Nothing requires watching. |
| 2:23–3:58 | Notice feet, legs, hips and back, hands and arms, shoulders and face. | No new task, visual challenge or sound accent. Voice leaves pauses between invitations. |
| 3:58–4:40 | Rest with the whole body; thoughts may come and go. | More quiet between spoken cues. |
| 4:40–5:00 | Daytime: orient to the room. Bedtime: remain at rest. | The opening journey proceeds to the restored quiet-arrival sequence. Standalone daytime practice waits for “Explore gently”. In the opening journey, daytime continues into the restored quiet-arrival sequence before app entry; standalone practice waits for “Explore gently”. Bedtime fades to silence, with no automatic app entry or sales prompt. |

The twenty-minute practice shares the gentle beginning, then offers increasingly spaced invitations. Its last spoken cue starts at 16:30, leaving more than three minutes of music and quiet. The score fades over the final 35 seconds. The five-minute bedtime excerpt uses a seven-second player fade. Screen locking and background playback remain subject to the device/browser; the player uses native HTML audio and Media Session controls rather than requiring a foreground visual timer.

## Sound, rights and implementation

The score is an original procedural composition using warm pads, sparse felt-like notes and soft filtered ambience. It makes no binaural, healing-frequency or physiological-entrainment claims. There are no external music samples. See `scripts/generate-meditation-bed.py` for its reproducible source.

The narration is an original script rendered offline with Kokoro v1.0, stock voice `af_heart`, at speed 0.68. The model is Apache-2.0; `kokoro-onnx` is MIT. This is a synthetic stock voice, not an imitation of an identified person. Upstream: https://github.com/hexgrad/kokoro and https://github.com/thewh1teagle/kokoro-onnx . The generator and model files are not shipped in the web app. The two complete MP3s play without a speech-service account, browser speech synthesis or a recurring generation charge.

Every spoken cue has a measured ending and a gap before the next cue. Audio analysis and hashes are in `public/meditation/audio-analysis.json`. Tests check actual codec, duration, file size, narration gaps, pause/resume, background media timing, buffering, seeking, caption fallback, progress deduplication and backup compatibility. Playback completion records time actually played, not an inferred emotional or sleep result. The optional check-in is self-report.

Five minutes is labelled free. The longer practice is available in the private preview. Payment processing and a paid-access boundary have not been connected; no purchase flow is simulated.
