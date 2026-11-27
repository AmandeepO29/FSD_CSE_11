import { Download, Edit2, Eye, Plus, Search, Trash2, UserCheck, UserX, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { BRANCH_OPTIONS } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { studentService } from '../../services/studentService';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  enrollmentNumber: '',
  phoneNumber: '',
  branch: 'CSE',
  section: 'A',
  passingYear: 2026,
  cgpa: 7.5,
  activeBacklogs: 0,
  technicalSkills: '',
  resumeUrl: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadStudents = () => {
    setLoading(true);
    setError('');
    studentService
      .listStudents({
        search: search || undefined,
        branch: branchFilter || undefined,
        passingYear: yearFilter ? Number(yearFilter) : undefined,
      })
      .then(setStudents)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load students')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [branchFilter, yearFilter]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      fullName: student.fullName || '',
      email: student.email || '',
      password: '',
      enrollmentNumber: student.enrollmentNumber || '',
      phoneNumber: student.phoneNumber || '',
      branch: student.branch || 'CSE',
      section: student.section || 'A',
      passingYear: student.passingYear || 2026,
      cgpa: student.cgpa ?? 0,
      activeBacklogs: student.activeBacklogs ?? 0,
      technicalSkills: student.technicalSkills || '',
      resumeUrl: student.resumeUrl || '',
      linkedinUrl: student.linkedinUrl || '',
      githubUrl: student.githubUrl || '',
      portfolioUrl: student.portfolioUrl || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        passingYear: Number(form.passingYear),
        cgpa: Number(form.cgpa),
        activeBacklogs: Number(form.activeBacklogs),
      };
      if (editingStudent) {
        await studentService.updateStudent(editingStudent.id, payload);
        toast.success('Student record updated');
      } else {
        await studentService.createStudent(payload);
        toast.success('Student account created');
      }
      setModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save student'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (student) => {
    try {
      await studentService.toggleStudentStatus(student.id, !student.active);
      toast.success(student.active ? 'Student deactivated' : 'Student activated');
      loadStudents();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Delete student ${student.fullName} (${student.enrollmentNumber})?`)) return;
    try {
      await studentService.deleteStudent(student.id);
      toast.success('Student deleted');
      loadStudents();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDownloadResume = async (student) => {
    try {
      const blob = await studentService.downloadResumeBlob(student.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Resume not available'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, update academic eligibility, and manage student accounts
          </p>
        </div>
        <button type="button" onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card-surface p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadStudents()}
            placeholder="Search by name, enrollment number, or email..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="input-field md:w-44"
        >
          <option value="">All Branches</option>
          {BRANCH_OPTIONS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="input-field md:w-40"
        >
          <option value="">All Years</option>
          {[2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>{y} Batch</option>
          ))}
        </select>
        <button type="button" onClick={loadStudents} className="btn-secondary">
          Apply
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadStudents} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description="Try clearing your filters or add a new student account."
          action={
            <button type="button" onClick={openCreateModal} className="btn-primary">
              Add Student
            </button>
          }
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Branch &amp; Batch</th>
                  <th className="px-5 py-3.5">CGPA / Backlogs</th>
                  <th className="px-5 py-3.5">Placement Eligibility</th>
                  <th className="px-5 py-3.5">Account</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((s) => {
                  const goodStanding = s.cgpa >= 6.0 && s.activeBacklogs === 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{s.fullName}</p>
                        <p className="text-xs text-slate-500">{s.enrollmentNumber} • {s.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{s.branch}-{s.section}</span>
                        <p className="text-xs text-slate-500">Class of {s.passingYear}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900">{s.cgpa?.toFixed(2)} CGPA</span>
                        <p className="text-xs text-slate-500">{s.activeBacklogs} active backlogs</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            goodStanding
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {goodStanding ? 'Placement Ready' : 'Restricted Criteria'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {s.applicationsCount} applied • {s.selectedCount} selected
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                            s.active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {s.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(s)}
                            className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(s)}
                            className="p-2 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                            title={s.active ? 'Deactivate' : 'Activate'}
                          >
                            {s.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
        subtitle="Manage academic records and placement profile information"
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Enrollment Number</label>
            <input
              type="text"
              value={form.enrollmentNumber}
              onChange={(e) => setForm({ ...form, enrollmentNumber: e.target.value })}
              className="input-field uppercase"
              required
            />
          </div>
          {!editingStudent && (
            <>
              <div>
                <label className="label-text">College Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label-text">Initial Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Default: Student@123"
                  className="input-field"
                />
              </div>
            </>
          )}
          <div>
            <label className="label-text">Phone Number</label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Branch</label>
            <select
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="input-field"
              required
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Section</label>
            <input
              type="text"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              className="input-field uppercase"
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
            <label className="label-text">CGPA</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              value={form.cgpa}
              onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label-text">Active Backlogs</label>
            <input
              type="number"
              min="0"
              max="30"
              value={form.activeBacklogs}
              onChange={(e) => setForm({ ...form, activeBacklogs: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label-text">Technical Skills</label>
            <input
              type="text"
              value={form.technicalSkills}
              onChange={(e) => setForm({ ...form, technicalSkills: e.target.value })}
              placeholder="Java, Spring Boot, React, SQL"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Profile Modal */}
      <Modal
        open={Boolean(viewingStudent)}
        onClose={() => setViewingStudent(null)}
        title={viewingStudent?.fullName || 'Student Profile'}
        subtitle={viewingStudent ? `${viewingStudent.enrollmentNumber} • ${viewingStudent.branch}-${viewingStudent.section}` : ''}
      >
        {viewingStudent && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{viewingStudent.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-medium text-slate-900">{viewingStudent.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">CGPA</p>
                <p className="font-semibold text-slate-900">{viewingStudent.cgpa}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Active Backlogs</p>
                <p className="font-semibold text-slate-900">{viewingStudent.activeBacklogs}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Profile Completion</p>
                <p className="font-semibold text-indigo-600">{viewingStudent.profileCompletion}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Passing Year</p>
                <p className="font-medium text-slate-900">{viewingStudent.passingYear}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Technical Skills</p>
              <p className="mt-1 text-slate-700">{viewingStudent.technicalSkills || 'Not specified'}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {viewingStudent.hasUploadedResume && (
                <button
                  type="button"
                  onClick={() => handleDownloadResume(viewingStudent)}
                  className="btn-primary text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  View Uploaded PDF Resume
                </button>
              )}
              {viewingStudent.resumeUrl && (
                <a href={viewingStudent.resumeUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                  External Resume Link
                </a>
              )}
              {viewingStudent.linkedinUrl && (
                <a href={viewingStudent.linkedinUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                  LinkedIn
                </a>
              )}
              {viewingStudent.githubUrl && (
                <a href={viewingStudent.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
