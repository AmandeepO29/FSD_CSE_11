import { CheckCircle2, Download, FileText, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ErrorState from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/LoadingSkeleton';
import { BRANCH_OPTIONS } from '../../config/siteConfig';
import { extractErrorMessage } from '../../services/api';
import { studentService } from '../../services/studentService';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadProfile = () => {
    setLoading(true);
    setError('');
    studentService
      .getMyProfile()
      .then((data) => {
        setProfile(data);
        setForm({
          fullName: data.fullName || '',
          enrollmentNumber: data.enrollmentNumber || '',
          phoneNumber: data.phoneNumber || '',
          branch: data.branch || 'CSE',
          section: data.section || 'A',
          passingYear: data.passingYear || 2026,
          cgpa: data.cgpa ?? 0,
          activeBacklogs: data.activeBacklogs ?? 0,
          technicalSkills: data.technicalSkills || '',
          resumeUrl: data.resumeUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
        });
      })
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load profile')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await studentService.updateMyProfile({
        ...form,
        passingYear: Number(form.passingYear),
        cgpa: Number(form.cgpa),
        activeBacklogs: Number(form.activeBacklogs),
      });
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('PDF file size must be 5MB or less');
      return;
    }

    setUploading(true);
    try {
      const updated = await studentService.uploadResume(file);
      setProfile(updated);
      toast.success('Resume PDF uploaded securely');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to upload resume'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDownloadResume = async () => {
    if (!profile) return;
    try {
      const blob = await studentService.downloadResumeBlob(profile.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to open resume'));
    }
  };

  if (loading) return <CardGridSkeleton count={4} />;
  if (error) return <ErrorState message={error} onRetry={loadProfile} />;
  if (!form) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Profile &amp; Resume</h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep your CGPA, active backlogs, skills, and resume updated for automatic drive eligibility
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700">
          Profile Completion: {profile.profileCompletion}%
        </div>
      </div>

      {/* PDF Resume Upload Card */}
      <div className="card-surface p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Resume Document (PDF)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored securely in the production database (max 5MB, PDF format only)
              </p>
              {profile.hasUploadedResume ? (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Uploaded: {profile.resumeFileName}</span>
                </div>
              ) : (
                <p className="mt-2 text-xs text-amber-700 font-medium">No PDF resume uploaded yet</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {profile.hasUploadedResume && (
              <button type="button" onClick={handleDownloadResume} className="btn-secondary text-xs">
                <Download className="w-4 h-4" />
                View PDF
              </button>
            )}
            <label className="btn-primary text-xs cursor-pointer">
              <Upload className="w-4 h-4" />
              {uploading ? 'Uploading...' : profile.hasUploadedResume ? 'Replace PDF' : 'Upload PDF'}
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleResumeUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="card-surface p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
          Academic &amp; Contact Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="label-text">College Email (Read Only)</label>
            <input type="email" value={profile.email} disabled className="input-field bg-slate-100 text-slate-500" />
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
          <div>
            <label className="label-text">Phone Number</label>
            <input
              type="tel"
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
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
          <div>
            <label className="label-text">Current CGPA (0.0 - 10.0)</label>
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
        </div>

        <div>
          <label className="label-text">Technical Skills</label>
          <textarea
            rows={2}
            value={form.technicalSkills}
            onChange={(e) => setForm({ ...form, technicalSkills: e.target.value })}
            placeholder="Java, Spring Boot, React, MySQL, Data Structures..."
            className="input-field"
          />
        </div>

        <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 pt-2">
          External Links &amp; Profiles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">External Resume URL (Optional)</label>
            <input
              type="url"
              value={form.resumeUrl}
              onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">LinkedIn URL</label>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">GitHub URL</label>
            <input
              type="url"
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
              placeholder="https://github.com/..."
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Portfolio URL</label>
            <input
              type="url"
              value={form.portfolioUrl}
              onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
              placeholder="https://yourportfolio.dev"
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
