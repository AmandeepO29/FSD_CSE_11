import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { BRANCH_OPTIONS, SITE_CONFIG } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';
import { extractErrorMessage } from '../../services/api';

export default function RegisterPage() {
  const { register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    enrollmentNumber: '',
    branch: 'CSE',
    section: 'A',
    passingYear: 2026,
    phoneNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/student'} replace />;
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        ...form,
        passingYear: Number(form.passingYear),
      });
      toast.success('Student account created successfully!');
      navigate('/student', { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err, 'Registration failed. Please check your details.');
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl card-surface p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-indigo-600">
              {SITE_CONFIG.institutionName} • Student Registration
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Create your Student Account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Register to explore campus drives, check eligibility, and track applications
            </p>
          </div>

          {error && (
            <div className="mt-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-text">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-text">College Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="name@abesec.ac.in"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-text">Enrollment Number</label>
              <input
                type="text"
                value={form.enrollmentNumber}
                onChange={(e) => updateField('enrollmentNumber', e.target.value)}
                placeholder="e.g. 2026CSE001"
                className="input-field uppercase"
                required
              />
            </div>

            <div>
              <label className="label-text">Branch</label>
              <select
                value={form.branch}
                onChange={(e) => updateField('branch', e.target.value)}
                className="input-field"
                required
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-text">Section</label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => updateField('section', e.target.value)}
                  placeholder="A"
                  className="input-field uppercase"
                  required
                />
              </div>
              <div>
                <label className="label-text">Passing Year</label>
                <input
                  type="number"
                  min={2020}
                  max={2035}
                  value={form.passingYear}
                  onChange={(e) => updateField('passingYear', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="label-text">Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => updateField('phoneNumber', e.target.value)}
                placeholder="10-digit mobile number"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label-text">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="input-field pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
                {submitting ? 'Creating Account...' : 'Create Student Account'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in here
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
