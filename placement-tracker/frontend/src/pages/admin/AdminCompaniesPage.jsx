import { Building2, Edit2, ExternalLink, Mail, MapPin, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { CardGridSkeleton } from '../../components/common/LoadingSkeleton';
import Modal from '../../components/common/Modal';
import { extractErrorMessage } from '../../services/api';
import { companyService } from '../../services/companyService';

const EMPTY_COMPANY = {
  name: '',
  industry: '',
  website: '',
  location: '',
  description: '',
  hrContactEmail: '',
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_COMPANY);
  const [saving, setSaving] = useState(false);

  const loadCompanies = () => {
    setLoading(true);
    setError('');
    companyService
      .listCompanies(search)
      .then(setCompanies)
      .catch((err) => setError(extractErrorMessage(err, 'Failed to load companies')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_COMPANY);
    setModalOpen(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setForm({
      name: company.name || '',
      industry: company.industry || '',
      website: company.website || '',
      location: company.location || '',
      description: company.description || '',
      hrContactEmail: company.hrContactEmail || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await companyService.updateCompany(editing.id, form);
        toast.success('Company updated');
      } else {
        await companyService.createCompany(form);
        toast.success('Company added');
      }
      setModalOpen(false);
      loadCompanies();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to save company'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`Delete ${company.name}? All drives under this company will also be removed.`)) return;
    try {
      await companyService.deleteCompany(company.id);
      toast.success('Company deleted');
      loadCompanies();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Company Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage recruiting partners, HR contacts, and campus hiring profiles</p>
        </div>
        <button type="button" onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      <div className="card-surface p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCompanies()}
            placeholder="Search companies by name, industry, or location..."
            className="input-field pl-10"
          />
        </div>
        <button type="button" onClick={loadCompanies} className="btn-secondary">
          Search
        </button>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadCompanies} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies added yet"
          description="Add recruiting companies to start creating campus placement drives."
          action={
            <button type="button" onClick={openCreate} className="btn-primary">
              Add Company
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <div key={c.id} className="card-surface p-6 flex flex-col justify-between hover:shadow-card-hover transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                      {c.industry}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{c.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{c.description || 'No description provided.'}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{c.hrContactEmail}</span>
                  </div>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Visit Website</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{c.totalDrives} total drives</span>
                <span className="font-semibold text-emerald-600">{c.activeDrives} active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Company' : 'Add Recruiting Company'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Company Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Industry</label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="e.g. Product & SaaS"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Noida / Bengaluru"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">HR Contact Email</label>
              <input
                type="email"
                value={form.hrContactEmail}
                onChange={(e) => setForm({ ...form, hrContactEmail: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="label-text">Website URL</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://company.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Company'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
