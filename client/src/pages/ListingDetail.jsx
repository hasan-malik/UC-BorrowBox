import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import {
  Button, Textarea, ResidencePill, TypePill, timeAgo, residenceShort,
} from '../components/ui.jsx';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [listing, setListing] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        api(`/listings/${id}`),
        api(`/listings/${id}/comments`),
      ]);
      setListing(a.listing);
      setComments(b.comments);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function postComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setErr('');
    try {
      await api(`/listings/${id}/comments`, {
        method: 'POST',
        auth: true,
        body: { body },
      });
      setBody('');
      const b = await api(`/listings/${id}/comments`);
      setComments(b.comments);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteComment(cid) {
    if (!confirm('Delete this comment?')) return;
    await api(`/comments/${cid}`, { method: 'DELETE', auth: true });
    setComments((cs) => cs.filter((c) => c.id !== cid));
  }

  async function toggleStatus() {
    const next = listing.status === 'open' ? 'closed' : 'open';
    await api(`/listings/${id}`, { method: 'PATCH', auth: true, body: { status: next } });
    setListing({ ...listing, status: next });
  }

  async function deleteListing() {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    await api(`/listings/${id}`, { method: 'DELETE', auth: true });
    nav('/');
  }

  if (loading) return <p className="text-ink-500">Loading…</p>;
  if (!listing) return <p className="text-ink-500">Listing not found.</p>;

  const isOwner = user && user.id === listing.user_id;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="text-ink-500 hover:text-ink-900 text-[14px] inline-block mb-5">← Back</Link>

      <div className="flex items-center gap-2 mb-3">
        <TypePill type={listing.type} />
        <ResidencePill residence={listing.user_residence} />
        {listing.status === 'closed' && (
          <span className="text-[12px] px-2.5 h-6 inline-flex items-center rounded-full bg-ink-100 text-ink-500">
            Closed
          </span>
        )}
        <span className="text-ink-500 text-[13px] ml-auto">{timeAgo(listing.created_at)}</span>
      </div>

      <h1 className="text-[24px] font-semibold text-ink-900 leading-tight">{listing.title}</h1>
      <p className="text-ink-500 text-[14px] mt-1">
        Posted by {listing.user_name} · {residenceShort(listing.user_residence)}
      </p>

      {listing.description && (
        <p className="text-ink-700 text-[16px] mt-5 whitespace-pre-wrap leading-relaxed">
          {listing.description}
        </p>
      )}

      {isOwner && (
        <div className="flex gap-2 mt-6 pt-6 border-t border-ink-200">
          <Button variant="secondary" onClick={toggleStatus}>
            {listing.status === 'open' ? 'Mark as closed' : 'Reopen'}
          </Button>
          <Button variant="danger" onClick={deleteListing}>Delete</Button>
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-[15px] font-semibold text-ink-900 mb-4">
          {comments.length} {comments.length === 1 ? 'reply' : 'replies'}
        </h2>

        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="border-b border-ink-200 pb-4 last:border-b-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-ink-900 text-[14px]">{c.user_name}</span>
                <ResidencePill residence={c.user_residence} />
                <span className="text-ink-500 text-[12px] ml-auto">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-ink-700 text-[15px] whitespace-pre-wrap leading-relaxed">{c.body}</p>
              {user && user.id === c.user_id && (
                <button
                  onClick={() => deleteComment(c.id)}
                  className="text-ink-500 hover:text-red-600 text-[12px] mt-1"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={postComment} className="mt-6 space-y-3">
            <Textarea
              rows={3}
              placeholder="Write a reply…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            {err && <p className="text-[14px] text-red-600 px-1">{err}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={busy || !body.trim()}>
                {busy ? 'Posting…' : 'Post reply'}
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-6 text-ink-500 text-[14px]">
            <Link to="/login" className="text-ink-900 font-medium">Sign in</Link> to reply.
          </p>
        )}
      </div>
    </div>
  );
}
