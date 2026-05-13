import { Link } from 'react-router-dom';

export const RESIDENCES = [
  { value: 'whitney', label: 'Whitney Hall' },
  { value: 'sir_daniels', label: "Sir Daniel's Residence" },
  { value: 'morrison', label: 'Morrison Residence' },
];

export const TERMS = [
  { value: 'summer', label: 'Summer' },
  { value: 'fall_winter', label: 'Fall + Winter' },
];

export const LISTING_TYPES = [
  { value: 'borrow', label: 'Borrow', tagline: 'Does anyone have…' },
  { value: 'cobuy', label: 'Co-buy', tagline: 'Want to split the cost of…' },
  { value: 'offer', label: 'Offer', tagline: 'I have, willing to share…' },
];

export function residenceLabel(value) {
  return RESIDENCES.find((r) => r.value === value)?.label || value;
}

export function residenceShort(value) {
  return { whitney: 'Whitney', sir_daniels: "Sir Daniel's", morrison: 'Morrison' }[value] || value;
}

export function typeLabel(value) {
  return LISTING_TYPES.find((t) => t.value === value)?.label || value;
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center px-4 h-11 rounded-ios text-[15px] font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100';
  const styles = {
    primary: 'bg-ink-900 text-white hover:bg-black',
    secondary: 'bg-ink-100 text-ink-900 hover:bg-ink-200',
    ghost: 'text-ink-700 hover:text-ink-900',
    danger: 'bg-ink-100 text-red-600 hover:bg-red-50',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full h-11 px-4 rounded-ios bg-ink-100 text-ink-900 placeholder-ink-500 border border-transparent focus:bg-white focus:border-ink-300 transition ${
        props.className || ''
      }`}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-ios bg-ink-100 text-ink-900 placeholder-ink-500 border border-transparent focus:bg-white focus:border-ink-300 transition resize-none ${
        props.className || ''
      }`}
    />
  );
}

export function Select({ options, ...props }) {
  return (
    <select
      {...props}
      className={`w-full h-11 px-4 rounded-ios bg-ink-100 text-ink-900 border border-transparent focus:bg-white focus:border-ink-300 transition ${
        props.className || ''
      }`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function Pill({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 h-6 rounded-full text-[12px] font-medium bg-ink-100 text-ink-700 ${className}`}
    >
      {children}
    </span>
  );
}

export function ResidencePill({ residence }) {
  const tone = {
    whitney: 'bg-blue-50 text-blue-700',
    sir_daniels: 'bg-amber-50 text-amber-800',
    morrison: 'bg-emerald-50 text-emerald-700',
  }[residence] || 'bg-ink-100 text-ink-700';
  return <Pill className={tone}>{residenceShort(residence)}</Pill>;
}

export function TypePill({ type }) {
  const tone = {
    borrow: 'bg-ink-100 text-ink-700',
    cobuy:  'bg-ink-100 text-ink-700',
    offer:  'bg-ink-100 text-ink-700',
  }[type];
  return <Pill className={tone}>{typeLabel(type)}</Pill>;
}

export function Card({ children, className = '', as: As = 'div', ...props }) {
  return (
    <As
      {...props}
      className={`block bg-white border border-ink-200 rounded-ios p-5 transition hover:border-ink-300 ${className}`}
    >
      {children}
    </As>
  );
}

export function PageHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-ink-500 mt-1 text-[15px]">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function NavBar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-ink-200">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-[17px] font-semibold tracking-tight text-ink-900">
          UC BorrowBox
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/new">
                <Button variant="primary" className="h-9 px-3 text-[14px]">New</Button>
              </Link>
              <button
                onClick={onLogout}
                className="text-ink-500 hover:text-ink-900 text-[14px] px-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-ink-700 hover:text-ink-900 text-[14px] px-2">Sign in</Link>
              <Link to="/signup">
                <Button variant="primary" className="h-9 px-3 text-[14px]">Sign up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd}d ago`;
  return d.toLocaleDateString();
}
