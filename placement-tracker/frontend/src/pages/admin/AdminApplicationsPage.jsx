import { ClipboardList, Download, Eye, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { ApplicationStatusBadge } from '../../components/common/StatusBadge';
import { APPLICATION_STATUS_META, BRANCH_OPTIONS } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { applicationService } from '../../services/applicationService';
import { companyService } from '../../services/companyService';
import { driveService } from '../../services/driveService';
import { studentService } from '../../services/studentService';

export default function AdminApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    companyId: '',
    driveId: searchParams.get('driveId') || '',
    branch: '',
    status: '',
    search: '',
  });

  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('APPLIED');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadReferenceData = async () => {
    try {
      const [compList, driveList] = await Promise.all([
        companyService.listCompanies(),
        driveService.listDrives(),
      ]);
      setCompanies(compList);
      setDrives(driveList);
    } catch {
      // Non-blocking
    }
  };

  const loadApplications = () => {
    setLoading(true);
    setError('');
    applicationService
      .listApplications(filters)
      .then(setApplications)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load applications')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReferenceData();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [filters.companyId, filters.driveId, filters.branch, filters.status]);

  const openDetails = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRemarks(app.remarks || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdating(true);
    try {
      const updated = await applicationService.updateStatus(selectedApp.id, {
        status: newStatus,
        remarks,
      });
      toast.success('Application status updated');
      setSelectedApp(updated);
      loadApplications();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update status'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadResume = async (studentId) => {
    try {
      const blob = await studentService.downloadResumeBlob(studentId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Resume not available'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review student applications, filter by company or drive, and progress candidates across selection rounds
        </p>
      </div>

      {/* Filters */}
      <div className="card-surface p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && loadApplications()}
            placeholder="Search student name, enrollment, company..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={filters.companyId}
          onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
          className="input-field"
        >
          <option value="">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.driveId}
          onChange={(e) => setFilters({ ...filters, driveId: e.target.value })}
          className="input-field"
        >
          <option value="">All Drives</option>
          {drives.map((d) => (
            <option key={d.id} value={d.id}>{d.companyName} — {d.jobTitle}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="input-field"
          >
            <option value="">Branch</option>
            {BRANCH_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">Status</option>
            {Object.entries(APPLICATION_STATUS_META).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadApplications} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications match your filters"
          description="Try adjusting the search or filter criteria."
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Company &amp; Role</th>
                  <th className="px-5 py-3.5">Academics</th>
                  <th className="px-5 py-3.5">Applied On</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{app.studentName}</p>
                      <p className="text-xs text-slate-500">{app.enrollmentNumber} • {app.branch}-{app.section}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{app.companyName}</p>
                      <p className="text-xs text-slate-500">{app.jobTitle} • {app.packageLpa} LPA</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <span className="font-semibold text-slate-900">{app.cgpa} CGPA</span>
                      <p>{app.activeBacklogs} backlogs</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openDetails(app)}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
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
        title={selectedApp ? `${selectedApp.studentName} — ${selectedApp.companyName}` : 'Application'}
        subtitle={selectedApp ? `${selectedApp.jobTitle} • ${selectedApp.enrollmentNumber}` : ''}
        maxWidth="max-w-2xl"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <p className="text-slate-500">Branch</p>
                <p className="font-semibold text-slate-900">{selectedApp.branch}-{selectedApp.section}</p>
              </div>
              <div>
                <p className="text-slate-500">CGPA</p>
                <p className="font-semibold text-slate-900">{selectedApp.cgpa}</p>
              </div>
              <div>
                <p className="text-slate-500">Backlogs</p>
                <p className="font-semibold text-slate-900">{selectedApp.activeBacklogs}</p>
              </div>
              <div>
                <p className="text-slate-500">Current Status</p>
                <div className="mt-0.5">
                  <ApplicationStatusBadge status={selectedApp.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedApp.hasUploadedResume && (
                <button
                  type="button"
                  onClick={() => handleDownloadResume(selectedApp.studentId)}
                  className="btn-secondary text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Uploaded PDF Resume
                </button>
              )}
              {selectedApp.resumeUrl && (
                <a href={selectedApp.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                  Open External Resume
                </a>
              )}
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 p-4 rounded-xl border border-slate-200 bg-white">
              <h3 className="text-sm font-semibold text-slate-900">Update Application Status</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-text">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field"
                  >
                    {Object.entries(APPLICATION_STATUS_META).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Remarks</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Feedback or round details..."
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={updating} className="btn-primary text-xs">
                  {updating ? 'Updating...' : 'Save Status Update'}
                </button>
              </div>
            </form>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Status Audit History
              </h3>
              <div className="space-y-2.5">
                {(selectedApp.statusHistory || []).map((h) => (
                  <div key={h.id} className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div>
                      <ApplicationStatusBadge status={h.status} />
                      <p className="mt-1.5 text-slate-700">{h.remarks}</p>
                      <p className="mt-0.5 text-slate-400">Updated by {h.changedBy}</p>
                    </div>
                    <span className="text-slate-400 shrink-0">
                      {new Date(h.changedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
