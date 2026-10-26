# InboxTriage

An AI tool that triages client emails for small accounting and bookkeeping firms. Paste an email, get a category, urgency level, extracted details, and a ready-to-send draft reply — powered by OpenAI.

> **Try it in 30 seconds — no API key required.** `npm install && npm run dev` opens the full app in [demo mode](#demo-mode) with five realistic sample emails.

## Why I built this

I was looking for a workflow that was repetitive, text-heavy, and had a clear output — something where AI could genuinely save time rather than just add novelty. Small accounting firms fit that description well. Their inboxes are a mix of client questions, document requests, billing confusion, and the occasional IRS panic, and every email needs to be read, categorized, and replied to individually. That's hours of work that doesn't require expertise, just attention.

The tool doesn't try to replace the accountant. It handles the reading-and-routing layer so they can spend time on the work that actually needs them.

---

## What it does

| Output | Description |
|---|---|
| **Category** | Classifies the email into one of 8 types — document request, tax question, IRS notice, billing dispute, new client inquiry, etc. |
| **Urgency** | High / medium / low, with a confidence score |
| **Extracted entities** | Client name, tax year, dollar amounts, deadlines, documents needed |
| **Next action** | One sentence telling staff exactly what to do next |
| **Flags** | Anything that needs a CPA to review before the reply goes out |
| **Draft reply** | A complete, professional response in the firm's voice — ready to copy and send |

---

## Tech stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack in one repo; API routes keep the key server-side |
| Language | TypeScript (strict) | Every data shape is typed — the whole triage result, API request/response, store state |
| Styling | Tailwind CSS | Utility classes, no separate CSS files to maintain |
| State | Zustand | Simple global state without Redux overhead |
| AI | OpenAI SDK | gpt-4o-mini / gpt-4o with JSON mode for reliable structured output |
| Testing | Vitest + Testing Library | Works with Next.js path aliases out of the box, no extra babel config |
| Linting | ESLint + Prettier | Consistent style, catches issues before they reach the repo |

---

## Project structure

```
inboxtriage/
│
├── app/
│   ├── layout.tsx                  # Root layout, Google Fonts, metadata
│   ├── page.tsx                    # Main page — client component, assembles UI
│   ├── globals.css                 # Tailwind base + CSS variables
│   └── api/
│       └── triage/
│           └── route.ts            # POST /api/triage — API key lives here only
│
├── components/
│   ├── ConfigBar.tsx               # Model selector
│   ├── EmailInput.tsx              # Textarea + triage / process-all / clear buttons
│   ├── SampleList.tsx              # Sidebar with 5 sample emails
│   ├── ResultCard.tsx              # Renders loading, error, and success states
│   └── ui/
│       ├── Button.tsx              # Shared button — variant (primary/secondary/ghost) + size
│       └── Badge.tsx               # Coloured tag for categories and urgency levels
│
├── hooks/
│   ├── useTriage.ts                # Calls /api/triage, updates store — no fetch elsewhere
│   └── useTriageStore.ts           # Zustand store: results list, stats, selected model
│
├── lib/
│   ├── types.ts                    # Single source of truth for all TypeScript interfaces
│   ├── openai.ts                   # Server-only: OpenAI client, validation + retry
│   ├── demo.ts                     # Server-only: canned results for demo mode (no key)
│   ├── prompts.ts                  # System prompt isolated here for easy iteration
│   ├── samples.ts                  # 5 realistic messy sample emails
│   └── utils.ts                    # cn(), formatCost(), formatDuration(), extractSubject()
│
├── __tests__/
│   ├── utils.test.ts               # Unit tests for utility functions
│   ├── types.test.ts               # Unit tests for type utilities and constants
│   ├── openai.test.ts              # Unit tests for triage-result validation + normalisation
│   └── ResultCard.test.tsx         # Component tests: loading / error / success + copy button
│
├── .env.example                    # Documents required env vars — copy to .env.local
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Getting started

**Prerequisites:** Node.js 18+. An OpenAI API key is optional — without one, the app runs in [demo mode](#demo-mode).

```bash
git clone https://github.com/yourusername/inboxtriage.git
cd inboxtriage

npm install

npm run dev
# → http://localhost:3000   (runs in demo mode — no key needed)
```

To enable live, model-generated responses, add your key:

```bash
cp .env.example .env.local
# open .env.local and add your OPENAI_API_KEY, then restart the dev server
```

Get a key from [platform.openai.com](https://platform.openai.com/api-keys).

---

## Demo mode

The app runs with **zero configuration**. If no `OPENAI_API_KEY` is set, the triage endpoint returns hand-written sample results instead of calling the model — so the entire UI (classification, entity extraction, flags, draft replies, the copy button, the stats bar) can be explored without a paid API account.

A banner makes it clear when demo mode is active, and each of the five sample emails has a tailored result. Drop a real key into `.env.local` and the same code path switches to live model calls — no other changes needed. The fallback lives in `lib/demo.ts` and the switch happens in `app/api/triage/route.ts`.

---

## Scripts

```bash
npm run dev             # dev server with hot reload
npm run build           # production build
npm run start           # run production build locally
npm run test            # run all tests once
npm run test:watch      # tests in watch mode
npm run test:coverage   # coverage report
npm run type-check      # tsc --noEmit (no output, just type errors)
npm run lint            # eslint
npm run lint:fix        # eslint with auto-fix
npm run format          # prettier on everything
npm run validate        # type-check + lint + test — run this before pushing
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Optional | Your OpenAI API key. Read server-side only — never sent to the browser. If omitted, the app runs in demo mode. |
| `NEXT_PUBLIC_DEFAULT_MODEL` | No | Defaults to `gpt-4o-mini` |

---

## Deploying

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Add `OPENAI_API_KEY` in the Vercel dashboard under Settings → Environment Variables. Deployments are automatic on every `git push` if you connect your GitHub repo.

---

## Architecture notes

### API key security

The OpenAI API key is read exclusively in `lib/openai.ts` via `process.env.OPENAI_API_KEY`, which is only imported by the server route `app/api/triage/route.ts`. It is never passed to any client component, never included in any `NEXT_PUBLIC_` variable, and never referenced anywhere else. This is the correct production pattern — a plain React SPA cannot do this.

### Separation of concerns

Each layer has one job:

- `lib/types.ts` defines the shapes. Everything else imports from here.
- `lib/openai.ts` talks to the OpenAI API, validates the response, and retries on malformed output. Nothing else does.
- `hooks/useTriage.ts` calls the API route and updates state. Components don't call fetch.
- `components/` render state. They don't know where the data came from.

This makes it straightforward to swap the AI provider (only `lib/openai.ts` changes), add a new model (only `lib/types.ts` and `lib/openai.ts` change), or test components in isolation with mock data.

### Prompt reliability

Getting consistent JSON out of the model relies on three things working together:

1. OpenAI's JSON mode (`response_format: { type: "json_object" }`) guarantees syntactically valid JSON.
2. An explicit schema with a closed enum for `category` in the system prompt keeps the model inside the allowed values.
3. `validateTriageResult()` in `lib/openai.ts` enforces the contract at runtime — category and urgency must be in their enums, `confidence` is clamped to 0-100, and optional entity fields are normalised so the UI never hits `undefined`.

When validation fails (e.g. the model invents a category), `triageEmail()` retries once at a slightly higher temperature before surfacing a typed error — so a single bad generation doesn't become a user-facing failure.

### Model choice

`gpt-4o-mini` is the default — fast and inexpensive, which suits the high-volume, mostly-routine nature of an accounting inbox. `gpt-4o` is noticeably better on complex multi-part questions (entity conversions, estate questions, retirement planning) but costs more per email. Both are available in the UI selector — the right choice depends on email volume and complexity. The "est. cost" stat in the header uses the published per-token rates in `MODEL_META` (`lib/types.ts`).

---

## What's missing / next steps

- **CRM context** — the draft reply only knows what's in the email. A production version would inject the client's account history into the prompt before generating the reply.
- **Email client integration** — a Gmail Add-On or Outlook plugin would remove the copy-paste step entirely.
- **Streaming** — the draft reply currently appears all at once. Streaming it token-by-token would feel faster.
- **Routing rules** — auto-assign high-urgency items to specific staff members based on category.
- **Rate limiting** — the API route has no rate limiting, which is fine for a single-user tool but would need fixing before a multi-user deployment.
- **Persistence** — results live in memory only and clear on refresh. A production version would store triaged emails so staff can revisit them.

