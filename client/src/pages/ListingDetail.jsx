import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import {
  Button, Textarea, ResidencePill, TypePill,
  timeAgo, residenceShort, Hairline, SectionLabel,
} from '../components/ui.jsx';
import { ChevronLeftIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [listing, setListing]   = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody]   = useState('');
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);
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
    } catch { /* not found */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);

  async function postComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setErr('');
    try {
      await api(`/listings/${id}/comments`, { method: 'POST', auth: true, body: { body } });
      setBody('');
      const b = await api(`/listings/${id}/comments`);
      setComments(b.comments);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  async function deleteComment(cid) {
    if (!confirm('Delete this reply?')) return;
    await api(`/comments/${cid}`, { method: 'DELETE', auth: true });
    setComments((cs) => cs.filter((c) => c.id !== cid));
  }

  async function toggleStatus() {
    const next = listing.status === 'open' ? 'closed' : 'open';
    await api(`/listings/${id}`, { method: 'PATCH', auth: true, body: { status: next } });
    setListing({ ...listing, status: next });
  }

  async function deleteListing() {
    if (!confirm('Delete this listing?')) return;
    await api(`/listings/${id}`, { method: 'DELETE', auth: true });
    nav('/');
  }

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-6 h-6 rounded-full border-2 border-ink-200 border-t-[#007aff] animate-spin" />
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-10 text-center text-ink-500 text-body">
        Listing not found.
      </div>
    );
  }

  const isOwner = user?.id === listing.user_id;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-4 pb-12">
      {/* Back */}
      <button
        onClick={() => nav(-1)}
        className="inline-flex items-center gap-0.5 text-[#007aff] text-subhead mb-4 active:opacity-70 transition"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Browse
      </button>

      {/* Header card */}
      <div className="bg-white rounded-card shadow-card p-5 mb-3">
        <div className="flex items-center gap-1.5 mb-3">
          <TypePill type={listing.type} />
          <ResidencePill residence={listing.user_residence} />
          {listing.status === 'closed' && (
            <span className="inline-flex items-center gap-1 text-caption-1 font-medium text-ink-500 bg-ink-100 px-2 h-5 rounded-full ml-auto">
              <LockClosedIcon className="w-3 h-3" />
              Closed
            </span>
          )}
        </div>

        <h1 className="text-title-3 text-ink-900 leading-snug">{listing.title}</h1>
        <p className="text-footnote text-ink-500 mt-1">
          {listing.user_name} · {residenceShort(listing.user_residence)} · {timeAgo(listing.created_at)}
        </p>

        {listing.description && (
          <>
            <Hairline className="my-4" />
            <p className="text-body text-ink-700 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </>
        )}

        {/* Owner controls */}
        {isOwner && (
          <>
            <Hairline className="mt-4 mb-3" />
            <div className="flex gap-2">
              <Button variant="secondary" className="h-9 text-subhead px-4" onClick={toggleStatus}>
                {listing.status === 'open' ? 'Mark as closed' : 'Reopen'}
              </Button>
              <Button variant="danger" className="h-9 text-subhead px-4" onClick={deleteListing}>
                Delete
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Comments */}
      <SectionLabel>
        {comments.length} {comments.length === 1 ? 'Reply' : 'Replies'}
      </SectionLabel>

      {comments.length > 0 && (
        <div className="bg-white rounded-card shadow-card mb-3 divide-y divide-ink-100">
          {comments.map((c) => (
            <div key={c.id} className="px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-footnote font-semibold text-ink-900">{c.user_name}</span>
                <ResidencePill residence={c.user_residence} />
                <span className="text-caption-1 text-ink-500 ml-auto">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-body text-ink-700 whitespace-pre-wrap leading-relaxed">{c.body}</p>
              {user?.id === c.user_id && (
                <button
                  onClick={() => deleteComment(c.id)}
                  className="text-caption-1 text-[#ff3b30] mt-1 active:opacity-70 transition"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply box */}
      {user ? (
        listing.status === 'open' ? (
          <div className="bg-white rounded-card shadow-card p-4">
            <form onSubmit={postComment} className="space-y-3">
              <Textarea
                rows={3}
                placeholder="Write a reply…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {err && <p className="text-footnote text-[#ff3b30]">{err}</p>}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={busy || !body.trim()}
                  className="h-9 text-subhead px-4"
                >
                  {busy ? 'Posting…' : 'Reply'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-4 text-ink-500 text-subhead">
            <LockClosedIcon className="w-4 h-4" />
            This listing is closed.
          </div>
        )
      ) : (
        <div className="bg-white rounded-card shadow-card p-4 text-center">
          <ChatBubbleLeftIcon className="w-6 h-6 text-ink-300 mx-auto mb-2" />
          <p className="text-subhead text-ink-500">
            <Link to="/login" className="text-[#007aff] font-medium">Sign in</Link> to reply.
          </p>
        </div>
      )}
    </div>
  );
}
