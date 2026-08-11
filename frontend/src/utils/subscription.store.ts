import { create } from 'zustand';

interface SubscriptionStore {
  subscriptionRequired: boolean;
  setSubscriptionRequired: (value: boolean) => void;
  clearSubscriptionRequired: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscriptionRequired: false,
  setSubscriptionRequired: (value) => set({ subscriptionRequired: value }),
  clearSubscriptionRequired: () => set({ subscriptionRequired: false }),
}));
