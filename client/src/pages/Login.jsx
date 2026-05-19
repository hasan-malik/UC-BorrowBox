import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Button, Input } from '../components/ui.jsx';
import AuthCard from '../components/AuthCard.jsx';

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { token, user } = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      login(token, user);
      nav(loc.state?.from || '/');
    } catch (e) {
      if (e.data?.needsVerification) {
        nav('/verify', { state: { email } });
        return;
      }
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to UC BorrowBox."
      footer={
        <>
          New to UC BorrowBox?{' '}
          <Link to="/signup" className="text-ink-900 font-medium">Create an account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err && <p className="text-[14px] text-red-600 px-1">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full mt-2">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}
