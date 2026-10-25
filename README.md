# HERTale

> **Tell your tale. Be heard.**

Women often wait years for a diagnosis because five minutes in a clinic isn't enough to explain months of symptoms. In a 2024 review of endometriosis studies, the average diagnostic delay was about 7 years, and women often reported feeling unheard by health professionals (Fryer et al., 2024; see Credits). **HERTale** lets her describe how she feels in her own words, finds the patterns, and turns them into a one-page report her doctor can read in seconds, shared with a single link or QR code.

Built for **recHERsion'26** (ACM-W, NITK Surathkal) | **Problem Statement 1: Women's Healthcare**

**Team:** Rinuvarshini (backend and AI), Deepika T (frontend), Mahalakshmi R(deployment and design)

| | |
|---|---|
| **Live app** | https://rechersion-26-one.vercel.app |
| **API health check** | https://hertale-api.onrender.com/api/health |
| **Demo video** | https://youtu.be/aDJE2NPa82A |
| **Presentation** | https://docs.google.com/presentation/d/1kr7nmHxPQ_hCxpcxr-DirHIujqN241cJ/edit?usp=sharing&ouid=108509436246560465549&rtpof=true&sd=true |
| **Repository** | https://github.com/Rinuvarshini/rechersion-26 |

**Try it:** sign in with `demo@rechersion.app` / `demo1234` to see about 4 months of synthetic data, or create your own account.

> The backend runs on a free tier. After a period of inactivity the very first request can take up to a minute while the server wakes up. If the first action seems slow, please wait a moment and try again.

---

## What HERTale does

1. **Log in plain language.** She types something like "bad cramps on my lower left side, 8 out of 10, slept only 4 hours." AI reads it and organises it into symptoms, severity, flow, mood and sleep.
2. **Review and edit before saving.** The understood details appear in an editable form. She can change any symptom, severity, flow, mood, sleep or note, and only then saves the log. If the AI cannot read her entry, a manual form opens instead, so logging never gets blocked.
3. **See her patterns.** A dashboard charts pain, sleep and flow over time.
4. **Doctor-ready report.** Transparent, rule-based pattern flags (irregular cycle length, recurring severe pain, frequent heavy flow, low average sleep, frequent fatigue, persistent low mood), a plain-language summary, and suggested questions to ask her doctor. It can be printed or saved as a PDF.
5. **Share safely.** A read-only link (also shown as a QR code) that **expires after 24 hours**. The doctor needs no account.
6. **Privacy by design.** Consent at signup, share links that expire, no email or account details on the doctor's view, and a clear not-a-diagnosis note on every report.

> **HERTale is not a diagnostic tool.** Flags are suggestions to discuss with a qualified doctor, and every report carries a disclaimer.

## How it works

```
Her words ──▶ AI extraction ──▶ She reviews and edits ──▶ Saved log (MongoDB)
                                                              │
                              Rule-based pattern analysis ◀───┘
                                          │
                       AI-written summary (template fallback)
                                          │
                  Report ──▶ 24-hour share link / QR ──▶ Doctor view
```

- **Rules decide, AI explains.** Pattern flags come from simple, auditable rules in `server/services/patterns.js`. The language model only turns the numbers into readable wording, and is instructed never to name conditions or recommend treatment.
- **Graceful fallback.** If every AI model is unavailable, the report is still generated from a template, and logging falls back to the manual form.
- **Resilient AI layer.** The server tries a chain of Gemini models with a timeout, so one busy model does not break the app. Every AI response is parsed and sanitised on the server before use.
- **She stays in control.** Nothing is saved until she saves it, and she can edit what the AI understood.
- **Safeguards.** Passwords hashed with bcrypt, JWT authentication, rate limiting on AI routes (15 requests per minute), restricted CORS, request size limits, expiring share links.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router, custom CSS [add the charts and QR libraries you use] |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| AI | Google Gemini API |
| Auth | JWT, bcrypt |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

## Repository structure

```
rechersion-26/
├── client/                  React app
│   └── src/
│       ├── pages/           Login, Signup, Log, Dashboard, Report, Doctor
│       ├── components/      Navbar, ShareCard
│       └── api.js           API helper
├── server/
│   ├── config/              database connection
│   ├── middleware/          JWT auth
│   ├── models/              User, Log, Report
│   ├── routes/              auth, logs, reports, me
│   ├── services/            llm.js (AI), patterns.js (rules)
│   ├── scripts/seed.js      demo data generator
│   └── server.js
└── docs/                    hand-off notes
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
LLM_MODEL=gemini-3.5-flash
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
node scripts/seed.js   # optional: creates the demo user with sample data
```

> Model names change over time. If the AI service returns a 404 or 503, set `LLM_MODEL` to another model your key supports (for example `gemini-flash-lite-latest`). The server also tries backup models automatically.

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

All demo data is **synthetic** and contains no real personal information.

## API overview

All routes are under `/api`. Authenticated routes need `Authorization: Bearer <token>`.

| Route | Purpose |
|---|---|
| `POST /auth/signup`, `POST /auth/login` | Create account, sign in |
| `POST /logs/parse` | Turn free text into a structured draft (not saved) |
| `POST /logs`, `GET /logs` | Save a log, list logs |
| `GET /logs/stats` | Chart data for the dashboard |
| `POST /reports/generate` | Build a report with pattern flags and summary |
| `GET /reports/latest` | Most recent report |
| `POST /reports/:id/share` | Create a 24-hour read-only link |
| `GET /reports/share/:token` | Public doctor view (no login) |
| `GET /me`, `DELETE /me/data`, `DELETE /me` | Profile and data deletion (backend API) |

## Privacy and responsible design

- Consent is required at signup.
- Shared links are read-only, expire after 24 hours, and contain no email or account identifiers.
- The demo uses only synthetic data.
- Reports never claim a diagnosis and always show a disclaimer.
- Data deletion is supported by the backend API (`DELETE /api/me/data`). An in-app button is planned as a next step.

## Limitations and next steps

- Pattern thresholds are simplified for a prototype and are **not clinically validated**.
- Data deletion and account controls are available through the API, but not yet in the interface.
- AI availability depends on the external model service, so a fallback keeps core features working.
- Next: voice input, a lab-report explainer, regional-language interface, offline-friendly mode, and clinician feedback on the report format.

## Credits and third-party resources

| Resource | Used for | Licence / terms |
|---|---|---|
| Google Gemini API | Symptom extraction and report wording | Google API terms |
| Express, Mongoose, cors, dotenv, jsonwebtoken, bcryptjs, express-rate-limit | Backend | MIT / ISC |
| MongoDB Atlas | Database hosting | MongoDB terms |
| Vercel, Render | Hosting | Platform terms |
| React, Vite, React Router [add chart and QR libraries] | Frontend | MIT |
| ACOG Committee Opinion No. 651, "Menstruation in Girls and Adolescents: Using the Menstrual Cycle as a Vital Sign," Obstet Gynecol 2015;126(6):e143-e146 | Basis for the 21-35 day adult cycle range in the irregular-cycle flag | Published guidance |
| NICE guideline NG88, "Heavy menstrual bleeding: assessment and management" (nice.org.uk/guidance/ng88) | Context for the heavy-flow flag | Published guidance |
| Fryer J, Mason-Jones AJ, Woodward A. "Understanding diagnostic delay for endometriosis: a scoping review using the social-ecological framework." Health Care for Women International, 2024 (preprint: doi.org/10.1101/2024.01.08.24300988) | Problem statistic: average diagnostic delay about 6.8 years (range 1.5 to 11.4) | Open access |
| De Corte P et al. "Time to Diagnose Endometriosis: Current Status, Challenges and Regional Characteristics - A Systematic Literature Review." 2024 (PMC11625652) | Supporting evidence on diagnostic delay | Open access |

Cycle-length thresholds follow ACOG's adult range (21 to 35 days). The heavy-flow, pain, sleep, fatigue and mood flags use simple counts of user-logged days chosen for this prototype. They are illustrative heuristics, not clinical criteria, and have not been clinically validated.

## Originality

All code in this repository was written by the team during recHERsion'26 (24 to 25 October 2026). Third-party libraries, services and references are listed above. No commits were made after the submission deadline.

---

*She imagines. She builds. She leads.*