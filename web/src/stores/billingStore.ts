import { create } from 'zustand';

interface BillingState {
  isPastDue: boolean;
  capitalAtRisk: number;
  setPastDue: (status: boolean) => void;
  setCapitalAtRisk: (amount: number) => void;
  resetBilling: () => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  isPastDue: false,
  capitalAtRisk: 0,
  setPastDue: (status) => set({ isPastDue: status }),
  setCapitalAtRisk: (amount) => set({ capitalAtRisk: amount }),
  resetBilling: () => set({ isPastDue: false, capitalAtRisk: 0 }),
}));
