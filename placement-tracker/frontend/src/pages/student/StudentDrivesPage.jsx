import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  MapPin,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { DriveStatusBadge } from '../../components/common/StatusBadge';
import { BRANCH_OPTIONS, JOB_TYPE_LABELS } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { applicationService } from '../../services/applicationService';
import { companyService } from '../../services/companyService';
import { driveService } from '../../services/driveService';

export default function StudentDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    companyId: '',
    minPackage: '',
    branch: '',
    jobType: '',
    deadlineBefore: '',
    eligibleOnly: false,
  });

  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    companyService.listCompanies().then(setCompanies).catch(() => {});
  }, []);

  const loadDrives = () => {
    setLoading(true);
    setError('');
    driveService
      .listDrives({
        ...filters,
        eligibleOnly: filters.eligibleOnly ? true : undefined,
      })
      .then(setDrives)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load placement drives')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDrives();
  }, [filters.companyId, filters.branch, filters.jobType, filters.deadlineBefore, filters.eligibleOnly]);

  const handleApply = async (drive) => {
    setApplyingId(drive.id);
    try {
      await applicationService.apply(drive.id);
      toast.success(`Successfully applied to ${drive.companyName} — ${drive.jobTitle}`);
      setSelectedDrive(null);
      loadDrives();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to apply'));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Placement Opportunities</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore active drives with automatic eligibility checks based on your academic profile
        </p>
      </div>

      {/* Filters */}
      <div className="card-surface p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && loadDrives()}
              placeholder="Search company, job role, or location..."
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
            value={filters.jobType}
            onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
            className="input-field"
          >
            <option value="">All Job Types</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="INTERNSHIP_PPO">Internship + PPO</option>
          </select>
          <select
            value={filters.branch}
            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
            className="input-field"
          >
            <option value="">All Branches</option>
            {BRANCH_OPTIONS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="0"
              value={filters.minPackage}
              onChange={(e) => setFilters({ ...filters, minPackage: e.target.value })}
              placeholder="Min Package (LPA)"
              className="input-field w-44"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Deadline before:</span>
              <input
                type="date"
                value={filters.deadlineBefore}
                onChange={(e) => setFilters({ ...filters, deadlineBefore: e.target.value })}
                className="input-field w-40"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.eligibleOnly}
                onChange={(e) => setFilters({ ...filters, eligibleOnly: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Show Eligible Drives Only
            </label>
          </div>
          <button type="button" onClick={loadDrives} className="btn-secondary text-xs">
            Search &amp; Apply Filters
          </button>
        </div>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadDrives} />
      ) : drives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No placement drives match your criteria"
          description="Try clearing your filters or check back later for new campus openings."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((drive) => {
            const eligible = drive.eligibility?.eligible;
            const reasons = drive.eligibility?.reasons || [];

            return (
              <div key={drive.id} className="card-surface p-6 flex flex-col justify-between hover:shadow-card-hover transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600">{drive.companyName}</p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{drive.jobTitle}</h3>
                    </div>
                    <DriveStatusBadge status={drive.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                    <div>
                      <p className="text-slate-400">Package</p>
                      <p className="font-bold text-slate-900">{drive.packageLpa} LPA</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Job Type</p>
                      <p className="font-semibold text-slate-800">{JOB_TYPE_LABELS[drive.jobType] || drive.jobType}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Min CGPA</p>
                      <p className="font-semibold text-slate-800">{drive.minCgpa}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Branches</p>
                      <p className="font-semibold text-slate-800 truncate" title={drive.eligibleBranches}>
                        {drive.eligibleBranches}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{drive.jobLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Deadline: {drive.applicationDeadline}</span>
                    </div>
                  </div>

                  {/* Eligibility Box */}
                  <div className="mt-4">
                    {drive.alreadyApplied ? (
                      <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Application submitted</span>
                      </div>
                    ) : eligible ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>You meet all eligibility criteria</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Not Eligible</span>
                        </div>
                        <p className="text-[11px] leading-snug">{reasons[0]}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDrive(drive)}
                    className="btn-secondary text-xs py-2"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    disabled={!eligible || drive.alreadyApplied || applyingId === drive.id}
                    onClick={() => handleApply(drive)}
                    className="btn-primary text-xs py-2"
                  >
                    {drive.alreadyApplied
                      ? 'Applied'
                      : applyingId === drive.id
                      ? 'Applying...'
                      : 'Apply Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drive Detail Modal */}
      <Modal
        open={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        title={selectedDrive ? `${selectedDrive.companyName} — ${selectedDrive.jobTitle}` : ''}
        subtitle={selectedDrive ? `${selectedDrive.packageLpa} LPA • ${selectedDrive.jobLocation}` : ''}
      >
        {selectedDrive && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job Description</p>
              <p className="mt-1 text-slate-700 leading-relaxed whitespace-pre-line">{selectedDrive.jobDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <p className="text-slate-500">Minimum CGPA</p>
                <p className="font-semibold text-slate-900">{selectedDrive.minCgpa}</p>
              </div>
              <div>
                <p className="text-slate-500">Max Active Backlogs</p>
                <p className="font-semibold text-slate-900">{selectedDrive.maxBacklogs}</p>
              </div>
              <div>
                <p className="text-slate-500">Eligible Branches</p>
                <p className="font-semibold text-slate-900">{selectedDrive.eligibleBranches}</p>
              </div>
              <div>
                <p className="text-slate-500">Drive Date</p>
                <p className="font-semibold text-slate-900">{selectedDrive.driveDate}</p>
              </div>
            </div>
            {selectedDrive.requiredSkills && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Required Skills</p>
                <p className="mt-1 text-slate-700">{selectedDrive.requiredSkills}</p>
              </div>
            )}
            {selectedDrive.selectionProcess && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Selection Process</p>
                <p className="mt-1 text-slate-700">{selectedDrive.selectionProcess}</p>
              </div>
            )}
            {selectedDrive.eligibility && !selectedDrive.eligibility.eligible && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                <p className="font-semibold">Eligibility Reasons:</p>
                {selectedDrive.eligibility.reasons.map((r, idx) => (
                  <p key={idx}>• {r}</p>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSelectedDrive(null)} className="btn-secondary">
                Close
              </button>
              <button
                type="button"
                disabled={!selectedDrive.eligibility?.eligible || selectedDrive.alreadyApplied || applyingId === selectedDrive.id}
                onClick={() => handleApply(selectedDrive)}
                className="btn-primary"
              >
                {selectedDrive.alreadyApplied ? 'Already Applied' : 'Confirm & Apply'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
