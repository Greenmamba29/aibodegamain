import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { createCheckoutSession, hasUserPurchasedApp } from '../../lib/stripe';
import { App } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { usePaymentStore } from '../../store/paymentStore';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: App;
  onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  app,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const { user } = useAuthStore();
  const { addPurchasedApp } = usePaymentStore();

  useEffect(() => {
    if (isOpen && app.id) {
      checkPurchaseStatus();
    }
  }, [isOpen, app.id]);

  const checkPurchaseStatus = async () => {
    setLoading(true);
    try {
      const { hasPurchased } = await hasUserPurchasedApp(app.id);
      setHasPurchased(hasPurchased);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Create a checkout session with Stripe
      const { url } = await createCheckoutSession(app);
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        // For demo purposes, simulate a successful purchase
        setTimeout(() => {
          // Add to purchased apps
          addPurchasedApp(app.id);
          
          // Show success message
          setHasPurchased(true);
          toast.success(`You've successfully purchased ${app.title}!`);
          
          // Call success callback
          if (onSuccess) {
            onSuccess();
          }
          
          // Close modal after a delay
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasPurchased ? 'Already Purchased' : 'Purchase App'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Checking purchase status...</p>
            </div>
          ) : hasPurchased ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Already Purchased!</h3>
              <p className="text-gray-600 mb-6">You already own this app. You can access it anytime.</p>
              <Button onClick={() => window.open(app.app_url, '_blank')}>
                Open App
              </Button>
            </div>
          ) : (
            <>
              {/* App Details */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  {app.logo_url ? (
                    <img src={app.logo_url} alt={app.title} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <span className="text-purple-600 font-semibold text-lg">{app.title.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{app.title}</h3>
                  <p className="text-sm text-gray-600">{app.description}</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">${app.price}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <Lock className="w-4 h-4" />
                <span>Secured by Stripe</span>
              </div>

              {/* Demo Payment Form */}
              <div className="space-y-4 mb-6">
                <Input
                  label="Card Number"
                  value="4242 4242 4242 4242"
                  disabled
                  placeholder="Card number"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    value="12/25"
                    disabled
                    placeholder="MM/YY"
                  />
                  <Input
                    label="CVC"
                    value="123"
                    disabled
                    placeholder="CVC"
                  />
                </div>
                
                <Input
                  label="Name on Card"
                  value="Demo User"
                  disabled
                  placeholder="Name on card"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                  {error}
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                className="w-full"
                loading={processing}
                onClick={handlePayment}
                icon={CreditCard}
              >
                {processing ? 'Processing...' : `Pay $${app.price}`}
              </Button>

              <div className="mt-6 text-xs text-gray-500 text-center">
                <p>By purchasing, you agree to our Terms of Service and Privacy Policy.</p>
                <p className="mt-1">This is a demo payment. No actual charges will be made.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};