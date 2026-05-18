import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import {
  Button, Select, SectionLabel, Hairline,
  RESIDENCES, TERMS, residenceShort,
} from '../components/ui.jsx';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

export default function Settings() {
  const nav = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [residence, setResidence] = useState(user.residence);
  const [term, setTerm]           = useState(user.term);
  const [busy, setBusy]           = useState(false);
  const [saved, setSaved]         = useState(false);
  const [err, setErr]             = useState('');

  const dirty = residence !== user.residence || term !== user.term;

  async function save() {
    if (!dirty) return;
    setBusy(true);
    setErr('');
    setSaved(false);
    try {
      const { user: updated } = await api('/auth/me', {
        method: 'PATCH',
        auth: true,
        body: { residence, term },
      });
      updateUser(updated);
      setSaved(true);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-12">
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-0.5 text-[#007aff] text-subhead mb-4 active:opacity-70 transition"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-[28px] font-bold tracking-[-0.5px] text-ink-900 mb-6">Settings</h1>

      {/* Profile — read-only */}
      <SectionLabel>Profile</SectionLabel>
      <div className="bg-white rounded-card shadow-card divide-y divide-ink-100 mb-5">
        <Row label="Name"  value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Residence" value={residenceShort(user.residence)} />
        <Row label="Term"  value={user.term === 'fall_winter' ? 'Fall + Winter' : 'Summer'} />
      </div>

      {/* Edit residence / term */}
      <SectionLabel>Update residence & term</SectionLabel>
      <div className="bg-white rounded-card shadow-card px-4 py-4 mb-5 space-y-3">
        <Select
          options={RESIDENCES}
          value={residence}
          onChange={(e) => { setResidence(e.target.value); setSaved(false); }}
        />
        <Select
          options={TERMS}
          value={term}
          onChange={(e) => { setTerm(e.target.value); setSaved(false); }}
        />
        {err && <p className="text-footnote text-[#ff3b30] px-1">{err}</p>}
        {saved && <p className="text-footnote text-[#34c759] px-1">Saved.</p>}
        <Button
          onClick={save}
          disabled={busy || !dirty}
          className="w-full"
        >
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {/* Account */}
      <SectionLabel>Account</SectionLabel>
      <div className="bg-white rounded-card shadow-card p-4">
        <Button
          variant="danger"
          className="w-full"
          onClick={() => { logout(); nav('/'); }}
        >
          Log out
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="text-body text-ink-900 shrink-0">{label}</span>
      <span className="text-body text-ink-500 min-w-0 break-all text-right">{value}</span>
    </div>
  );
}
