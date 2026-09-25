# Weakest Link – game content

Everything the **WeakestLinkUnity** game reads at startup lives here: the rules, the English and Arabic interface text, and the question banks. The game downloads these files from GitHub every time it launches, so editing a file and pushing it changes the game – no rebuild needed.

The game looks for them at:

```
https://raw.githubusercontent.com/Walid929/WeakestLinkContent/main/
```

(Different account or repo name? Change it in the game under **Settings → Content repository**. A normal `https://github.com/owner/repo` link works too.)

If GitHub can't be reached, the game uses its last successful download, and failing that the copy built into the app.

## Files

| File | What it holds |
|---|---|
| `manifest.json` | The list of files to load. Add extra question files here. |
| `rules.json` | Game formats (money chains, round times, number of players…). |
| `categories.json` | Question categories with their English and Arabic names, and whether each is on by default. |
| `translations/en.json`, `translations/ar.json` | Every piece of text on the host device, the TV and the phones. |
| `questions/en.json`, `questions/ar.json` | The question banks. English games use the English bank, Arabic games use the Arabic bank. |
| `tools/import_csv.py` | Rebuilds the three files above from a questions export CSV. |
| `legacy/` | The first hand-written question set (no longer loaded). |

## Questions

The banks are generated from the questions export CSV (currently 1,608 English and 1,573 Arabic questions in 24 categories). To refresh them after a new export:

```
python tools/import_csv.py path/to/questions_export.csv
```

It rewrites `questions/en.json`, `questions/ar.json` and `categories.json`. What it does:

- `language` (English / عربي) picks the file; `difficulty` Easy/Medium/Hard (سهل/متوسط/صعب) becomes 1/2/3.
- The CSV's category names are matched across the two languages (for example *Flags* and *أعلام* both become `flags`), so one switch in the lobby covers both languages. The table is `CATEGORY_MAP` at the top of the script; a category it doesn't know gets its own id automatically.
- `fileUrl` becomes a picture, audio clip or video (`"media": {"type": "image", "url": "…"}`) shown on the TV. The host's device shows pictures too, and has a *Replay the clip* button for audio and video.
- Multiple-choice questions keep their four options. True/false questions become *True/False* (صح/خطأ). Text questions get three wrong answers picked from other answers in the same category (so a flag question offers other country names). Those are only used when the host picks a multiple-choice answer mode. For riddles and general knowledge they can look random, so *Out loud* suits those categories best.
- Songs, Foreign Songs and Movies & Series start switched off, because a clip takes longer than a normal Weakest Link turn. The host can switch them on in the lobby.
- Questions without a picture or clip are marked `"final": true` and are used first in the head-to-head.
- Test rows and exact duplicates are skipped.

Each question looks like this:

```json
{ "id": "en-01015", "cat": "flags", "diff": 2, "final": false,
  "q": "This flag belongs to which country?", "a": "Philippines", "wrong": ["Haiti", "Angola", "Guinea"],
  "media": { "type": "image", "url": "https://firebasestorage.googleapis.com/…" } }
```

The picture and clip links point to Firebase Storage, so the TV (and the host device, for pictures) needs internet access during the game.

## Rules (`rules.json`)

Four formats are included. The host picks one in the lobby.

| id | Based on | Players | Money chain | Rounds |
|---|---|---|---|---|
| `nbc2001` | NBC primetime 2001–02 | 2–8 | $1,000 → $125,000 | 2:30, −10 s per round, then a 90 s double round for the final two |
| `syndicated2002` | Syndicated 2002–03 (season 1) | 2–6 | $250 → $12,500 | 1:45, −15 s per round, then a 45 s double round |
| `nbc2020` | NBC revival 2020 | 2–8 | grows every round: $25,000 target in round 1 up to $500,000 | 6 rounds, no double round |
| `family` | The family board game | 3–12 | £50 → £1,000 | 2 minutes, nobody is voted off – the Weakest Link collects a token; after the set number of rounds the two with the fewest tokens go head to head |

Fields:

- `minPlayers` / `maxPlayers`
- `elimination`: `true` = voted off each round; `false` = tokens (family rules), with `fixedRounds` rounds.
- `chains`: one list per round. With a single list every round uses it; with fewer lists than rounds the last one repeats.
- `roundSeconds`: one value per round, same rule as `chains`.
- `scheduleAlignment`: `"end"` means that with fewer players than the maximum the game uses the END of the schedule (4 players in `nbc2001` play the last two rounds: 1:50 and 1:40). This matches the PC game. `"start"` uses it from the beginning.
- `finalBankRound`: the extra round for the last two players (`seconds`, `multiplier`).
- `headToHead.questionsEach`, `headToHead.suddenDeath`.
- `firstRoundStarter`: `alphabetical`, `random` or `join_order`. The host can override it before round 1. Later rounds always start with the previous round's Strongest Link.
- `whoCanBank`: `current_player` (show rule) or `anyone` (the PC game's "bend the rules" option).
- `autoBankFullChain`: a perfect chain banks itself and ends the round.
- `defaultAnswerMode`: `spoken`, `choices4`, `letters` or `choices2`.

Notes on accuracy: the NBC 2001, syndicated and 2020 money chains come from the show's Wikipedia article and a 2020 review of the revival. The 2020 round lengths and the family board game's money values aren't published, so the values here are sensible defaults – change them freely.

### The host can change these

`rules.json` holds the defaults. In the game, *Change the rules* in the lobby lets the host change any of the settings above for their own device (clock, chain, currency, players, final round, head to head…). Only the settings they change are overridden, so edits pushed here still reach everything else.

## Translations

`translations/en.json` and `translations/ar.json` must have the same keys. `{name}`-style placeholders are filled in by the game; keep them in both languages. Keys starting with `tv_` appear on the TV and `ph_` on the phones. Everything else is on the host device (some are shared).



