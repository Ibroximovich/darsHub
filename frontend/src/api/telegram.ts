import api from '../services/api';

export const telegramApi = {
  // GET /api/telegram/status
  getStatus: async (): Promise<{ connected: boolean }> => {
    const response = await api.get('/telegram/status');
    return response.data;
  },

  // GET /api/telegram/connect-link
  getConnectLink: async (): Promise<{ link: string }> => {
    const response = await api.get('/telegram/connect-link');
    return response.data;
  },

  // DELETE /api/telegram/disconnect
  disconnect: async (): Promise<void> => {
    await api.delete('/telegram/disconnect');
  },
};
