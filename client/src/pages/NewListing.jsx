import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Button, Input, Textarea, PageHeader, LISTING_TYPES } from '../components/ui.jsx';

export default function NewListing() {
  const nav = useNavigate();
  const [type, setType] = useState('borrow');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [err, setErr] = useState('');
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

  return (
    <div className="max-w-xl mx-auto">
      <PageHeader title="New listing" subtitle="Pick what you're after." />

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {LISTING_TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                type="button"
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex flex-col items-start gap-1 p-4 rounded-ios border text-left transition ${
                  active
                    ? 'border-ink-900 bg-white'
                    : 'border-ink-200 bg-white hover:border-ink-300'
                }`}
              >
                <span className="text-[15px] font-semibold text-ink-900">{t.label}</span>
                <span className="text-[12px] text-ink-500 leading-tight">{t.tagline}</span>
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-[13px] text-ink-500 mb-1.5 px-1">Title</label>
          <Input
            placeholder={
              type === 'borrow'
                ? 'e.g. Anyone have a toaster I can use sometimes?'
                : type === 'cobuy'
                ? 'e.g. Split a $20 box of paper towels?'
                : 'e.g. I have a kettle, happy to share'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            required
          />
        </div>

        <div>
          <label className="block text-[13px] text-ink-500 mb-1.5 px-1">Details (optional)</label>
          <Textarea
            rows={5}
            placeholder="Any details — when, where, brand, price split, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
        </div>

        {err && <p className="text-[14px] text-red-600 px-1">{err}</p>}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="secondary" onClick={() => nav(-1)}>Cancel</Button>
          <Button type="submit" disabled={busy || !title.trim()}>
            {busy ? 'Posting…' : 'Post listing'}
          </Button>
        </div>
      </form>
    </div>
  );
}
