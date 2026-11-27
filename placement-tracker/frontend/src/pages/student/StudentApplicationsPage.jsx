import { ClipboardList, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { ApplicationStatusBadge } from '../../components/common/StatusBadge';
import { JOB_TYPE_LABELS } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { applicationService } from '../../services/applicationService';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const loadApplications = () => {
    setLoading(true);
    setError('');
    applicationService
      .getMyApplications()
      .then(setApplications)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load your applications')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track the real-time status and complete stage history of every drive you applied to
        </p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadApplications} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications submitted yet"
          description="Explore open placement drives and submit your first application."
          action={
            <Link to="/student/drives" className="btn-primary">
              Browse Placement Drives
            </Link>
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Company &amp; Role</th>
                  <th className="px-5 py-3.5">Package &amp; Type</th>
                  <th className="px-5 py-3.5">Applied Date</th>
                  <th className="px-5 py-3.5">Current Status</th>
                  <th className="px-5 py-3.5">Remarks</th>
                  <th className="px-5 py-3.5 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{app.companyName}</p>
                      <p className="text-xs text-slate-500">{app.jobTitle} • {app.jobLocation}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{app.packageLpa} LPA</p>
                      <p className="text-xs text-slate-500">{JOB_TYPE_LABELS[app.jobType] || app.jobType}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {app.remarks || '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Timeline ({app.statusHistory?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? `${selectedApp.companyName} — Status Timeline` : 'Timeline'}
        subtitle={selectedApp ? `${selectedApp.jobTitle} (${selectedApp.packageLpa} LPA)` : ''}
      >
        {selectedApp && (
          <div className="space-y-4">
            {(selectedApp.statusHistory || []).map((item, idx) => (
              <div key={item.id} className="relative pl-6 pb-4 border-l-2 border-indigo-100 last:border-l-transparent">
                <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-white" />
                <div className="flex items-center justify-between gap-2">
                  <ApplicationStatusBadge status={item.status} />
                  <span className="text-xs text-slate-400">
                    {new Date(item.changedAt).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-slate-700">{item.remarks}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  Step #{idx + 1} • Recorded by {item.changedBy}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
