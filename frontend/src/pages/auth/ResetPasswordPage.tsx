import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Parolni yangilash"
      subtitle="Emailingizga kelgan kod va yangi parolingizni kiriting"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};
