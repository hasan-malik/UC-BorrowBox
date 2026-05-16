# UC BorrowBox

A web app for University College residents at the University of Toronto (Whitney Hall, Sir Daniel's, Morrison) to **share**, **borrow**, and **co-buy** household stuff — toasters, salt, paper towels, whatever. Each listing is tagged with the poster's residence so you can prioritize your own building first.

> Built end-to-end: React frontend, Node/Express API, Postgres, JWT auth, email-OTP verification gated to `utoronto.ca` accounts.

<img width="1470" height="837" alt="Screenshot 2026-05-16 at 6 15 02 am" src="https://github.com/user-attachments/assets/b89a4129-9997-4f98-84c4-99f53ba2062c" />
---

## Features

- **`utoronto.ca`-gated signup** with 6-digit OTP email verification (10-minute expiry)
- **Three listing types** with distinct visual treatment:
  - **Borrow** — "Does anyone have X I can use?"
  - **Co-buy** — "Want to split the cost of X?"
  - **Offer** — "I have X, willing to share."
- **Comment threads** under each listing for back-and-forth
- **Residence + type filters** on the feed
- **Email notifications** for account creation, sign-in, new listing posted, and replies to your listing
- **Settings page** to update residence / term, with a profile snapshot
- **iOS-inspired UI** — system blue, SF-style type scale, grouped lists, hairline dividers, subtle shadows

<img width="1470" height="834" alt="Screenshot 2026-05-16 at 6 15 29 am" src="https://github.com/user-attachments/assets/2036c853-e1dd-4b9d-b786-e13162a0afac" />
<img width="1470" height="834" alt="Screenshot 2026-05-16 at 6 15 12 am" src="https://github.com/user-attachments/assets/b3c7678d-5aff-489b-a9fc-8f0d4f98ddf1" />
---

## Stack

| Layer | Tech |
| --- | --- |
| Client | React 18, Vite, React Router 6, Tailwind CSS |
| Server | Node 20, Express, JWT, bcrypt, nodemailer |
| DB     | Postgres 15 |
| Hosting | Netlify (client) · Railway (server + Postgres) |

---

## Run it locally

You need: Docker, Node 20+.

### 1. Start Postgres
```bash
docker compose up -d   # Postgres on host port 5433
```

### 2. Server
```bash
cd server
cp .env.example .env       # set JWT_SECRET; SMTP optional in dev
npm install
npm run migrate            # create tables
npm run dev                # http://localhost:4000
```

If you don't configure SMTP, signup OTPs are **printed to the server console** — copy/paste them into the verify screen.

### 3. Client
```bash
cd client
npm install
npm run dev                # http://localhost:5173
```

Vite proxies `/api/*` to `localhost:4000`, so no client env vars are needed in dev.

---

## Deploying

The app is split into two services. See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full walkthrough.

**TL;DR**
- **Server + Postgres → Railway.** Connect the GitHub repo, point Railway at the `server/` directory, attach a Postgres plugin, set env vars, run migrations once.
- **Client → Netlify.** Connect the GitHub repo, Netlify reads `netlify.toml` for build settings, set `VITE_API_URL` to the Railway URL.
- **Wire CORS** by setting `CLIENT_ORIGIN` on Railway to the Netlify URL.

---

## Project layout

```
.
├── docker-compose.yml          # Local Postgres
├── netlify.toml                # Netlify build config (base=client, publish=client/dist)
├── client/
│   ├── public/_redirects       # SPA fallback for React Router on Netlify
│   └── src/
│       ├── App.jsx
│       ├── auth.jsx            # AuthProvider (token in localStorage)
│       ├── api.js              # fetch wrapper, reads VITE_API_URL in prod
│       ├── components/ui.jsx   # Button, Input, Card, Pill, NavBar, …
│       └── pages/
│           ├── Landing.jsx
│           ├── Signup.jsx · Verify.jsx · Login.jsx
│           ├── Home.jsx        # feed + filters
│           ├── NewListing.jsx
│           ├── ListingDetail.jsx
│           └── Settings.jsx
└── server/
    └── src/
        ├── index.js            # Express entry, CORS via CLIENT_ORIGIN
        ├── db.js               # pg Pool, SSL in prod
        ├── auth.js             # JWT middleware
        ├── email.js            # nodemailer + console fallback
        ├── migrate.js          # runs migrations/*.sql
        ├── migrations/001_init.sql
        └── routes/
            ├── auth.js         # signup, verify, resend, login, me, patch me
            ├── listings.js     # CRUD + filter by type/residence
            └── comments.js     # comment threads
```

---

## API

All endpoints are under `/api`. Auth via `Authorization: Bearer <token>` on routes marked *(auth)*.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/signup` | Create unverified account, send OTP |
| POST | `/auth/verify` | Verify OTP, return JWT |
| POST | `/auth/resend` | Resend OTP |
| POST | `/auth/login` | Sign in, return JWT |
| GET  | `/auth/me` | Current user *(auth)* |
| PATCH| `/auth/me` | Update residence/term *(auth)* |
| GET  | `/listings?type=&residence=&status=` | List listings |
| GET  | `/listings/:id` | One listing |
| POST | `/listings` | Create *(auth)* |
| PATCH| `/listings/:id` | Open/close *(auth, owner)* |
| DELETE| `/listings/:id` | Delete *(auth, owner)* |
| GET  | `/listings/:id/comments` | Thread |
| POST | `/listings/:id/comments` | Reply *(auth)* |
| DELETE | `/comments/:cid` | Delete *(auth, owner)* |

---

## What I learned building this

- Email deliverability: tried Resend's free tier first, but their `onboarding@resend.dev` sandbox only delivers to the account owner's address. Switched to Gmail SMTP via an App Password — works for any recipient and required no DNS setup.
- iOS-style design tokens: porting Apple's type scale (`text-title-1`, `text-subhead`, etc.) and system colours into a Tailwind config makes pages composable without one-off magic numbers.
- Production hardening checklist for a "real" deploy: locking down CORS, enabling SSL on the Postgres connection, replacing dev placeholders for secrets, gating routes via JWT middleware, and making the API base URL configurable per environment.

---

## Roadmap

- [ ] Image uploads for listings (S3 / Cloudinary)
- [ ] Push notifications via web push (in addition to email)
- [ ] Direct messages, separate from public listing comments
- [ ] Listing search by keyword
