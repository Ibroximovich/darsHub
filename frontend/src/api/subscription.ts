import api from '../services/api';

export interface SubscriptionStatus {
  status: 'trial' | 'active' | 'expired';
  trialEndsAt: string;
  subscriptionExpiresAt: string | null;
  daysLeft: number;
  isAdmin: boolean;
}

export const subscriptionApi = {
  // GET /api/subscription/status
  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await api.get('/subscription/status');
    return response.data.data;
  },
};
