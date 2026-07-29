import api from '../services/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GroupPaymentItem {
  paymentId: string;
  groupStudentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  phone: string;
  period: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paidAt: string | null;
}

export interface PaymentsSummary {
  totalExpected: number;
  totalPaid: number;
  totalUnpaid: number;
  paidStudents: Array<{
    firstName: string;
    lastName: string;
    groupName: string;
    amount: number;
    paidAt: string | null;
  }>;
  unpaidStudents: Array<{
    firstName: string;
    lastName: string;
    groupName: string;
    amount: number;
    phone: string;
  }>;
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const paymentsApi = {
  // GET /api/groups/:groupId/payments?period=xxx — Guruhning davr uchun to'lov holati
  getGroupPayments: async (
    groupId: string,
    period?: string
  ): Promise<GroupPaymentItem[]> => {
    const response = await api.get(`/groups/${groupId}/payments`, {
      params: period ? { period } : undefined,
    });
    return response.data.payments || [];
  },

  // PATCH /api/payments/:id — To'lov holatini almashtirish
  updatePaymentStatus: async (
    paymentId: string,
    status: 'paid' | 'unpaid'
  ): Promise<any> => {
    const response = await api.patch(`/payments/${paymentId}`, { status });
    return response.data.payment;
  },

  // GET /api/payments/summary?period=YYYY-MM — Umumiy statistika
  getPaymentsSummary: async (period?: string): Promise<PaymentsSummary> => {
    const response = await api.get('/payments/summary', {
      params: period ? { period } : undefined,
    });
    return response.data.summary;
  },
};
