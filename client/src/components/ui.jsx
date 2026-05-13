import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// ─── Constants ────────────────────────────────────────────────────────────────

export const RESIDENCES = [
  { value: 'whitney',     label: 'Whitney Hall' },
  { value: 'sir_daniels', label: "Sir Daniel's Residence" },
  { value: 'morrison',    label: 'Morrison Residence' },
];

export const TERMS = [
  { value: 'summer',     label: 'Summer' },
  { value: 'fall_winter', label: 'Fall + Winter' },
];

export const LISTING_TYPES = [
  { value: 'borrow', label: 'Borrow', tagline: 'Does anyone have…' },
  { value: 'cobuy',  label: 'Co-buy',  tagline: 'Want to split the cost of…' },
  { value: 'offer',  label: 'Offer',   tagline: 'I have, willing to share…' },
];

export const residenceShort = (v) =>
  ({ whitney: 'Whitney', sir_daniels: "Sir Daniel's", morrison: 'Morrison' }[v] || v);

export const typeLabel = (v) =>
  LISTING_TYPES.find((t) => t.value === v)?.label || v;

// ─── NavBar ───────────────────────────────────────────────────────────────────

export function NavBar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-20 bg-[rgba(242,242,247,0.82)] backdrop-blur-md shadow-nav">
      <div className="max-w-3xl mx-auto px-4 h-11 grid grid-cols-3 items-center">
        {/* left — placeholder for back button on sub-pages */}
        <div className="flex justify-start" />

        {/* center — app title */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="text-headline font-semibold text-ink-900 tracking-[-0.4px]"
          >
            UC BorrowBox
          </Link>
        </div>

        {/* right — actions */}
        <div className="flex justify-end items-center gap-3">
          {user ? (
            <>
              <Link
                to="/new"
                aria-label="New listing"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#007aff] text-white active:opacity-70 transition"
              >
                <PlusIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/settings"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-ink-100 transition active:opacity-70"
                aria-label="Settings"
              >
                <span className="text-footnote font-semibold text-ink-700 leading-none">
                  {user.name[0].toUpperCase()}
                </span>
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="text-subhead text-[#007aff] font-medium active:opacity-70 transition"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Back button (for sub-pages) ──────────────────────────────────────────────

export function BackButton({ label = 'Back' }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(-1)}
      className="inline-flex items-center gap-0.5 text-[#007aff] text-subhead active:opacity-70 transition"
    >
      <ChevronLeftIcon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center px-5 h-11 rounded-ios text-body font-semibold transition active:opacity-70 disabled:opacity-40 disabled:active:opacity-40';
  const styles = {
    primary:   'bg-[#007aff] text-white',
    secondary: 'bg-ink-100 text-ink-900',
    ghost:     'text-[#007aff]',
    danger:    'bg-[rgba(255,59,48,0.12)] text-[#ff3b30]',
    destructive: 'bg-[#ff3b30] text-white',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── Form fields ──────────────────────────────────────────────────────────────

export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-4 rounded-ios bg-[#f2f2f7] text-ink-900 placeholder-ink-500
        text-body border border-transparent
        focus:bg-white focus:border-[#007aff] focus:border-opacity-60
        transition ${className}`}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-ios bg-[#f2f2f7] text-ink-900 placeholder-ink-500
        text-body border border-transparent
        focus:bg-white focus:border-[#007aff] focus:border-opacity-60
        transition resize-none ${className}`}
    />
  );
}

export function Select({ options, className = '', ...props }) {
  return (
    <select
      {...props}
      className={`w-full h-11 px-4 rounded-ios bg-[#f2f2f7] text-ink-900
        text-body border border-transparent
        focus:bg-white focus:border-[#007aff] focus:border-opacity-60
        transition ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '', as: As = 'div', ...props }) {
  return (
    <As
      {...props}
      className={`block bg-white rounded-card shadow-card transition active:opacity-80 ${className}`}
    >
      {children}
    </As>
  );
}

// ─── Pills / tags ─────────────────────────────────────────────────────────────

export function Pill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 h-5 rounded-full text-caption-1 font-medium ${className}`}>
      {children}
    </span>
  );
}

export function ResidencePill({ residence }) {
  const tone = {
    whitney:     'bg-[#EAF4FF] text-[#0071e3]',
    sir_daniels: 'bg-[#FFF3E0] text-[#c47f00]',
    morrison:    'bg-[#E8F8EE] text-[#248a3d]',
  }[residence] || 'bg-ink-100 text-ink-500';
  return <Pill className={tone}>{residenceShort(residence)}</Pill>;
}

export function TypePill({ type }) {
  const tone = {
    borrow: 'bg-[#EAF4FF] text-[#0071e3]',
    cobuy:  'bg-[#FFF3E0] text-[#c47f00]',
    offer:  'bg-[#E8F8EE] text-[#248a3d]',
  }[type] || 'bg-ink-100 text-ink-500';
  return <Pill className={tone}>{typeLabel(type)}</Pill>;
}

// ─── Page header (large-title style) ─────────────────────────────────────────

export function LargeTitle({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-title-1 text-ink-900">{title}</h1>
      {subtitle && <p className="text-subhead text-ink-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// ─── Section label (grouped list header) ─────────────────────────────────────

export function SectionLabel({ children }) {
  return (
    <p className="text-footnote font-medium text-ink-500 uppercase tracking-[0.6px] px-4 mb-1.5">
      {children}
    </p>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Hairline({ className = '' }) {
  return <div className={`h-px bg-ink-200 ${className}`} />;
}

// ─── Time helper ──────────────────────────────────────────────────────────────

export function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60)  return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const dd = Math.floor(h / 24);
  if (dd < 7)  return `${dd}d ago`;
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}
