import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1', // Indigo 500
          colorBgContainer: '#0f172a', // Slate 900
          colorBgElevated: '#1e293b', // Slate 800
          colorBorder: '#334155', // Slate 700
          borderRadius: 10,
          controlHeight: 40,
          fontSize: 14,
          fontFamily:
            "Plus Jakarta Sans, Inter, system-ui, -apple-system, sans-serif",
        },
        components: {
          Form: {
            itemMarginBottom: 16,
          },
          Input: {
            colorBgContainer: '#0b0f19',
            activeBorderColor: '#6366f1',
            hoverBorderColor: '#818cf8',
          },
          Button: {
            colorPrimary: '#6366f1',
            colorPrimaryHover: '#4f46e5',
            fontWeight: 700,
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
