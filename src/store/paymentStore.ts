import { create } from 'zustand';
import { getUserPurchases, getUserSubscription, hasUserPurchasedApp } from '../lib/stripe';

interface PaymentState {
  purchases: any[];
  subscription: any | null;
  purchasedApps: Set<string>;
  loading: boolean;
  
  // Actions
  fetchPurchases: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  checkAppPurchase: (appId: string) => Promise<boolean>;
  addPurchasedApp: (appId: string) => void;
  refreshPaymentData: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  purchases: [],
  subscription: null,
  purchasedApps: new Set(),
  loading: false,

  fetchPurchases: async () => {
    set({ loading: true });
    try {
      const purchases = await getUserPurchases();
      const purchasedApps = new Set(
        purchases
          .filter(p => p.status === 'completed')
          .map(p => p.app.id)
      );
      
      set({ purchases, purchasedApps });
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchSubscription: async () => {
    try {
      const subscription = await getUserSubscription();
      set({ subscription });
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  },

  checkAppPurchase: async (appId: string) => {
    try {
      const { hasPurchased } = await hasUserPurchasedApp(appId);
      if (hasPurchased) {
        set(state => ({
          purchasedApps: new Set([...state.purchasedApps, appId])
        }));
      }
      return hasPurchased;
    } catch (error) {
      console.error('Error checking app purchase:', error);
      return false;
    }
  },

  addPurchasedApp: (appId: string) => {
    set(state => ({
      purchasedApps: new Set([...state.purchasedApps, appId])
    }));
  },

  refreshPaymentData: async () => {
    const { fetchPurchases, fetchSubscription } = get();
    await Promise.all([
      fetchPurchases(),
      fetchSubscription()
    ]);
  },
}));