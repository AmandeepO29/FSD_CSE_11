import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Failed to load data.', onRetry }) {
  return (
    <div className="card-surface p-8 text-center border-red-200 bg-red-50/40">
      <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">Unable to complete request</h3>
      <p className="mt-1 text-sm text-slate-600">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
