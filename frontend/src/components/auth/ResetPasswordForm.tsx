import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { MailOutlined, SafetyOutlined, LockOutlined, KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error.utils';
import type { ResetPasswordPayload } from '../../types/auth.types';

export const ResetPasswordForm: React.FC = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';

  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onFinish = async (values: ResetPasswordPayload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.resetPassword(values);
      if (response.success) {
        message.success('Parolingiz muvaffaqiyatli yangilandi! Tizimga kiring.');
        navigate('/login');
      }
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "Parolni yangilashda xatolik yuz berdi. Kodni qayta tekshiring."
      );
      setErrorMsg(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const currentEmail = form.getFieldValue('email') || initialEmail;
    if (!currentEmail) {
      setErrorMsg('Iltimos, avval email manzilingizni kiriting!');
      return;
    }
    setResending(true);
    setErrorMsg(null);
    try {
      const response = await authService.resendResetCode({ email: currentEmail });
      if (response.success) {
        message.success('Yangi tiklash kodi emailingizga yuborildi!');
      }
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        'Kodni qayta yuborishda xatolik yuz berdi.'
      );
      setErrorMsg(msg);
      message.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-2">
      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMsg(null)}
          className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs py-1.5 px-3 mb-2"
        />
      )}

      <Form
        form={form}
        name="reset_password_form"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ email: initialEmail }}
        autoComplete="off"
        disabled={loading || resending}
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-slate-300 text-xs">Email pochta</span>}
          name="email"
          className="mb-2"
          rules={[
            { required: true, message: 'Email manzilingizni kiriting!' },
            { type: 'email', message: 'Email formati noto\'g\'ri!' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="ali@example.com"
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-xs h-9"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-slate-300 text-xs">6 xonali tiklash kodi</span>}
          name="code"
          className="mb-2"
          rules={[
            { required: true, message: 'Tiklash kodini kiriting!' },
            { len: 6, message: 'Kod aynan 6 xonali bo\'lishi kerak!' },
          ]}
        >
          <Input
            prefix={<SafetyOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="123456"
            maxLength={6}
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-center font-mono tracking-widest text-base font-bold h-9"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-slate-300 text-xs">Yangi parol</span>}
          name="newPassword"
          className="mb-3"
          rules={[
            { required: true, message: 'Yangi parol kiritishingiz shart!' },
            { min: 6, message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="••••••••"
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-xs h-9"
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={!loading && <KeyOutlined />}
            className="h-9 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg border-none shadow-md shadow-indigo-600/30 transition-all duration-200"
          >
            {loading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
          </Button>
        </Form.Item>

        <div className="text-center pt-0.5 pb-1">
          <Button
            type="link"
            loading={resending}
            icon={<ReloadOutlined />}
            onClick={handleResendCode}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Kodni qayta yuborish
          </Button>
        </div>

        <div className="text-center text-xs text-slate-400 pt-0.5">
          Orqaga qaytish?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Tizimga kirish
          </Link>
        </div>
      </Form>
    </div>
  );
};
