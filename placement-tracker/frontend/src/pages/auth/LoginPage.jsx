import { Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { SITE_CONFIG } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../services/api';

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/student'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter both your email/username and password.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${user.fullName}`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/student', { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err, 'Invalid credentials. Please try again.');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md card-surface p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {SITE_CONFIG.institutionName}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Sign in to Placement Tracker</h1>
            <p className="mt-1 text-sm text-slate-500">
              Access your Admin or Student placement dashboard
            </p>
          </div>

          {error && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="identifier" className="label-text">
                Email, Username, or Enrollment No.
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. aarav.sharma@abesec.ac.in or admin"
                  className="input-field pl-10"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-text">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New student at {SITE_CONFIG.institutionName}?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create student account
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
