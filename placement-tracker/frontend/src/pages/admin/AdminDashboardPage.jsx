import {
  Award,
  Briefcase,
  Building2,
  ClipboardList,
  IndianRupee,
  Percent,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ErrorState from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/LoadingSkeleton';
import StatCard from '../../components/common/StatCard';
import { APPLICATION_STATUS_META } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { dashboardService } from '../../services/dashboardService';

const PIE_COLORS = ['#64748b', '#3b82f6', '#4f46e5', '#f59e0b', '#10b981', '#ef4444'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    setLoading(true);
    setError('');
    dashboardService
      .getAdminDashboard()
      .then(setData)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load analytics')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Placement Analytics Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Loading campus placement metrics...</p>
        </div>
        <CardGridSkeleton count={8} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadDashboard} />;
  }

  const selectionChartData = (data.selectionStatistics || []).map((item) => ({
    ...item,
    label: APPLICATION_STATUS_META[item.status]?.label || item.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Placement Analytics Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time campus recruitment metrics, package statistics, and placement trends
        </p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Registered Students" value={data.totalStudents} icon={Users} accent="indigo" />
        <StatCard title="Total Companies" value={data.totalCompanies} icon={Building2} accent="blue" />
        <StatCard title="Active Placement Drives" value={data.activeDrives} icon={Briefcase} accent="amber" />
        <StatCard title="Total Applications" value={data.totalApplications} icon={ClipboardList} accent="slate" />
        <StatCard title="Students Placed" value={data.studentsPlaced} icon={Award} accent="emerald" />
        <StatCard
          title="Placement Percentage"
          value={`${data.placementPercentage}%`}
          icon={Percent}
          accent="indigo"
        />
        <StatCard
          title="Average Package"
          value={`${data.averagePackageLpa} LPA`}
          subtitle="Across selected offers"
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          title="Highest Package"
          value={`${data.highestPackageLpa} LPA`}
          subtitle="Top campus offer"
          icon={IndianRupee}
          accent="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise placements */}
        <div className="card-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Branch-wise Placements</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total vs placed students across departments</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.branchWisePlacements || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="branch" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalStudents" name="Total Students" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="placedStudents" name="Placed Students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company-wise applications */}
        <div className="card-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Company-wise Applications</h2>
          <p className="text-xs text-slate-500 mt-0.5">Applicant volume and selections per company</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.companyWiseApplications || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="companyName" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="applicationsCount" name="Applications" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="selectedCount" name="Selected" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Placement Trends */}
        <div className="card-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Monthly Placement Trends</h2>
          <p className="text-xs text-slate-500 mt-0.5">Applications submitted vs selections over the last 6 months</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyPlacementTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="applications" name="Applications" stroke="#4f46e5" fill="#e0e7ff" />
                <Area type="monotone" dataKey="selections" name="Selections" stroke="#10b981" fill="#d1fae5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selection Status Breakdown */}
        <div className="card-surface p-6">
          <h2 className="text-base font-semibold text-slate-900">Selection Funnel Statistics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Distribution of applications across recruitment stages</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={selectionChartData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {selectionChartData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
