import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { GroupsPage } from './pages/dashboard/GroupsPage';
import { GroupDetailPage } from './pages/dashboard/GroupDetailPage';
import { StudentsPage } from './pages/dashboard/StudentsPage';
import { StudentProfilePage } from './pages/dashboard/StudentProfilePage';
import { UserProfilePage } from './pages/dashboard/UserProfilePage';
import { AttendancePage } from './pages/dashboard/AttendancePage';
import { PaymentsPage } from './pages/dashboard/PaymentsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Admin Layout & Pages
import { AdminLayout } from './layouts/AdminLayout';
import { AdminStatsPage } from './pages/admin/AdminStatsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminGroupsPage } from './pages/admin/AdminGroupsPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0F766E',
          borderRadius: 10,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/groups" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Tutor Dashboard Nested Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/groups" replace />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="groups/:id" element={<GroupDetailPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/:studentId" element={<StudentProfilePage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Panel Nested Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminStatsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="groups" element={<AdminGroupsPage />} />
            <Route path="students" element={<AdminStudentsPage />} />
            <Route path="payments" element={<AdminPaymentsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard/groups" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
