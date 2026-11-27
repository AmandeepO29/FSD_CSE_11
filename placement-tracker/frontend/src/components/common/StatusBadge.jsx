import { APPLICATION_STATUS_META, DRIVE_STATUS_META } from '../../config/siteConfig';

export function ApplicationStatusBadge({ status }) {
  const meta = APPLICATION_STATUS_META[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
      {meta.label}
    </span>
  );
}

export function DriveStatusBadge({ status }) {
  const meta = DRIVE_STATUS_META[status] || {
    label: status || 'Unknown',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
      {meta.label}
    </span>
  );
}
