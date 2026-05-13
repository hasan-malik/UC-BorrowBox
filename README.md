# UC BorrowBox

A small web app for UC residents (Whitney, Sir Daniel's, Morrison) to share, borrow, and co-buy stuff — toasters, salt, paper towels, whatever. Each listing is tagged with the poster's residence so you can prioritize your own building first.

## Stack
- **Client:** React (Vite) + Tailwind, iOS-minimal styling
- **Server:** Node.js + Express
- **DB:** Postgres (via Docker)
- **Auth:** email + password, gated to `utoronto.ca` / `mail.utoronto.ca`, verified by 6-digit OTP

## Listing types
- **Borrow** — "Does anyone have X I can use?"
- **Co-buy** — "Want to split the cost of X?"
- **Offer** — "I have X, willing to share."

Conversations happen in a comment thread under each listing.

---

## Run it locally

You need: Docker, Node 20+.

### 1. Start Postgres
```bash
docker compose up -d   # exposes Postgres on host port 5433
```

### 2. Server
```bash
cd server
cp .env.example .env       # edit JWT_SECRET; SMTP is optional in dev
npm install
npm run migrate            # creates tables
npm run dev                # http://localhost:4000
```

If you don't configure SMTP, signup OTP codes are **printed to the server console** — copy/paste them into the verify screen.

### 3. Client
```bash
cd client
npm install
npm run dev                # http://localhost:5173
```

Vite proxies `/api/*` to the server on `:4000`.

---

## Email / OTP

In dev, leave SMTP empty in `server/.env` and you'll see codes in the terminal like:

```
────────── DEV OTP ──────────
  To:   you@mail.utoronto.ca
  Code: 482910
─────────────────────────────
```

For real email, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` in `server/.env`. Any provider that speaks SMTP works (Gmail with an app password, SendGrid, Mailgun, Postmark, etc.).

---

## Project layout

```
.
├── docker-compose.yml          # Postgres
├── server/
│   └── src/
│       ├── index.js            # Express entry
│       ├── db.js               # pg pool
│       ├── auth.js             # JWT middleware
│       ├── email.js            # OTP send (with dev console fallback)
│       ├── migrate.js          # runs migrations/*.sql
│       ├── migrations/001_init.sql
│       └── routes/
│           ├── auth.js         # signup, verify, resend, login, me
│           ├── listings.js     # CRUD + filter by type/residence
│           └── comments.js     # comment thread per listing
└── client/
    └── src/
        ├── App.jsx
        ├── auth.jsx            # AuthProvider (token in localStorage)
        ├── api.js              # fetch wrapper
        ├── components/ui.jsx   # Button, Input, Card, Pill, NavBar
        └── pages/
            ├── Signup.jsx
            ├── Verify.jsx
            ├── Login.jsx
            ├── Home.jsx        # feed + filters
            ├── NewListing.jsx
            └── ListingDetail.jsx
```

---

## API

All endpoints are under `/api`. Auth via `Authorization: Bearer <token>` on routes marked `(auth)`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Create unverified account, send OTP |
| POST | `/auth/verify` | Verify OTP, return JWT |
| POST | `/auth/resend` | Resend OTP |
| POST | `/auth/login` | Sign in, return JWT |
| GET  | `/auth/me` | Current user *(auth)* |
| GET  | `/listings?type=&residence=&status=` | List listings |
| GET  | `/listings/:id` | One listing |
| POST | `/listings` | Create *(auth)* |
| PATCH| `/listings/:id` | Open/close *(auth, owner)* |
| DELETE| `/listings/:id` | Delete *(auth, owner)* |
| GET  | `/listings/:id/comments` | Thread |
| POST | `/listings/:id/comments` | Reply *(auth)* |
| DELETE | `/comments/:cid` | Delete *(auth, owner)* |
