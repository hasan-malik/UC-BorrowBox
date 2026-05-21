import { Link } from 'react-router-dom';
import {
  QuestionMarkCircleIcon,
  CurrencyDollarIcon,
  GiftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const FEATURES = [
  {
    icon: QuestionMarkCircleIcon,
    bg: '#EAF4FF',
    fg: '#007aff',
    title: 'Borrow',
    body: 'Need a toaster for one morning? Ask a neighbour, not Amazon.',
  },
  {
    icon: CurrencyDollarIcon,
    bg: '#FFF3E0',
    fg: '#c47f00',
    title: 'Co-buy',
    body: 'Split a bulk pack of paper towels or laundry pods with your floor.',
  },
  {
    icon: GiftIcon,
    bg: '#E8F8EE',
    fg: '#248a3d',
    title: 'Offer',
    body: "Pass on what you don't need. Someone on your floor probably does.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-[calc(100dvh-44px)]">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#EAF4FF] text-[#007aff] text-[12px] font-semibold px-3 h-6 rounded-full mb-8 tracking-[0.1px]">
          Whitney · Sir Daniel's · Morrison
        </div>

        <h1
          className="text-ink-900 font-black tracking-[-2.5px] mb-5"
          style={{ fontSize: 'clamp(40px, 9vw, 76px)', lineHeight: 1.02 }}
        >
          Share more.<br />Spend less.
        </h1>

        <p className="text-[18px] text-ink-500 leading-[1.6] max-w-[360px] mx-auto mb-10">
          The community platform for UC residence students — borrow, co-buy, and offer, right on your floor.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 h-12 rounded-ios bg-[#007aff] text-white text-[17px] font-semibold active:opacity-70 transition"
          >
            Get started
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            to="/browse"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 h-12 rounded-ios bg-white text-ink-900 text-[17px] font-semibold shadow-card active:opacity-70 transition"
          >
            Browse listings
          </Link>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-card shadow-card px-6 sm:px-8 py-10 text-center">
          <p className="text-[28px] font-bold tracking-[-0.5px] text-ink-900 leading-snug mb-2">
            Be part of UC Culture.
          </p>
          <p className="text-subhead text-ink-500 mb-7">
            Takes 30 seconds.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 h-11 rounded-ios bg-[#007aff] text-white text-body font-semibold active:opacity-70 transition"
          >
            Create account
          </Link>
          <p className="text-caption-1 text-ink-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#007aff]">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, bg, fg, title, body }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5">
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3.5"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-5 h-5" style={{ color: fg }} />
      </div>
      <p className="text-headline text-ink-900 mb-1">{title}</p>
      <p className="text-subhead text-ink-500 leading-normal">{body}</p>
    </div>
  );
}
