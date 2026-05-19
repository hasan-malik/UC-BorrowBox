import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { Button, Input, Select, RESIDENCES, TERMS } from '../components/ui.jsx';
import AuthCard from '../components/AuthCard.jsx';

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    residence: 'whitney',
    term: 'fall_winter',
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await api('/auth/signup', { method: 'POST', body: form });
      nav('/verify', { state: { email: form.email } });
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Use your utoronto.ca address to get verified."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-ink-900 font-medium">Sign in</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Input placeholder="Full name" value={form.name} onChange={set('name')} required />
        <Input
          type="email"
          placeholder="Email address"
          value={form.email}
          onChange={set('email')}
          required
        />
        <Input
          type="password"
          placeholder="Password (8+ characters)"
          value={form.password}
          onChange={set('password')}
          minLength={8}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Select options={RESIDENCES} value={form.residence} onChange={set('residence')} />
          <Select options={TERMS} value={form.term} onChange={set('term')} />
        </div>
        {err && <p className="text-[14px] text-red-600 px-1">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full mt-2">
          {busy ? 'Sending code…' : 'Send verification code'}
        </Button>
      </form>
    </AuthCard>
  );
}
