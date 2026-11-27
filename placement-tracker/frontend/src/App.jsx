import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { AuthProvider } from './context/AuthContext';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminCompaniesPage from './pages/admin/AdminCompaniesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDrivesPage from './pages/admin/AdminDrivesPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AboutPage from './pages/public/AboutPage';
import HomePage from './pages/public/HomePage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentDrivesPage from './pages/student/StudentDrivesPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/students" element={<AdminStudentsPage />} />
              <Route path="/admin/companies" element={<AdminCompaniesPage />} />
              <Route path="/admin/drives" element={<AdminDrivesPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            </Route>
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboardPage />} />
              <Route path="/student/drives" element={<StudentDrivesPage />} />
              <Route path="/student/applications" element={<StudentApplicationsPage />} />
              <Route path="/student/profile" element={<StudentProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
