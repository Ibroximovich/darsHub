import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { SafetyOutlined, MailOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error.utils';

export const VerifyEmailForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';
  const devCode = location.state?.devCode || '';

  const [email, setEmail] = useState<string>(initialEmail);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onFinish = async (values: { email: string; code: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.verifyEmail(values);
      if (response.success) {
        message.success('Email muvaffaqiyatli tasdiqlandi!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        'Tasdiqlash kodida xatolik yuz berdi. Qayta urinib ko\'ring.'
      );
      setErrorMsg(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      const msg = 'Iltimos, avval email manzilingizni kiriting!';
      setErrorMsg(msg);
      message.error(msg);
      return;
    }
    setResending(true);
    setErrorMsg(null);
    try {
      const response = await authService.resendCode({ email });
      if (response.success) {
        message.success('Yangi tasdiqlash kodi emailingizga yuborildi!');
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
    <div className="space-y-3">
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
        name="verify_email_form"
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ email, code: devCode }}
        autoComplete="off"
        disabled={loading || resending}
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-slate-300 text-xs">Email pochta</span>}
          name="email"
          className="mb-3"
          rules={[
            { required: true, message: 'Email manzilingizni kiriting!' },
            { type: 'email', message: 'Email formati noto\'g\'ri!' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-indigo-400 text-sm mr-1" />}
            placeholder="ali@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-sm h-10"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-slate-300 text-xs">6 xonali tasdiqlash kodi</span>}
          name="code"
          className="mb-4"
          rules={[
            { required: true, message: 'Tasdiqlash kodini kiriting!' },
            { len: 6, message: 'Kod aynan 6 ta raqamdan iborat bo\'lishi kerak!' },
          ]}
        >
          <Input
            prefix={<SafetyOutlined className="text-indigo-400 text-sm mr-1" />}
            placeholder="123456"
            maxLength={6}
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-center font-mono tracking-widest text-lg font-bold h-10"
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={!loading && <CheckOutlined />}
            className="h-10 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg border-none shadow-md shadow-indigo-600/30 transition-all duration-200"
          >
            {loading ? 'Tasdiqlanmoqda...' : 'Emailni tasdiqlash'}
          </Button>
        </Form.Item>

        <div className="text-center pt-1">
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
      </Form>
    </div>
  );
};
