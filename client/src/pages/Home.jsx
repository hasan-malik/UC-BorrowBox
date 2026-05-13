import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import {
  Card, ResidencePill, TypePill, PageHeader,
  LISTING_TYPES, RESIDENCES, timeAgo,
} from '../components/ui.jsx';

const TYPE_FILTERS = [{ value: '', label: 'All' }, ...LISTING_TYPES.map((t) => ({ value: t.value, label: t.label }))];
const RES_FILTERS = [{ value: '', label: 'All residences' }, ...RESIDENCES.map((r) => ({ value: r.value, label: r.label }))];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [residence, setResidence] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'open' });
    if (type) params.set('type', type);
    if (residence) params.set('residence', residence);
    api(`/listings?${params.toString()}`)
      .then((d) => setListings(d.listings))
      .finally(() => setLoading(false));
  }, [type, residence]);

  const empty = !loading && listings.length === 0;

  return (
    <>
      <PageHeader
        title="UC BorrowBox"
        subtitle="Share, borrow, and co-buy with your fellow UC residents."
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <SegmentedControl value={type} onChange={setType} options={TYPE_FILTERS} />
        <ResidenceFilter value={residence} onChange={setResidence} />
      </div>

      {loading && <p className="text-ink-500">Loading…</p>}

      {empty && (
        <div className="text-center py-16 border border-dashed border-ink-200 rounded-ios">
          <p className="text-ink-900 font-medium text-[17px]">Nothing here yet.</p>
          <p className="text-ink-500 mt-1 text-[15px]">Be the first to post a listing.</p>
        </div>
      )}

      <div className="space-y-3">
        {listings.map((l) => (
          <Card as={Link} to={`/listings/${l.id}`} key={l.id}>
            <div className="flex items-center gap-2 mb-2">
              <TypePill type={l.type} />
              <ResidencePill residence={l.user_residence} />
              <span className="text-ink-500 text-[13px] ml-auto">{timeAgo(l.created_at)}</span>
            </div>
            <h3 className="text-ink-900 font-semibold text-[17px] leading-snug">{l.title}</h3>
            {l.description && (
              <p className="text-ink-700 text-[15px] mt-1 line-clamp-2">{l.description}</p>
            )}
            <div className="flex items-center gap-3 mt-3 text-[13px] text-ink-500">
              <span>{l.user_name}</span>
              <span>·</span>
              <span>{l.comment_count} {l.comment_count === 1 ? 'reply' : 'replies'}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function SegmentedControl({ value, onChange, options }) {
  return (
    <div className="inline-flex p-1 bg-ink-100 rounded-ios">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value || 'all'}
            onClick={() => onChange(opt.value)}
            className={`px-3 h-8 rounded-[10px] text-[13px] font-medium transition ${
              active ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ResidenceFilter({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-ios bg-ink-100 text-ink-900 text-[13px] font-medium border-0"
    >
      {RES_FILTERS.map((r) => (
        <option key={r.value || 'all'} value={r.value}>{r.label}</option>
      ))}
    </select>
  );
}
