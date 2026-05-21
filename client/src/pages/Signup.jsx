import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Button, Input, Select, RESIDENCES, TERMS } from '../components/ui.jsx';
import AuthCard from '../components/AuthCard.jsx';

export default function Signup() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    residence: 'whitney',
    term: 'fall_winter',
  });
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    if (!agreed) {
      setErr('Please agree to the Terms and Conditions to continue.');
      return;
    }
    setErr('');
    setBusy(true);
    try {
      const data = await api('/auth/signup', { method: 'POST', body: form });
      if (data.token && data.user) {
        // Server auto-verified (verification disabled or non-UofT) — log in directly.
        login(data.token, data.user);
        nav('/');
      } else {
        // UofT OTP path (only reached when EMAIL_VERIFICATION_ENABLED=true server-side).
        nav('/verify', { state: { email: form.email } });
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AuthCard
        title="Create account"
        subtitle="Use your utoronto.ca address to get a verified badge."
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

          <div className="flex items-start gap-3 pt-2 select-none">
            <button
              type="button"
              role="checkbox"
              aria-checked={agreed}
              aria-label="I agree to the Terms and Conditions"
              onClick={() => setAgreed(!agreed)}
              className={`shrink-0 mt-0.5 w-[22px] h-[22px] rounded-md border flex items-center justify-center transition active:opacity-70 ${
                agreed
                  ? 'bg-[#007aff] border-[#007aff]'
                  : 'bg-white border-ink-300'
              }`}
            >
              {agreed && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5 text-white"
                  aria-hidden="true"
                >
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </button>
            <p className="text-subhead text-ink-700 leading-snug">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-[#007aff] font-medium underline underline-offset-2 active:opacity-70 transition"
              >
                Terms and Conditions
              </button>
              .
            </p>
          </div>

          {err && <p className="text-[14px] text-red-600 px-1">{err}</p>}
          <Button
            type="submit"
            disabled={busy || !agreed}
            className="w-full mt-2"
          >
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </AuthCard>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </>
  );
}

function TermsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tc-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg sm:rounded-sheet sm:shadow-sheet rounded-t-sheet max-h-[88vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 h-12 border-b border-ink-200 shrink-0">
          <div className="w-14" />
          <h2 id="tc-title" className="text-headline font-semibold text-ink-900">
            Terms and Conditions
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#007aff] text-body font-semibold active:opacity-70 transition w-14 text-right"
          >
            Done
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 text-body text-ink-900 leading-relaxed">
          <p className="text-footnote text-ink-500 mb-5">
            By creating an account on UC BorrowBox, you agree to the terms below.
            These terms exist to keep the community trustworthy and respectful.
          </p>

          <Section number="1" title="Eligibility">
            UC BorrowBox is intended for current residents of Whitney Hall,
            Sir Daniel's Residence, and Morrison Residence at University College,
            University of Toronto. You must be at least 18 years old to create an
            account. If you no longer reside in one of these residences, please
            stop using the service.
          </Section>

          <Section number="2" title="Truthful identity">
            You agree to provide accurate information when creating your account,
            including your full name, email address, residence, and academic term.
            Impersonating another person, fabricating residence affiliation, or
            creating duplicate accounts is prohibited. Accounts created with false
            information may be removed without notice.
          </Section>

          <Section number="3" title="Acceptable content">
            You are responsible for everything you post. You agree not to list,
            offer, request, or discuss:
            <ul className="list-disc pl-5 mt-2 space-y-1 marker:text-ink-500">
              <li>Items that are illegal, dangerous, or violate residence policy</li>
              <li>Items you do not own or do not have the right to share</li>
              <li>Content that is harassing, hateful, deceptive, or sexual</li>
              <li>Spam, advertising, or solicitation unrelated to borrowing,
                co-buying, or offering goods between residents</li>
            </ul>
          </Section>

          <Section number="4" title="Community conduct">
            UC BorrowBox runs on neighbourly trust. When you arrange to borrow,
            co-buy, or receive an item, follow through. Treat fellow residents
            with respect. Disputes between users are not arbitrated by UC
            BorrowBox — please resolve them in person and in good faith.
          </Section>

          <Section number="5" title="Privacy">
            We store only what is needed to operate the service: your name,
            email address, residence, term, and the content you post. Your email
            is not shown publicly to other users. We do not sell, rent, or share
            your information with third parties.
          </Section>

          <Section number="6" title="Service availability">
            UC BorrowBox is provided as-is, without warranty of any kind. We may
            modify, suspend, or discontinue the service at any time. Listings,
            comments, or accounts that violate these terms may be removed at our
            discretion.
          </Section>

          <Section number="7" title="Liability">
            UC BorrowBox is a community good — you agree to use it at your own
            risk. UC BorrowBox is not responsible for the condition or safety of
            items exchanged, the conduct of other users, or any loss or dispute
            arising from arrangements made through the platform. UC BorrowBox
            is an independent student initiative, and is not affiliated with,
            operated by, or endorsed by University College or the University of
            Toronto.
          </Section>

          <p className="text-footnote text-ink-500 mt-2">
            Questions or concerns? Contact{' '}
            <a
              href="mailto:ucborrowbox@gmail.com"
              className="text-[#007aff] active:opacity-70 transition"
            >
              ucborrowbox@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="text-subhead font-semibold text-ink-900 mb-1.5">
        <span className="text-ink-500 font-normal mr-2">{number}.</span>
        {title}
      </h3>
      <div className="text-subhead text-ink-700 leading-relaxed">{children}</div>
    </section>
  );
}
