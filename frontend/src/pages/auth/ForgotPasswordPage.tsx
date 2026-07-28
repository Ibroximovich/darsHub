import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Parolni unutdingizmi?"
      subtitle="Parolingizni tiklash uchun e-mail manzilingizni kiriting"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
