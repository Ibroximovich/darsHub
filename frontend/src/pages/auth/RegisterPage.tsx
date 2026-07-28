import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { RegisterForm } from '../../components/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <AuthLayout title="Ro'yxatdan o'tish">
      <RegisterForm />
    </AuthLayout>
  );
};
