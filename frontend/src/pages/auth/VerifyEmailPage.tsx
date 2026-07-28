import React from 'react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { VerifyEmailForm } from '../../components/auth/VerifyEmailForm';

export const VerifyEmailPage: React.FC = () => {
  return (
    <AuthLayout
      title="Emailni tasdiqlash"
      subtitle="Emailingizga yuborilgan 6 xonali maxfiylik kodini kiriting"
    >
      <VerifyEmailForm />
    </AuthLayout>
  );
};
