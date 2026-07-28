import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error.utils';

export const ForgotPasswordForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.forgotPassword(values);
      if (response.success) {
        message.success('Parolni tiklash kodi emailingizga yuborildi!');
        navigate('/reset-password', { state: { email: values.email } });
      }
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "So'rov yuborishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
      setErrorMsg(msg);
      message.error(msg);
    } finally {
      setLoading(false);
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
        name="forgot_password_form"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        disabled={loading}
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-slate-300 text-xs">Email pochta</span>}
          name="email"
          className="mb-4"
          rules={[
            { required: true, message: 'Email manzilingizni kiriting!' },
            { type: 'email', message: 'Email formati noto\'g\'ri!' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-indigo-400 text-sm mr-1" />}
            placeholder="ali@example.com"
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-sm h-10"
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={!loading && <SendOutlined />}
            className="h-10 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg border-none shadow-md shadow-indigo-600/30 transition-all duration-200"
          >
            {loading ? 'Yuborilmoqda...' : 'Tiklash kodini yuborish'}
          </Button>
        </Form.Item>

        <div className="text-center text-xs text-slate-400 pt-1">
          Esingizga tushdimi?{' '}
          <Link
            to="/login"
            className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Tizimga kiring
          </Link>
        </div>
      </Form>
    </div>
  );
};
