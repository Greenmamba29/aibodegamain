import { create } from 'zustand';
import { getUserPurchases, getUserSubscription, hasUserPurchasedApp } from '../lib/stripe';
import { purchaseApp as purchaseAppApi, checkIfPurchased } from '../lib/supabase';
import { toast } from 'react-hot-toast';

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
  purchaseApp: (appId: string) => Promise<boolean>;
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
      // First check local state
      if (get().purchasedApps.has(appId)) {
        return true;
      }
      
      // Then check with API
      const { isPurchased } = await checkIfPurchased(appId);
      if (isPurchased) {
        set(state => ({
          purchasedApps: new Set([...state.purchasedApps, appId])
        }));
      }
      
      // Fallback to Stripe check
      if (!isPurchased) {
        const { hasPurchased } = await hasUserPurchasedApp(appId);
        if (hasPurchased) {
          set(state => ({
            purchasedApps: new Set([...state.purchasedApps, appId])
          }));
        }
        return hasPurchased;
      }
      
      return isPurchased;
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
  
  purchaseApp: async (appId: string) => {
    try {
      const { data, error } = await purchaseAppApi(appId);
      
      if (error) throw error;
      
      if (data) {
        set(state => ({
          purchasedApps: new Set([...state.purchasedApps, appId])
        }));
        
        toast.success('App purchased successfully!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error purchasing app:', error);
      toast.error('Failed to purchase app. Please try again.');
      return false;
    }
  },

  refreshPaymentData: async () => {
    const { fetchPurchases, fetchSubscription } = get();
    await Promise.all([
      fetchPurchases(),
      fetchSubscription()
    ]);
  },
}));