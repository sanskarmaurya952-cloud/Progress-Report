# ALPHA++ (Progress Report)

> **Compete Today. Grow Every Day.**

ALPHA++ (Progress Report) is a student progress and collaboration platform where students track their coding progress, compete on leaderboards, share academic resources, publish research, provide constructive suggestions, and discover hackathons and events.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or later (v24.13.0 verified)
- **npm**: v9.0.0 or later (v11.19.1 verified)
- **PostgreSQL**: v14 or later (PostgreSQL 18 verified)
- Modern web browser (Chrome, Edge, Firefox, Safari)

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide React, React Router v7
- **Backend**: Node.js, Express, TypeScript, REST architecture
- **Database & ORM**: PostgreSQL, Prisma ORM with migrations, foreign keys, indexes, and unique constraints
- **Security & Validation**: Zod, Argon2id password hashing, HttpOnly session cookies, Helmet security headers, Express rate limiting, Multer PDF validation, XSS sanitization

---

## 3. Project Architecture

```
Uplivo/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components (Button, Input, Card, Modal, etc.)
│   │   │   └── ui/              # Atom/molecule UI library
│   │   ├── context/             # AuthContext (session, login, register, logout)
│   │   ├── lib/                 # apiFetch client with cookie support
│   │   ├── pages/               # Application pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LeaderboardPage.tsx
│   │   │   ├── ProgressPage.tsx
│   │   │   ├── AcademicsPage.tsx
│   │   │   ├── ResearchPage.tsx
│   │   │   ├── ResearchDetailPage.tsx
│   │   │   ├── HackathonsPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   └── types/               # TypeScript interfaces
│   ├── public/                  # Static assets & SVG logo
│   └── vite.config.ts           # Vite bundler & API proxy configuration
├── server/                      # Express backend
│   ├── prisma/                  # Prisma schema & migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── lib/                 # Prisma singleton & Argon2id auth utilities
│   │   ├── middleware/          # authenticateUser, Zod validateBody/Query/Params
│   │   ├── routes/              # Modular REST routes (/auth, /profile, /dashboard, etc.)
│   │   ├── services/            # LeetCode sync, Leaderboard, Progress analytics
│   │   ├── utils/               # Asia/Kolkata timezone normalization & HTML sanitize
│   │   └── validators/          # Zod validation schemas
│   └── uploads/                 # Local filesystem PDF uploads storage
├── .env.example                 # Environment variables template
└── README.md                    # Project documentation
```

---

## 4. Environment Variables

Create `.env` in the root directory (and/or `server/.env`):

```bash
# PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/Uplivo"

# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Session Security
SESSION_SECRET="a-long-random-string-at-least-32-characters"

# Persistent File Storage
UPLOADS_DIR=./uploads
```

---

## 5. Database Setup & Migrations

1. Ensure PostgreSQL is running on `localhost:5432`.
2. Create the database (if not created):
   ```sql
   CREATE DATABASE "Uplivo";
   ```
3. Run Prisma migrations from the `server/` directory:
   ```bash
   cd server
   npx prisma migrate dev --name init
   npx prisma generate
   ```

### Database Schema Overview
- **`User`**: Account and profile info, hashed credentials, academic affiliation, LinkedIn/LeetCode URLs.
- **`Session`**: HttpOnly cookie-bound persistent sessions with 7-day expiration.
- **`CodingProblemSolve`**: Verified problem solves with composite uniqueness `(userId, provider, problemId)` preventing score inflation, with normalized `solveDate` in Asia/Kolkata timezone.
- **`CodingProgressSync`**: Audit logs of synchronization runs, status, and error details.
- **`AcademicResource`**: Metadata for uploaded academic documents (PDFs), associated with authenticated uploader.
- **`ResearchPost`**: Published academic research papers with category, abstract, content, and reference URLs.
- **`ResearchComment`**: Peer suggestions and constructive feedback attached to research posts.
- **`HackathonEvent`**: Community hackathons and events with dates, deadlines, mode (online/offline), and verified external links.

---

## 6. Running the Application

### Development Mode

Run backend (from `server/` directory):
```bash
cd server
npm run dev
```
Backend runs at `http://localhost:3001` with API at `http://localhost:3001/api/v1`.

Run frontend (from `client/` directory):
```bash
cd client
npm run dev
```
Frontend runs at `http://localhost:5173`.

### Production Build

1. Build backend:
   ```bash
   cd server
   npm run build
   npm start
   ```

2. Build frontend:
   ```bash
   cd client
   npm run build
   npm run preview
   ```

---

## 7. Testing & Verification

Run automated backend unit tests (Vitest):
```bash
cd server
npm test
```
Tests cover:
- HTML sanitization and entity escaping
- Asia/Kolkata timezone conversion and day boundaries
- Zod registration and password complexity rules
- LeetCode username parsing and URL extraction

Run live end-to-end verification (requires running backend):
```bash
node "scratch/live_verification.mjs"
```
Verifies all 24 critical paths:
1. Health check
2. Registration rejection on invalid input
3. Valid registration
4. Duplicate email rejection
5. Second user registration
6. Invalid password login rejection
7. Active session verification (`/auth/me`)
8. Unauthenticated access rejection
9. Authorized dashboard data feed
10. Profile editing & persistence
11. Public profile privacy (email hidden to others)
12. Academic PDF upload with Multer validation
13. Academic resource search
14. Academic resource binary download
15. Unauthorized resource deletion prevention
16. Research post publishing
17. Research constructive comments
18. Unauthorized comment deletion prevention
19. Hackathon event publishing
20. Hackathon event listing & filtering
21. Leaderboard separation (Daily vs Overall)
22. Progress analytics & streak calculation
23. Logout & session destruction
24. Post-logout rejection

---

## 8. LeetCode Integration

### Architecture
- Uplivo connects to LeetCode's public GraphQL endpoint (`https://leetcode.com/graphql`) server-side with appropriate headers (`User-Agent`, `Referer`).
- **Total Solved**: Extracted from `matchedUser.submitStats.acSubmissionNum`.
- **Daily Solved History**: Sourced from `recentAcSubmissionList` containing individual accepted submissions with timestamps.
- **Timezone Normalization**: Solves are mapped to date strings in `Asia/Kolkata` (`YYYY-MM-DD`).
- **Deduplication**: Enforced at the database level by a composite unique constraint on `(userId, provider, problemId)`. Duplicate submissions of the same problem do not increment counts.
- **Provider Abstraction**: Provider logic in `src/services/leetcode.service.ts` is decoupled from leaderboard queries in `src/services/leaderboard.service.ts`, allowing alternative providers to be added without modifying leaderboard mechanics.

### Known Limitations
- LeetCode's internal GraphQL endpoint is undocumented and subject to Cloudflare edge rate limiting.
- Synchronizations are queued with error handling and backoff; failures log safe error messages in `CodingProgressSync` without crashing the platform.
- When an external profile is unreachable or invalid, Uplivo displays a clear sync status indicator rather than fabricating numbers.

---

## 9. Academic File Storage

- Document binaries are stored persistently in the directory specified by `UPLOADS_DIR` (`server/uploads/` by default).
- File uploads are restricted to PDF documents (`.pdf`, `application/pdf`) up to 10MB.
- File names are sanitized with random hex prefixes and timestamps (`Date.now()-hex-basename.pdf`) to prevent path traversal or overwrites.
- Downloads are served via authenticated streaming with proper `Content-Disposition: attachment` headers.

---

## 10. Security Implementation Summary

- **Passwords**: Hashed with Argon2id (`argon2` package). Plaintext passwords are never stored or logged.
- **Sessions**: Stored in PostgreSQL with crypto-random 64-byte tokens. Transmitted via `HttpOnly`, `SameSite=Lax` cookies.
- **Headers**: Configured with `helmet` including `crossOriginResourcePolicy`.
- **Rate Limiting**: Tiered with `express-rate-limit` (100 req/15min general in prod, 10 req/15min on auth endpoints).
- **Data Validation**: Strict Zod schemas on body, params, and queries across all endpoints.
- **XSS & Content**: HTML sanitization and escaping on all user-submitted text.
- **Ownership Verification**: Server-side user identity verification on all updates and deletions for profiles, academic documents, research papers, comments, and hackathon events.
