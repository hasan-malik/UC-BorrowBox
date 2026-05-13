import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import {
  Card, ResidencePill, TypePill, LargeTitle,
  LISTING_TYPES, RESIDENCES, timeAgo,
} from '../components/ui.jsx';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const TYPE_FILTERS = [{ value: '', label: 'All' }, ...LISTING_TYPES];
const RES_FILTERS  = [
  { value: '', label: 'All residences' },
  ...RESIDENCES.map((r) => ({ value: r.value, label: r.label })),
];

export default function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [residence, setResidence] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'open' });
    if (type)      params.set('type', type);
    if (residence) params.set('residence', residence);
    api(`/listings?${params}`)
      .then((d) => setListings(d.listings))
      .finally(() => setLoading(false));
  }, [type, residence]);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-10">
      <div className="flex items-end justify-between mb-2">
        <LargeTitle
          title="BorrowBox"
          subtitle="Share, borrow, and co-buy with UC residents."
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <SegmentedControl
          value={type}
          onChange={setType}
          options={TYPE_FILTERS.map((t) => ({ value: t.value, label: t.label }))}
        />
        <ResidenceDropdown value={residence} onChange={setResidence} />
      </div>

      {/* Feed */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-ink-200 border-t-[#007aff] animate-spin" />
        </div>
      )}

      {!loading && listings.length === 0 && (
        <EmptyState onNewListing={user ? () => nav('/new') : null} />
      )}

      {!loading && listings.length > 0 && (
        <div className="space-y-3">
          {listings.map((l) => <ListingRow key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}

function ListingRow({ listing: l }) {
  return (
    <Card as={Link} to={`/listings/${l.id}`} className="block p-4 no-underline">
      {/* tags + time */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <TypePill type={l.type} />
        <ResidencePill residence={l.user_residence} />
        <span className="text-caption-1 text-ink-500 ml-auto">{timeAgo(l.created_at)}</span>
      </div>

      {/* title */}
      <p className="text-headline text-ink-900 leading-snug">{l.title}</p>

      {/* description */}
      {l.description && (
        <p className="text-subhead text-ink-500 mt-1 line-clamp-2 leading-normal">
          {l.description}
        </p>
      )}

      {/* footer */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-ink-100">
        <span className="text-footnote text-ink-500">{l.user_name}</span>
        <div className="flex items-center gap-1 ml-auto text-ink-500">
          <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5" />
          <span className="text-footnote">{l.comment_count}</span>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ onNewListing }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-[#EAF4FF] flex items-center justify-center mb-5">
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8 text-[#007aff]" />
      </div>
      <p className="text-title-3 text-ink-900">Nothing yet</p>
      <p className="text-subhead text-ink-500 mt-1 max-w-[200px] leading-normal">
        Be the first to post a listing for UC residents.
      </p>
      {onNewListing && (
        <button
          onClick={onNewListing}
          className="mt-5 px-5 h-11 rounded-ios bg-[#007aff] text-white text-body font-semibold active:opacity-70 transition"
        >
          Post a listing
        </button>
      )}
    </div>
  );
}

function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="inline-flex p-0.5 bg-ink-100 rounded-[9px]">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value ?? 'all'}
            onClick={() => onChange(opt.value)}
            className={`px-3 h-7 rounded-[7px] text-footnote font-medium transition-all ${
              active
                ? 'bg-white text-ink-900 shadow-[0_1px_3px_rgba(0,0,0,0.10)]'
                : 'text-ink-500'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ResidenceDropdown({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 px-2.5 rounded-[9px] bg-ink-100 text-ink-900 text-footnote font-medium border-0"
    >
      {RES_FILTERS.map((r) => (
        <option key={r.value ?? 'all'} value={r.value}>{r.label}</option>
      ))}
    </select>
  );
}
