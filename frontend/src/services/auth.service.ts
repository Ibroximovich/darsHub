import api from './api';
import type {
  ApiResponse,
  RegisterPayload,
  VerifyEmailPayload,
  ResendCodePayload,
  LoginPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../types/auth.types';

export const authService = {
  // POST /api/auth/register
  register: async (data: RegisterPayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // POST /api/auth/verify-email
  verifyEmail: async (data: VerifyEmailPayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/verify-email', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  // POST /api/auth/resend-code
  resendCode: async (data: ResendCodePayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/resend-code', data);
    return response.data;
  },

  // POST /api/auth/login
  login: async (data: LoginPayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/login', data);
    console.log(response.data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (data: ForgotPasswordPayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // POST /api/auth/reset-password
  resetPassword: async (data: ResetPasswordPayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // POST /api/auth/resend-reset-code
  resendResetCode: async (data: ForgotPasswordPayload): Promise<ApiResponse> => {
    const response = await api.post('/auth/resend-reset-code', data);
    return response.data;
  },

  // POST /api/auth/logout
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    return response.data;
  },

  // GET /api/auth/me
  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // PUT /api/auth/profile
  updateProfile: async (data: { fullName: string; phone?: string }): Promise<ApiResponse> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};
