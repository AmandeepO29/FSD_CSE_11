import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/siteConfig';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{SITE_CONFIG.appName}</p>
                <p className="text-xs font-medium text-indigo-600">{SITE_CONFIG.institutionName}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed max-w-xs">
              {SITE_CONFIG.appSubtitle} — streamlining campus recruitment, student eligibility, and placement analytics.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigation</p>
            <div className="flex flex-col space-y-1.5 text-sm text-slate-600">
              <Link to="/" className="hover:text-indigo-600 transition-colors w-fit">Home</Link>
              <Link to="/about" className="hover:text-indigo-600 transition-colors w-fit">About</Link>
              <Link to="/login" className="hover:text-indigo-600 transition-colors w-fit">Login</Link>
              <Link to="/register" className="hover:text-indigo-600 transition-colors w-fit">Student Registration</Link>
            </div>
          </div>

          <div className="space-y-1.5 md:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Developed &amp; Maintained By:
            </p>
            <p className="text-sm font-medium text-slate-800">{SITE_CONFIG.teamLine}</p>
            <p className="text-xs font-medium text-indigo-600">{SITE_CONFIG.teamCredit}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>{SITE_CONFIG.copyright}</p>
          <p>{SITE_CONFIG.institutionName} • Training &amp; Placement Cell</p>
        </div>
      </div>
    </footer>
  );
}
