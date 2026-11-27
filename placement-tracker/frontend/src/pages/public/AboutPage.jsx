import { Award, CheckCircle2, Layers, Shield, Target, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import PublicNavbar from '../../components/layout/PublicNavbar';
import { SITE_CONFIG } from '../../config/siteConfig';

export default function AboutPage() {
  const objectives = [
    'Digitize campus recruitment workflows and replace fragmented spreadsheets with a centralized MySQL-backed portal.',
    'Provide transparent, automated eligibility evaluation based on CGPA, active backlogs, branch, and passing year.',
    'Enable real-time status tracking with complete application audit history from application to final selection.',
    'Empower placement coordinators at ABESEC Ghaziabad with branch-wise, company-wise, and package analytics.',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full space-y-10">
        <div className="card-surface p-8 sm:p-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            About {SITE_CONFIG.appName}
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Modernizing Campus Placements at {SITE_CONFIG.institutionName}
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Placement Tracker is a full-stack campus placement management system engineered with Spring Boot 3,
            MySQL 8, and React. It connects students and the Training &amp; Placement Cell through a secure,
            role-based platform that simplifies company onboarding, drive publishing, eligibility verification,
            resume management, and placement analytics.
          </p>
        </div>

        <div className="card-surface p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Project Objectives</h2>
          </div>
          <ul className="space-y-3">
            {objectives.map((obj) => (
              <li key={obj} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-surface p-7">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Benefits for Students</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Instant visibility into eligible and upcoming campus drives.</li>
              <li>• Clear feedback when academic criteria are not met.</li>
              <li>• Secure PDF resume upload stored persistently in the database.</li>
              <li>• Real-time application timeline with full status history.</li>
            </ul>
          </div>

          <div className="card-surface p-7">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Benefits for Administrators</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Centralized management of students, companies, and drives.</li>
              <li>• Advanced search and filtering across branches and batches.</li>
              <li>• One-click application status progression with remarks.</li>
              <li>• Interactive placement analytics and package metrics.</li>
            </ul>
          </div>
        </div>

        <div className="card-surface p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-indigo-600 text-white border-indigo-600">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Get Started</span>
            </div>
            <h3 className="mt-1 text-xl font-bold">Ready to access the placement portal?</h3>
            <p className="mt-1 text-sm text-indigo-100">
              Sign in with your campus account or register as a student to explore active drives.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/login" className="px-4 py-2.5 rounded-lg bg-white text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-4 py-2.5 rounded-lg bg-indigo-500 text-white border border-indigo-400 text-sm font-semibold hover:bg-indigo-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
