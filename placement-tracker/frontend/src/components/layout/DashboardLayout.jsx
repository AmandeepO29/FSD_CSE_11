import {
  Briefcase,
  Building2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/siteConfig';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = isAdmin
    ? [
        { to: '/admin', label: 'Overview & Analytics', icon: LayoutDashboard, end: true },
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/companies', label: 'Companies', icon: Building2 },
        { to: '/admin/drives', label: 'Placement Drives', icon: Briefcase },
        { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
      ]
    : [
        { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/student/drives', label: 'Placement Drives', icon: Briefcase },
        { to: '/student/applications', label: 'My Applications', icon: ClipboardList },
        { to: '/student/profile', label: 'My Profile & Resume', icon: UserCheck },
      ];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/80'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90">
      <div className="px-5 h-16 flex items-center justify-between border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{SITE_CONFIG.appName}</p>
            <p className="text-[11px] font-semibold text-indigo-600 truncate">{SITE_CONFIG.institutionName}</p>
          </div>
        </Link>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-4 flex-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isAdmin ? 'Admin Portal' : 'Student Portal'}
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={navLinkClass}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-3">
        <div className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
          <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {user?.role}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 max-w-[80vw] h-full z-10">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-semibold text-slate-900 truncate">
                {SITE_CONFIG.institutionName}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline text-xs text-slate-500 truncate">
                {SITE_CONFIG.appSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs font-medium text-slate-500 hover:text-indigo-600">
              Public Portal
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200/80 bg-white px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Developed &amp; Maintained By: <strong className="text-slate-700 font-medium">{SITE_CONFIG.teamLine}</strong> ({SITE_CONFIG.teamCredit})
          </span>
          <span>{SITE_CONFIG.copyright}</span>
        </footer>
      </div>
    </div>
  );
}
