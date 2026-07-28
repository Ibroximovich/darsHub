import React, { useState } from 'react';
import { Form, Input, Button, Alert, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error.utils';
import type { RegisterPayload } from '../../types/auth.types';

export const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterPayload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await authService.register(values);
      if (response.success) {
        message.success("Ro'yxatdan o'tildi! Emailingizga tasdiqlash kodi yuborildi.");
        navigate('/verify-email', { state: { email: values.email } });
      }
    } catch (err: any) {
      const msg = getErrorMessage(
        err,
        "Ro'yxatdan o'tishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
      setErrorMsg(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      {errorMsg && (
        <Alert
          message={errorMsg}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMsg(null)}
          className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs py-1 px-2.5 mb-1"
        />
      )}

      <Form
        name="register_form"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        disabled={loading}
        requiredMark={false}
      >
        <Form.Item
          label={<span className="font-medium text-slate-300 text-[11px]">F.I.SH (Ism familiyangiz)</span>}
          name="fullName"
          className="mb-1.5"
          rules={[
            { required: true, message: 'Ism va familiyangizni kiriting!' },
            { min: 2, message: 'Ism kamida 2 belgidan iborat bo\'lishi kerak!' },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="Ali Valiyev"
            className="rounded-lg bg-slate-950 border-slate-800 text-slate-100 text-xs h-9"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-slate-300 text-[11px]">Email pochta</span>}
          name="email"
          className="mb-1.5"
          rules={[
            { required: true, message: 'Email manzilingizni kiriting!' },
            { type: 'email', message: 'Email formati noto\'g\'ri!' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="ali@example.com"
            className="rounded-lg bg-slate-950 border-slate-800 text-slate-100 text-xs h-9"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-slate-300 text-[11px]">Telefon raqam</span>}
          name="phone"
          className="mb-1.5"
          rules={[
            { required: true, message: 'Telefon raqamingizni kiriting!' },
            {
              pattern: /^\+998\d{9}$/,
              message: 'Format: +998XXXXXXXXX ko\'rinishida bo\'lishi kerak!',
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="+998901234567"
            className="rounded-lg bg-slate-950 border-slate-800 text-slate-100 text-xs h-9"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-slate-300 text-[11px]">Parol</span>}
          name="password"
          className="mb-3"
          rules={[
            { required: true, message: 'Parol yaratishingiz shart!' },
            { min: 6, message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-indigo-400 text-xs mr-1" />}
            placeholder="••••••••"
            className="rounded-lg bg-slate-950 border-slate-800 text-slate-100 text-xs h-9"
          />
        </Form.Item>

        <Form.Item className="mb-2">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={!loading && <CheckCircleOutlined />}
            className="h-9 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg border-none shadow-md shadow-indigo-600/20 transition-all duration-200"
          >
            {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
          </Button>
        </Form.Item>

        <div className="text-center text-[11px] text-slate-400 pt-0.5">
          Allaqachon hisobingiz bormi?{' '}
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
