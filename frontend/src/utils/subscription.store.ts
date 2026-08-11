import { useSyncExternalStore } from 'react';

type Listener = (val: boolean) => void;

let subscriptionRequiredState = false;
const listeners = new Set<Listener>();

export const subscriptionStore = {
  get: (): boolean => subscriptionRequiredState,
  set: (val: boolean): void => {
    subscriptionRequiredState = val;
    listeners.forEach((listener) => listener(val));
  },
  clear: (): void => {
    subscriptionRequiredState = false;
    listeners.forEach((listener) => listener(false));
  },
  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSubscriptionRequired(): boolean {
  return useSyncExternalStore(
    subscriptionStore.subscribe,
    subscriptionStore.get,
    subscriptionStore.get
  );
}
