import { Briefcase, Calendar, Edit2, Eye, EyeOff, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { DriveStatusBadge } from '../../components/common/StatusBadge';
import { JOB_TYPE_LABELS } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { companyService } from '../../services/companyService';
import { driveService } from '../../services/driveService';

const EMPTY_DRIVE = {
  companyId: '',
  jobTitle: '',
  jobDescription: '',
  jobType: 'FULL_TIME',
  jobLocation: '',
  packageLpa: 8.0,
  minCgpa: 7.0,
  maxBacklogs: 0,
  eligibleBranches: 'CSE,CSE-AIML,CSE-DS,IT',
  passingYear: 2026,
  applicationDeadline: '',
  driveDate: '',
  requiredSkills: '',
  selectionProcess: '',
  status: 'OPEN',
  published: true,
};

export default function AdminDrivesPage() {
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_DRIVE);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [drivesData, companiesData] = await Promise.all([
        driveService.listDrives({ search, status: statusFilter }),
        companyService.listCompanies(),
      ]);
      setDrives(drivesData);
      setCompanies(companiesData);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load placement drives'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_DRIVE,
      companyId: companies[0]?.id || '',
    });
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      companyId: d.companyId,
      jobTitle: d.jobTitle,
      jobDescription: d.jobDescription,
      jobType: d.jobType,
      jobLocation: d.jobLocation,
      packageLpa: d.packageLpa,
      minCgpa: d.minCgpa,
      maxBacklogs: d.maxBacklogs,
      eligibleBranches: d.eligibleBranches,
      passingYear: d.passingYear,
      applicationDeadline: d.applicationDeadline,
      driveDate: d.driveDate,
      requiredSkills: d.requiredSkills || '',
      selectionProcess: d.selectionProcess || '',
      status: d.status,
      published: d.published,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        companyId: Number(form.companyId),
        packageLpa: Number(form.packageLpa),
        minCgpa: Number(form.minCgpa),
        maxBacklogs: Number(form.maxBacklogs),
        passingYear: Number(form.passingYear),
      };
      if (editing) {
        await driveService.updateDrive(editing.id, payload);
        toast.success('Placement drive updated');
      } else {
        await driveService.createDrive(payload);
        toast.success('Placement drive created');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save drive'));
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (drive) => {
    try {
      await driveService.togglePublish(drive.id, !drive.published);
      toast.success(drive.published ? 'Drive unpublished' : 'Drive published');
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (drive) => {
    if (!window.confirm(`Delete "${drive.jobTitle}" at ${drive.companyName}?`)) return;
    try {
      await driveService.deleteDrive(drive.id);
      toast.success('Placement drive deleted');
      loadData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Placement Drives</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create drives, define eligibility rules, publish to students, and review applicants
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary" disabled={companies.length === 0}>
          <Plus className="w-4 h-4" />
          Create Drive
        </button>
      </div>

      <div className="card-surface p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder="Search by role, company, or location..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <button type="button" onClick={loadData} className="btn-secondary">
          Filter
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : drives.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No placement drives found"
          description={
            companies.length === 0
              ? 'Add at least one company first before creating a placement drive.'
              : 'Create your first placement drive to open applications for students.'
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Role &amp; Company</th>
                  <th className="px-5 py-3.5">Package &amp; Criteria</th>
                  <th className="px-5 py-3.5">Dates</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Applicants</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {drives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{d.jobTitle}</p>
                      <p className="text-xs text-slate-500">
                        {d.companyName} • {JOB_TYPE_LABELS[d.jobType] || d.jobType} • {d.jobLocation}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{d.packageLpa} LPA</p>
                      <p className="text-xs text-slate-500">
                        Min {d.minCgpa} CGPA • Max {d.maxBacklogs} backlogs • {d.eligibleBranches}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Deadline: {d.applicationDeadline}</span>
                      </div>
                      <p className="mt-1 text-slate-500">Drive: {d.driveDate}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <DriveStatusBadge status={d.status} />
                        <span className={`text-[11px] font-medium ${d.published ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {d.published ? 'Published' : 'Hidden Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/applications?driveId=${d.id}`)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {d.applicationCount}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(d)}
                          className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                          title={d.published ? 'Unpublish' : 'Publish'}
                        >
                          {d.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(d)}
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit Drive"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d)}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Placement Drive' : 'Create Placement Drive'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Company</label>
            <select
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select company...</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Job Title</label>
            <input
              type="text"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Job Type</label>
            <select
              value={form.jobType}
              onChange={(e) => setForm({ ...form, jobType: e.target.value })}
              className="input-field"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="INTERNSHIP_PPO">Internship + PPO</option>
            </select>
          </div>
          <div>
            <label className="label-text">Job Location</label>
            <input
              type="text"
              value={form.jobLocation}
              onChange={(e) => setForm({ ...form, jobLocation: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Salary Package (LPA)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.packageLpa}
              onChange={(e) => setForm({ ...form, packageLpa: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Passing Year</label>
            <input
              type="number"
              value={form.passingYear}
              onChange={(e) => setForm({ ...form, passingYear: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Minimum CGPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={form.minCgpa}
              onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Max Allowed Backlogs</label>
            <input
              type="number"
              min="0"
              max="30"
              value={form.maxBacklogs}
              onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Application Deadline</label>
            <input
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Drive Date</label>
            <input
              type="date"
              value={form.driveDate}
              onChange={(e) => setForm({ ...form, driveDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Eligible Branches (comma-separated or ALL)</label>
            <input
              type="text"
              value={form.eligibleBranches}
              onChange={(e) => setForm({ ...form, eligibleBranches: e.target.value })}
              placeholder="CSE,IT,ECE or ALL"
              className="input-field uppercase"
              required
            />
          </div>
          <div>
            <label className="label-text">Drive Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input-field"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Job Description</label>
            <textarea
              rows={3}
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Required Skills</label>
            <input
              type="text"
              value={form.requiredSkills}
              onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Selection Process</label>
            <input
              type="text"
              value={form.selectionProcess}
              onChange={(e) => setForm({ ...form, selectionProcess: e.target.value })}
              placeholder="OA -> Technical -> HR"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-slate-700">
              Publish drive immediately for eligible students
            </label>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Update Drive' : 'Create Drive'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
