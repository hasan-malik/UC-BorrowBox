import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Button, Input, Textarea, SectionLabel, LISTING_TYPES } from '../components/ui.jsx';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import {
  QuestionMarkCircleIcon,
  CurrencyDollarIcon,
  GiftIcon,
} from '@heroicons/react/24/outline';

const TYPE_ICONS = {
  borrow: QuestionMarkCircleIcon,
  cobuy:  CurrencyDollarIcon,
  offer:  GiftIcon,
};

const TYPE_COLORS = {
  borrow: { bg: '#EAF4FF', icon: '#007aff' },
  cobuy:  { bg: '#FFF3E0', icon: '#c47f00' },
  offer:  { bg: '#E8F8EE', icon: '#248a3d' },
};

export default function NewListing() {
  const nav = useNavigate();
  const [type, setType]               = useState('borrow');
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { listing } = await api('/listings', {
        method: 'POST',
        auth: true,
        body: { type, title, description },
      });
      nav(`/listings/${listing.id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const placeholder = {
    borrow: 'e.g. Anyone have a toaster I can use?',
    cobuy:  'e.g. Split a $20 box of paper towels?',
    offer:  'e.g. I have a kettle, happy to share',
  }[type];

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-12">
      {/* Back */}
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-0.5 text-[#007aff] text-subhead mb-4 active:opacity-70 transition"
      >
        <ChevronLeft />
        Browse
      </button>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Type picker */}
        <div>
          <SectionLabel>Type</SectionLabel>
          <div className="bg-white rounded-card shadow-card divide-y divide-ink-100">
            {LISTING_TYPES.map((t) => {
              const active = type === t.value;
              const Icon = TYPE_ICONS[t.value];
              const { bg, icon } = TYPE_COLORS[t.value];
              return (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition active:bg-ink-50 first:rounded-t-card last:rounded-b-card"
                >
                  <div
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: icon }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body font-semibold text-ink-900">{t.label}</p>
                    <p className="text-footnote text-ink-500">{t.tagline}</p>
                  </div>
                  {active && (
                    <CheckCircleIcon className="w-5 h-5 text-[#007aff] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <SectionLabel>Title</SectionLabel>
          <div className="bg-white rounded-card shadow-card px-4 py-1">
            <Input
              placeholder={placeholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              required
              className="bg-transparent focus:bg-transparent focus:border-transparent border-transparent h-12 px-0 text-body"
            />
          </div>
        </div>

        {/* Details */}
        <div>
          <SectionLabel>Details (optional)</SectionLabel>
          <div className="bg-white rounded-card shadow-card px-4 py-1">
            <Textarea
              rows={4}
              placeholder="When, where, brand, price split, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              className="bg-transparent focus:bg-transparent focus:border-transparent border-transparent px-0"
            />
          </div>
        </div>

        {err && <p className="text-footnote text-[#ff3b30] px-1">{err}</p>}

        <Button
          type="submit"
          disabled={busy || !title.trim()}
          className="w-full"
        >
          {busy ? 'Posting…' : 'Post listing'}
        </Button>
      </form>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}
