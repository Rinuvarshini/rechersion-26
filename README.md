# HERTale

> **Tell your tale. Be heard.**

Women often wait years for a diagnosis because five minutes in a clinic isn't enough to explain months of symptoms. In a 2024 review of endometriosis studies, the average diagnostic delay was about 7 years, and women often reported feeling unheard by health professionals (Fryer et al., 2024; see Credits). **HERTale** lets her describe how she feels in her own words, finds the patterns, and turns them into a one-page report her doctor can read in seconds, shared with a single scan.

Built for **recHERsion'26** (ACM-W, NITK Surathkal) | **Problem Statement 1: Women's Healthcare**

**Team:** [Rinuvarshini](backend and AI), [Deepika T] (frontend), [Mahalakshmi R] (deployment and design)
**Live demo:** [link] | **Demo video:** [link] | **Presentation:** [link]

---

## What HERTale does

1. **Log in plain language.** She types (or speaks) something like "bad cramps on my left side, 8 out of 10, slept 4 hours." AI turns it into structured data, in any language, and she **confirms or edits it before anything is saved**.
2. **See her patterns.** A dashboard charts pain, sleep and flow over time.
3. **Doctor-ready report.** Transparent, rule-based pattern flags (irregular cycle length, recurring severe pain, frequent heavy flow, low sleep, frequent fatigue, persistent low mood), an AI-written plain-language summary, and suggested questions to ask her doctor.
4. **Share safely.** A read-only link or QR code that **expires after 24 hours**. She decides when to create it.
5. **Privacy controls.** Consent at signup, and one-click deletion of all her data (or her whole account).

> **HERTale is not a diagnostic tool.** Flags are suggestions to discuss with a qualified doctor, and every report carries a disclaimer.

## How it works

- **Rules decide, AI explains.** Pattern flags come from simple, auditable rules in `server/services/patterns.js`. The language model only turns the numbers into readable wording, and is instructed never to name conditions or recommend treatment.
- **Graceful fallback.** If the AI service is unavailable, the report is still generated from a template.
- **She stays in control.** Parsed symptoms are a draft until she confirms them.
- **Output is validated.** Every AI response is parsed and sanitised on the server before use.
- **Safeguards.** Passwords hashed with bcrypt, JWT authentication, rate limiting on the AI routes, restricted CORS, request size limits, expiring share links.

```
Her words ──▶ AI extraction ──▶ She confirms ──▶ Logs (MongoDB)
                                                      │
                          Rule-based pattern analysis ◀┘
                                      │
                    AI summary (with template fallback)
                                      │
                 Report ──▶ 24-hour share link / QR ──▶ Doctor view
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts [adjust to what you used] |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| AI | Google Gemini API |
| Auth | JWT, bcrypt |
| Hosting | [Vercel (frontend), Render (backend)] |

## Repository structure

```
rechersion-26/
├── client/                  React app
├── server/
│   ├── config/              database connection
│   ├── middleware/          JWT auth
│   ├── models/              User, Log, Report
│   ├── routes/              auth, logs, reports, me
│   ├── services/            llm.js (AI), patterns.js (rules)
│   ├── scripts/seed.js      demo data generator
│   └── server.js
└── docs/                    API and hand-off notes
```

## Run locally

**Backend**

```bash
git clone https://github.com/Rinuvarshini/rechersion-26.git
cd rechersion-26/server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_string
LLM_API_KEY=your_gemini_api_key
LLM_MODEL=gemini-3.8-flash
CLIENT_URL=http://localhost:5173
```

Start the server, and optionally load demo data:

```bash
npm run dev
node scripts/seed.js
```

> Model names change over time. If you get a 404 from the AI service, list the models your key can use and set `LLM_MODEL` to one that supports `generateContent` (for example `gemini-flash-latest`).

**Frontend**

```bash
cd client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev
```

**Demo account** (after running the seed script): `demo@rechersion.app` / `demo1234`. All demo data is **synthetic** and contains no real personal information.

## API overview

All routes are under `/api`. Authenticated routes need `Authorization: Bearer <token>`.

| Route | Purpose |
|---|---|
| `POST /auth/signup`, `POST /auth/login` | Create account, sign in |
| `POST /logs/parse` | Turn free text into a structured draft (not saved) |
| `POST /logs`, `GET /logs` | Save a confirmed log, list logs |
| `GET /logs/stats` | Chart data for the dashboard |
| `POST /reports/generate` | Build a report with pattern flags and summary |
| `GET /reports/latest` | Most recent report |
| `POST /reports/:id/share` | Create a 24-hour read-only link |
| `GET /reports/share/:token` | Public doctor view (no login) |
| `GET /me`, `DELETE /me/data`, `DELETE /me` | Profile, delete her data, delete her account |

## Privacy and responsible design

- Explicit consent is required at signup.
- She can delete all her data at any time, which also invalidates any shared links.
- Shared links are read-only, expire after 24 hours, and contain no email or account identifiers.
- The demo uses only synthetic data.
- Reports never claim a diagnosis, and always show a disclaimer.

## Limitations and next steps

- Cycle-length thresholds follow ACOG's adult range (21-35 days). The heavy-flow, pain, sleep, fatigue and mood flags use simple counts of user-logged days chosen for this prototype. They are illustrative heuristics, not clinical criteria, and have not been clinically validated.
- Voice input depends on browser support (best in Chrome or Edge).
- Next: lab-report explainer, offline-friendly mode, regional-language interface, and clinician feedback on the report format.

## Credits and third-party resources

| Resource | Used for | Licence / terms |
|---|---|---|
| Google Gemini API | Symptom extraction and report wording | Google API terms |
| Express, Mongoose, ... | Backend | MIT / ISC |
| MongoDB Atlas | Database hosting | MongoDB terms |
| React, Vite, Tailwind CSS, Recharts | Frontend | MIT |
| [qrcode.react, jsPDF or similar...] | [QR code, PDF export, UI] | [licence] |
| ACOG Committee Opinion No. 651, ... | Basis for the 21-35 day ... | Published guidance |
| NICE guideline NG88, ... | Context for the heavy-flow flag ... | Published guidance |
| Fryer J, Mason-Jones AJ, Woodward A. ... | Problem statistic: ... | Open access |
| De Corte P et al. ... | Supporting evidence on diagnostic delay | Open access |

## Originality

All code in this repository was written by the team during recHERsion'26 (24 to 25 October 2026). Third-party libraries and services are listed above. No commits were made after the submission deadline.

---

*She imagines. She builds. She leads.*