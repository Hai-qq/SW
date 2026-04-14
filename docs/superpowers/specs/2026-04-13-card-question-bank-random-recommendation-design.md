# SW Card Question Bank Random Recommendation Design

## Goal

Use `docs/三观档案完整题库v6_1000题.docx` as the initial card question source, store the extracted data in a repo-native data file, seed it into the existing `Card` table, and make card recommendation draw randomly from that pool.

## Source Parsing

The Word document contains 1000 question groups across 58 dimensions. The stable structure is:

```text
question text
A｜option A
B｜option B
```

Some earlier questions include a `Qn.` prefix, but many later questions do not. The extractor therefore treats any paragraph followed by `A｜...` and `B｜...` as one question. Section headings ending with `（N题）` are used as the question category.

## Data Storage

Extracted data will live at:

```text
backend/prisma/data/card-question-bank.v6.json
```

Each item will include:

- `bankId`: stable id such as `v6-0001`
- `category`: source dimension title without the trailing `（N题）`
- `content`: question text without a leading `Qn.`
- `optionA`
- `optionB`
- `source`: `三观档案完整题库v6_1000题.docx`

## Seed Behavior

`backend/prisma/seed.ts` will read the JSON file and insert the 1000 questions into `Card`.

To keep the existing schema and frontend contract stable:

- `Card.sourceType = question_bank_v6`
- `Card.category = item.category`
- `Card.content = item.content + "\nA｜" + item.optionA + "\nB｜" + item.optionB`
- `Card.status = active`
- deterministic card ids start at `10000`

The A/B options are also stored as separate JSON fields for future use. The current card UI and swipe API remain unchanged for this step, so the options are embedded into `Card.content` to make the question choices visible immediately.

## Recommendation Behavior

`CardsService.recommend()` will continue to filter out cards already swiped by the current user, and will preserve category filtering and reduced-similar-topic behavior. Instead of ordering only by hotness, it will shuffle the eligible pool and return `limit` items. This makes the large question bank usable immediately while keeping the implementation small.

## Verification

Add focused e2e coverage that proves:

- the seeded question bank has many cards from `question_bank_v6`
- recommendation returns at least one question-bank card
- repeated recommendation calls for fresh users can produce different first cards from the same category pool

Then run the focused cards suite.
