import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorState from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/LoadingSkeleton';
import StatCard from '../../components/common/StatCard';
import { ApplicationStatusBadge, DriveStatusBadge } from '../../components/common/StatusBadge';
import { extractErrorMessage } from '../../services/api';
import { dashboardService } from '../../services/dashboardService';

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    dashboardService
      .getStudentDashboard()
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load student dashboard')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 card-surface animate-pulse" />
        <CardGridSkeleton count={5} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card-surface p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{data.enrollmentNumber} • {data.branch}-{data.section} (Batch {data.passingYear})</span>
          </div>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {data.fullName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Current CGPA: <strong className="text-slate-800">{data.cgpa}</strong> • Active Backlogs:{' '}
            <strong className="text-slate-800">{data.activeBacklogs}</strong>
          </p>
        </div>

        <div className="w-full md:w-72 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Profile Completion</span>
            <span className="text-indigo-600">{data.profileCompletion}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${data.profileCompletion}%` }}
            />
          </div>
          <Link to="/student/profile" className="mt-2.5 inline-block text-xs font-semibold text-indigo-600 hover:underline">
            {data.profileCompletion < 100 ? 'Complete your profile & upload resume →' : 'Manage profile & resume →'}
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available Drives"
          value={data.totalAvailableDrives}
          subtitle="Currently open"
          icon={Briefcase}
          accent="blue"
        />
        <StatCard
          title="Eligible Drives"
          value={data.eligibleDrives}
          subtitle="Matching your criteria"
          icon={CheckCircle2}
          accent="indigo"
        />
        <StatCard
          title="Applied Drives"
          value={data.appliedDrives}
          subtitle="Submitted applications"
          icon={ClipboardList}
          accent="amber"
        />
        <StatCard
          title="Selected Offers"
          value={data.selectedOpportunities}
          subtitle="Confirmed selections"
          icon={Award}
          accent="emerald"
        />
      </div>

      {/* Recent Drives & Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Latest Placement Drives</h2>
              <p className="text-xs text-slate-500">Auto-checked against your CGPA and branch</p>
            </div>
            <Link to="/student/drives" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(data.recentDrives || []).length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No drives published yet.</p>
            ) : (
              data.recentDrives.map((d) => (
                <div key={d.id} className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600">{d.companyName}</p>
                      <p className="text-sm font-bold text-slate-900">{d.jobTitle}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{d.packageLpa} LPA • {d.jobLocation}</p>
                    </div>
                    <DriveStatusBadge status={d.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    {d.alreadyApplied ? (
                      <span className="font-semibold text-indigo-600">Already Applied</span>
                    ) : d.eligibility?.eligible ? (
                      <span className="font-semibold text-emerald-600">Eligible to Apply</span>
                    ) : (
                      <span className="font-medium text-amber-700">Not Eligible</span>
                    )}
                    <span className="text-slate-400">Deadline: {d.applicationDeadline}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Applications</h2>
              <p className="text-xs text-slate-500">Track your latest recruitment stages</p>
            </div>
            <Link to="/student/applications" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              View history <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {(data.recentApplications || []).length === 0 ? (
              <div className="py-6 text-center">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">You haven&apos;t applied to any drives yet.</p>
                <Link to="/student/drives" className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline">
                  Browse Eligible Drives →
                </Link>
              </div>
            ) : (
              data.recentApplications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{app.companyName}</p>
                    <p className="text-xs text-slate-500 truncate">{app.jobTitle} • {app.packageLpa} LPA</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={app.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
