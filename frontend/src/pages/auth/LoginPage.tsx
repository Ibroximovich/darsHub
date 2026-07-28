import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { LoginForm } from '../../components/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout title="Tizimga kirish">
      <LoginForm />
    </AuthLayout>
  );
};
