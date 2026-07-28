import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error.utils';
import type { LoginPayload } from '../../types/auth.types';

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: LoginPayload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.login(values);
      if (response.success) {
        message.success('Tizimga muvaffaqiyatli kirdingiz!');
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        'Tizimga kirishda xatolik yuz berdi. Email va parolingizni tekshiring.'
      );
      setErrorMsg(msg);
      message.error(msg);

      if (err.response?.status === 403) {
        navigate('/verify-email', { state: { email: values.email } });
      }
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
          className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs py-1.5 px-3"
        />
      )}

      <Form
        name="login_form"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        disabled={loading}
        requiredMark={false}
        className="space-y-1"
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
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-sm h-10"
          />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex justify-between items-center w-full gap-2">
              <span className="font-medium text-slate-300 text-xs">Parol</span>
              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
              >
                Parolni unutdingizmi?
              </Link>
            </div>
          }
          name="password"
          className="mb-4"
          rules={[{ required: true, message: 'Parolingizni kiriting!' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-indigo-400 text-sm mr-1" />}
            placeholder="••••••••"
            className="rounded-lg bg-slate-950 border-slate-700 text-slate-100 text-sm h-10"
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={!loading && <ArrowRightOutlined />}
            className="h-10 text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg border-none shadow-md shadow-indigo-600/30 transition-all duration-200"
          >
            {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
          </Button>
        </Form.Item>

        <div className="text-center text-xs text-slate-400 pt-1">
          Hisobingiz yo'qmi?{' '}
          <Link
            to="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
          >
            Ro'yxatdan o'ting
          </Link>
        </div>
      </Form>
    </div>
  );
};
