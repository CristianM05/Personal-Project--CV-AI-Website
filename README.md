## AI Portfolio Website with Persona-based Chatbot

This is a recruiter-friendly portfolio website with Projects, Competences, Evidence, and a persona-based **“Ask my CV”** chatbot that answers in first person as the developer.

The chatbot reads from a structured in-memory knowledge base (bio, projects, competences, evidence, goals) and returns answers plus citations that the UI displays as references.

### Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui components

### Run locally

1) Install dependencies

```bash
npm install
```

2) Start dev server

```bash
npm run dev
```

3) Open the app in your browser:

- `http://localhost:3000`

### Key pages

- `/` – Home overview (hero, competences, projects, evidence).
- `/projects` – Full projects list with tech, role, and linked evidence.
- `/competences` – Structured view of competence areas and skills.
- `/evidence` – Searchable list of evidence items (reports, diagrams, links).
- `/chat` – Dedicated chat page for the virtual CV chatbot.

The slide-over **Ask my CV** button in the header also opens the same chatbot from any page.

### Chatbot behavior and knowledge base

- The chat API is implemented in `app/api/chat/route.ts` and uses `lib/chat-engine.ts`.
- Structured knowledge (projects, competences, evidence, and the developer profile) lives in `lib/data.ts`.
- Responses are:
  - Written **in first person** as the developer.
  - Grounded in the structured knowledge (projects, skills, evidence).
  - Returned as `{ answer: string, citations: { title: string; url?: string }[] }`.

To update the persona or knowledge:

- Edit the `developerProfile` object in `lib/data.ts` to change bio, strengths, learning goals, and links.
- Edit the `seedProjects` and `seedEvidence` arrays in `lib/data.ts` to change portfolio content.

### Connecting a real AI model (optional)

Right now `lib/chat-engine.ts` uses rule-based logic over the local knowledge base. To plug in a real LLM later:

1) Call your provider from `generateChatResponse` with a prompt that includes:
   - System instruction (act as the developer, first person only).
   - Serialized `developerProfile`, relevant projects, competences, and evidence.
   - The user’s question.
2) Keep the same return shape:

```ts
{ answer: string, citations: { title: string; url?: string }[] }
```

This keeps the frontend and overall behavior unchanged while upgrading the model behind the scenes.

### Local voice synthesis (optional, fully local)

The chat UI is wired for local TTS through `app/api/tts/route.ts`.

- Frontend sends assistant text to `/api/tts`.
- The Next.js route forwards that text to a local TTS server.
- The route returns playable audio bytes to the browser.

Set this environment variable to match your local engine:

```bash
LOCAL_TTS_URL=http://localhost:5002/tts
```

The endpoint is flexible and accepts either:

- Direct audio response (`audio/wav`, `audio/mpeg`, etc.).
- JSON response containing an audio URL (`audioUrl`, `url`, `path`).
- JSON response containing base64 audio (`audioBase64`, `base64`, `audio`).
