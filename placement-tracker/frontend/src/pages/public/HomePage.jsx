import {
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { DriveStatusBadge } from '../../components/common/StatusBadge';
import { JOB_TYPE_LABELS, SITE_CONFIG } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';

export default function HomePage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getPublicOverview()
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setLoading(false));
  }, []);

  const features = [
    {
      icon: CheckCircle2,
      title: 'Automated Eligibility Engine',
      description: 'Real-time evaluation of CGPA, active backlogs, branch, and passing year before students apply.',
    },
    {
      icon: Briefcase,
      title: 'End-to-End Drive Lifecycle',
      description: 'Publish campus drives, manage deadlines, track selection stages, and prevent duplicate applications.',
    },
    {
      icon: FileCheck2,
      title: 'Secure Resume Management',
      description: 'Students maintain academic profiles, technical skills, portfolio links, and upload verified PDF resumes.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Placement Analytics',
      description: 'Interactive branch-wise, company-wise, and monthly placement insights powered by live backend data.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Student Profile',
      description: 'Register with your ABESEC college email and enrollment number, then complete CGPA, skills, and resume.',
    },
    {
      step: '02',
      title: 'Check Drive Eligibility',
      description: 'Browse active company drives with instant eligibility breakdowns tailored to your academic record.',
    },
    {
      step: '03',
      title: 'Apply & Track Progress',
      description: 'Submit applications in one click and follow every round from Shortlisted to Selected in real time.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{SITE_CONFIG.institutionName} • Campus Placement Portal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Smart Campus Placement Management for{' '}
              <span className="text-indigo-600">{SITE_CONFIG.institutionName}</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Placement Tracker unifies student profiles, recruiter drives, automated eligibility verification,
              and live placement analytics in one clean, reliable platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {isAuthenticated ? (
                <Link to={isAdmin ? '/admin' : '/student'} className="btn-primary px-6 py-3 text-sm">
                  Open {isAdmin ? 'Admin' : 'Student'} Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary px-6 py-3 text-sm">
                    Student Registration
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="btn-secondary px-6 py-3 text-sm">
                    Portal Sign In
                  </Link>
                </>
              )}
              <Link to="/about" className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                Learn how it works →
              </Link>
            </div>
          </div>

          {/* Live Placement Stats */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-surface p-5 animate-pulse">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="mt-3 h-7 w-16 bg-slate-200 rounded" />
                </div>
              ))
            ) : (
              <>
                <div className="card-surface p-5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Registered Students</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{overview?.totalStudents ?? 0}</p>
                </div>
                <div className="card-surface p-5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Partner Companies</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{overview?.totalCompanies ?? 0}</p>
                </div>
                <div className="card-surface p-5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Active Drives</span>
                    <Briefcase className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{overview?.activeDrives ?? 0}</p>
                </div>
                <div className="card-surface p-5">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <span>Highest Package</span>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {overview?.highestPackageLpa ? `${overview.highestPackageLpa} LPA` : '—'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Platform Capabilities</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Built for transparent, high-velocity campus hiring
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="card-surface p-6 hover:shadow-card-hover transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{feat.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">How It Works</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                From registration to offer letter in three steps
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Role-based JWT security &amp; audit trail
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((item) => (
              <div key={item.step} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-indigo-600 tracking-wider">STEP {item.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Live Campus Opportunities</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Recent Placement Drives
            </h2>
          </div>
          <Link to={isAuthenticated ? (isAdmin ? '/admin/drives' : '/student/drives') : '/login'} className="btn-secondary">
            View All Drives
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card-surface p-6 animate-pulse space-y-3">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            ))
          ) : overview?.featuredDrives?.length ? (
            overview.featuredDrives.map((drive) => (
              <div key={drive.id} className="card-surface p-6 flex flex-col justify-between hover:shadow-card-hover transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600">{drive.companyName}</p>
                      <h3 className="mt-1 text-base font-bold text-slate-900">{drive.jobTitle}</h3>
                    </div>
                    <DriveStatusBadge status={drive.status} />
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Package</span>
                      <span className="font-semibold text-slate-900">{drive.packageLpa} LPA</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Min CGPA</span>
                      <span className="font-semibold text-slate-900">{drive.minCgpa}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Job Type</span>
                      <span className="font-medium text-slate-800">{JOB_TYPE_LABELS[drive.jobType] || drive.jobType}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{drive.jobLocation}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Deadline: {drive.applicationDeadline}</span>
                  <Link
                    to={isAuthenticated ? (isAdmin ? '/admin/drives' : '/student/drives') : '/login'}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {isAuthenticated ? 'Open Drive →' : 'Sign in to Apply →'}
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full card-surface p-8 text-center text-sm text-slate-500">
              No placement drives are currently published. Sign in as Admin to create drives.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
