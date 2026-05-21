// Demo data is identified by the `.demo@mail.utoronto.ca` email marker
// (see seed.js). When SHOW_DEMO_LISTINGS is unset or "false", queries that
// join the `users` table aliased as `u` should append demoUserFilter() to
// their WHERE clause to hide demo-authored rows. Flip the env var to "true"
// to restore demo content instantly — nothing is deleted.

export const showDemoListings = () =>
  String(process.env.SHOW_DEMO_LISTINGS || '').toLowerCase() === 'true';

// SQL fragment that excludes rows authored by demo users. Safe to inject:
// no user input, references the `u` alias that callers already use.
export const demoUserFilter = () =>
  showDemoListings()
    ? null
    : "lower(u.email) NOT LIKE '%.demo@mail.utoronto.ca'";
