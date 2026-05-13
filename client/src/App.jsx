import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { NavBar } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Verify from './pages/Verify.jsx';
import NewListing from './pages/NewListing.jsx';
import ListingDetail from './pages/ListingDetail.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8 text-ink-500">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-full flex flex-col">
      <NavBar user={user} onLogout={logout} />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/new" element={<Protected><NewListing /></Protected>} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
