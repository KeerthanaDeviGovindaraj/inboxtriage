# InboxTriage

An AI tool that triages client emails for small accounting and bookkeeping firms. Paste an email, get a category, urgency level, extracted details, and a ready-to-send draft reply — powered by Claude.

---

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
| AI | Claude via Anthropic SDK | Reliable structured JSON output; haiku is fast and cheap for this use case |
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
│   ├── anthropic.ts                # Server-only: Anthropic client + output validation
│   ├── prompts.ts                  # System prompt isolated here for easy iteration
│   ├── samples.ts                  # 5 realistic messy sample emails
│   └── utils.ts                    # cn(), formatCost(), formatDuration(), extractSubject()
│
├── __tests__/
│   ├── utils.test.ts               # Unit tests for utility functions
│   ├── types.test.ts               # Unit tests for type utilities and constants
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

**Prerequisites:** Node.js 18+, an Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

```bash
git clone https://github.com/yourusername/inboxtriage.git
cd inboxtriage

npm install

cp .env.example .env.local
# open .env.local and add your ANTHROPIC_API_KEY

npm run dev
# → http://localhost:3000
```

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
| `ANTHROPIC_API_KEY` | ✅ | Your Anthropic API key. Read server-side only — never sent to the browser. |
| `NEXT_PUBLIC_DEFAULT_MODEL` | No | Defaults to `claude-haiku-4-5` |

---

## Deploying

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Add `ANTHROPIC_API_KEY` in the Vercel dashboard under Settings → Environment Variables. Deployments are automatic on every `git push` if you connect your GitHub repo.

---

## Architecture notes

### API key security

The Anthropic API key is read exclusively in `app/api/triage/route.ts` via `process.env.ANTHROPIC_API_KEY`. It is never passed to any client component, never included in any `NEXT_PUBLIC_` variable, and never referenced in any file outside `lib/anthropic.ts` and the route handler. This is the correct production pattern — a plain React SPA can't do this.

### Separation of concerns

Each layer has one job:

- `lib/types.ts` defines the shapes. Everything else imports from here.
- `lib/anthropic.ts` talks to the API and validates the response. Nothing else does.
- `hooks/useTriage.ts` calls the API route and updates state. Components don't call fetch.
- `components/` render state. They don't know where the data came from.

This makes it straightforward to swap the AI provider (only `lib/anthropic.ts` changes), add a new model (only `lib/types.ts` and `lib/anthropic.ts` change), or test components in isolation with mock data.

### Prompt reliability

Getting consistent JSON out of claude-haiku required three iterations:

1. `"respond in JSON"` → markdown-wrapped output ~30% of the time
2. `"return ONLY a JSON object"` → cleaner, but haiku sometimes invented categories not in the list
3. Explicit schema + closed enum for `category` + `"no markdown, no explanation"` at the end → ~97% clean output

The `validateTriageResult()` function in `lib/anthropic.ts` handles the remaining edge cases by throwing a typed error rather than letting malformed output silently propagate.

### Model choice

`claude-haiku-4-5` is the default. At roughly $0.001 per email it costs about $18/year at 50 emails/day. `claude-sonnet-4-5` is noticeably better on complex multi-part questions (entity conversions, estate questions, retirement planning) but costs ~15x more. Both are available in the UI — the right choice depends on email volume and complexity.

---

## What's missing / next steps

- **CRM context** — the draft reply only knows what's in the email. A production version would inject the client's account history into the prompt before generating the reply.
- **Email client integration** — a Gmail Add-On or Outlook plugin would remove the copy-paste step entirely.
- **Streaming** — the draft reply currently appears all at once. Streaming it token-by-token would feel faster.
- **Routing rules** — auto-assign high-urgency items to specific staff members based on category.
- **Retry logic** — occasional malformed JSON from the model is currently surfaced as an error. A simple retry would handle this transparently.
- **Rate limiting** — the API route has no rate limiting, which is fine for a single-user tool but would need fixing before a multi-user deployment.

