# Deployment guide

Two-service deploy: **Railway** hosts the API + Postgres, **Netlify** hosts the static client.

Order matters — deploy the server first, get its URL, then deploy the client pointing at it. Finally, lock CORS to the client's URL.

---

## 1. Push to GitHub

```bash
git push origin main
```

Make sure neither `.env` is committed (both are in `.gitignore`). The committed `.env.example` files are the templates.

---

## 2. Server + Postgres on Railway

1. Go to https://railway.app, sign in with GitHub.
2. **New Project → Deploy from GitHub repo → `UC-BorrowBox`**.
3. Railway will try to build from the repo root. After it detects the project:
   - Open the service settings.
   - **Root Directory** → set to `server`.
   - **Build command** → leave blank (Railway uses `npm install`).
   - **Start command** → `npm start`.
4. **Add Postgres**: in the project view, click **+ New → Database → Add PostgreSQL**.
   - Railway auto-creates the database and exposes its credentials.
5. **Wire env vars**: open the *server* service → **Variables** tab.
   - `DATABASE_URL` → click **+ New Variable → Add Reference → Postgres → DATABASE_URL**. (Reference, not paste, so it stays in sync if the DB rotates.)
   - `NODE_ENV` → `production`
   - `JWT_SECRET` → paste a 48+ character random string. Generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
     ```
   - `SMTP_HOST` → `smtp.gmail.com`
   - `SMTP_PORT` → `587`
   - `SMTP_USER` → your Gmail address
   - `SMTP_PASS` → your Gmail App Password (no spaces)
   - `SMTP_FROM` → `"UC BorrowBox <your-gmail@gmail.com>"`
   - `CLIENT_ORIGIN` → **leave blank for now**, we'll fill this in after Netlify is up.
6. **Deploy.** Railway redeploys automatically on env var changes.
7. **Run migrations once.** In the service's **Settings → Service → "Run Command"** (or via Railway CLI):
   ```
   npm run migrate
   ```
   You should see `Applying 001_init.sql... Migrations complete.`
8. **Generate a public domain.** Service → **Settings → Networking → Generate Domain**. Note the URL, e.g. `ucbb-server-production.up.railway.app`. This is your **API base URL**.
9. **Smoke test:**
   ```bash
   curl https://YOUR-RAILWAY-URL/api/health
   # {"ok":true}
   ```

### Viewing the SQL tables

Three ways, easiest first:

- **Railway data browser.** Open the Postgres service → **Data** tab. You get a point-and-click view of every table — `users`, `listings`, `comments` — with column types, row counts, and inline editing. This is what you'll use 90% of the time.
- **Query tab.** Same service → **Query** tab. Run ad-hoc SQL like `SELECT id, email, verified FROM users ORDER BY id DESC;`.
- **`psql` from your terminal.** Install the Railway CLI (`brew install railway`), then:
  ```bash
  railway login
  railway link                # pick your project
  railway connect Postgres    # opens a psql shell against the live DB
  ```
  From the psql shell, useful commands:
  ```sql
  \dt                                  -- list all tables
  \d users                             -- describe the users table
  SELECT id, email, name, verified FROM users;
  SELECT COUNT(*) FROM listings;
  ```

---

## 3. Client on Netlify

1. Go to https://app.netlify.com, sign in with GitHub.
2. **Add new site → Import an existing project → GitHub → `UC-BorrowBox`**.
3. Netlify will read `netlify.toml` and pre-fill:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/dist`

   Leave them as-is.
4. **Set the env var** before the first build: click **Add environment variables** on the deploy setup screen.
   - `VITE_API_URL` → your Railway URL (no trailing slash), e.g. `https://ucbb-server-production.up.railway.app`
5. **Deploy.** Netlify builds and gives you a URL like `https://ucbb-xyz.netlify.app`.
6. (Optional) **Change the site name** under **Site configuration → Change site name** to something cleaner, e.g. `ucbb`. URL becomes `https://ucbb.netlify.app`.

---

## 4. Lock CORS on the server

Now that you have the Netlify URL, go back to Railway:

1. Open the server service → **Variables**.
2. Set `CLIENT_ORIGIN` → `https://ucbb.netlify.app` (no trailing slash, exact match).
3. Railway redeploys. The server now only accepts requests from your Netlify URL.

> If you ever add a custom domain, append it as a comma-separated value: `CLIENT_ORIGIN=https://ucbb.netlify.app,https://ucbb.com`.

---

## 5. End-to-end test on the live app

1. Open the Netlify URL.
2. Sign up with a real `@mail.utoronto.ca` address.
3. Check your inbox for the OTP, verify.
4. Post a test listing.
5. Open an incognito window, sign up as a second user, reply on the listing.
6. Confirm the first user got an email about the reply.
7. Visit `/settings` to confirm profile edit works.

If something fails, the logs are the first place to look:
- **Railway → service → Deployments → latest → View Logs** (server errors, email send failures).
- **Browser DevTools → Network tab** (CORS blocks show up here with very specific error messages).

---

## Cost expectations

- **Netlify free tier:** 100GB bandwidth/month, plenty for a portfolio app.
- **Railway:** $5/month of usage credit on the Hobby plan; a small Node + Postgres setup with no traffic runs maybe $3–4/month. Sleeps idle services if you go below limits.
- **Gmail SMTP:** free, ~500 emails/day cap. Fine for portfolio scale; swap to Postmark/SendGrid if it ever takes off.
