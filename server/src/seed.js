import bcrypt from 'bcrypt';
import { pool } from './db.js';

// Demo data for showcasing the app. Re-runnable: clears previous demo rows
// (identified by the `.demo@` email marker) before re-inserting.

const users = [
  { email: 'priya.s.demo@mail.utoronto.ca',  name: 'Priya Sharma',   residence: 'whitney',     term: 'fall_winter' },
  { email: 'marcus.l.demo@mail.utoronto.ca', name: 'Marcus Lee',     residence: 'sir_daniels', term: 'fall_winter' },
  { email: 'aisha.k.demo@mail.utoronto.ca',  name: 'Aisha Khan',     residence: 'morrison',    term: 'summer' },
  { email: 'tom.b.demo@mail.utoronto.ca',    name: 'Tom Bennett',    residence: 'whitney',     term: 'summer' },
];

// author / listing indices refer to position in the arrays above / below.
const listings = [
  { author: 0, type: 'offer',  ago: 0.1,  title: 'Baked banana bread today — anyone want to try some?',
    description: 'Made a fresh loaf of banana bread this afternoon and there\'s plenty to go around. Knock on my door at Whitney if you\'d like a slice!' },
  { author: 3, type: 'offer',  ago: 0.6,  title: 'Loaf of bread expiring May 22 — anyone want to share?',
    description: 'I have a loaf of bread that expires May 22 and I won\'t finish it on my own. Happy to share with anyone who can use it before then.' },
  { author: 1, type: 'borrow', ago: 1.5,  title: 'Anyone have a toaster I could use?',
    description: 'Moved in without a toaster and really missing it. Would love to borrow one, or even share with a neighbour who has space for it in a common area.' },
  { author: 0, type: 'borrow', ago: 4,    title: 'Iron for a few hours tonight?',
    description: 'Presentation tomorrow and my shirt badly needs a press. Anyone near Whitney have an iron I could borrow this evening? Will return it the same night.' },
  { author: 1, type: 'cobuy',  ago: 3,    title: 'Costco run — split a bulk pack of paper towels?',
    description: 'Heading to Costco on Saturday. The 12-roll pack is way cheaper per roll than the convenience store. Looking for 2–3 people to split it with.' },
  { author: 2, type: 'offer',  ago: 8,    title: 'Free electric kettle — moving out',
    description: 'My lease ends this month. Good electric kettle, boils fast, works perfectly. First person to message can have it.' },
  { author: 3, type: 'borrow', ago: 20,   title: 'Vacuum for move-out cleaning',
    description: 'Need to vacuum my room before the final inspection. Anyone have one I could borrow for an hour or so?' },
  { author: 0, type: 'cobuy',  ago: 27,   title: 'Split a 10kg bag of basmati rice',
    description: 'Costco basmati is a great deal but 10kg is a lot for one person. Want to split it three ways?' },
  { author: 1, type: 'offer',  ago: 33,   title: 'Desk lamp, free to a good home',
    description: 'Extra desk lamp I no longer need. Warm light, adjustable arm. Free — just come grab it from Sir Daniel\'s.' },
  { author: 2, type: 'borrow', ago: 49,   title: 'Anyone have the ECO101 textbook?',
    description: 'Need the ECO101 textbook for about a week to finish an assignment. Happy to borrow rather than buy a copy.' },
  { author: 3, type: 'offer',  ago: 56,   title: 'About 15 spare hangers — free',
    description: 'Cleared out my closet and have a stack of spare hangers. Free, just message me to pick them up.' },
  { author: 2, type: 'cobuy',  ago: 71,   title: 'Co-buy a big jug of laundry detergent?',
    description: 'The large detergent jugs are much cheaper per load but heavy and pricey to buy solo. Anyone want to split one?' },
];

const comments = [
  { listing: 0, author: 2, body: 'Banana bread is the best — I\'ll definitely swing by, thank you!' },
  { listing: 3, author: 1, body: 'I\'ve got an iron on the 3rd floor of Sir Daniel\'s — a bit of a walk, but you\'re welcome to it.' },
  { listing: 3, author: 0, body: 'That works, thank you! I\'ll come by around 6.' },
  { listing: 4, author: 3, body: 'I\'m in — that pack lasts the whole term.' },
  { listing: 4, author: 2, body: 'Count me in for a share too.' },
  { listing: 9, author: 0, body: 'I have last year\'s edition if that\'s okay for your assignment?' },
];

async function run() {
  await pool.query("DELETE FROM users WHERE email LIKE '%.demo@mail.utoronto.ca'");

  const hash = await bcrypt.hash('demopass123', 10);
  const userIds = [];
  for (const u of users) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, residence, term, verified)
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id`,
      [u.email, hash, u.name, u.residence, u.term]
    );
    userIds.push(rows[0].id);
  }

  const listingIds = [];
  for (const l of listings) {
    const { rows } = await pool.query(
      `INSERT INTO listings (user_id, type, title, description, created_at)
       VALUES ($1, $2, $3, $4, NOW() - ($5 || ' hours')::interval) RETURNING id`,
      [userIds[l.author], l.type, l.title, l.description, String(l.ago)]
    );
    listingIds.push(rows[0].id);
  }

  for (const c of comments) {
    await pool.query(
      `INSERT INTO comments (listing_id, user_id, body) VALUES ($1, $2, $3)`,
      [listingIds[c.listing], userIds[c.author], c.body]
    );
  }

  console.log(`Seeded ${users.length} users, ${listings.length} listings, ${comments.length} comments.`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
