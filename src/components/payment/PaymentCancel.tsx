import React from 'react';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

export const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Canceled
            </h1>
            
            <p className="text-gray-600 mb-8">
              Your payment was canceled. No charges were made to your account.
            </p>

            <div className="flex flex-col gap-4">
              <Button 
                variant="primary" 
                size="lg"
                icon={CreditCard}
                onClick={() => window.location.href = '/products'}
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                icon={ArrowLeft}
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Need help? Contact our support team for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};