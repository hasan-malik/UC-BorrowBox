import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Button, Input, PageHeader } from '../components/ui.jsx';

export default function Verify() {
  const loc = useLocation();
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState(loc.state?.email || '');
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { token, user } = await api('/auth/verify', { method: 'POST', body: { email, code } });
      login(token, user);
      nav('/');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setMsg('');
    setErr('');
    try {
      await api('/auth/resend', { method: 'POST', body: { email } });
      setMsg('A new code has been sent.');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <PageHeader
        title="Verify your email"
        subtitle="Enter the 6-digit code we sent to your utoronto email."
      />
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="you@mail.utoronto.ca"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          className="text-center tracking-[0.5em] text-[20px]"
          required
        />
        {err && <p className="text-[14px] text-red-600 px-1">{err}</p>}
        {msg && <p className="text-[14px] text-emerald-700 px-1">{msg}</p>}
        <Button type="submit" disabled={busy} className="w-full mt-2">
          {busy ? 'Verifying…' : 'Verify and sign in'}
        </Button>
      </form>
      <button
        onClick={resend}
        type="button"
        className="block mx-auto mt-5 text-ink-500 hover:text-ink-900 text-[14px]"
      >
        Resend code
      </button>
    </div>
  );
}
