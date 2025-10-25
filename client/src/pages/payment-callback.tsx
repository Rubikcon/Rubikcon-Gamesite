import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentCallback() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transaction_id');
    const txRef = urlParams.get('tx_ref');
    const status = urlParams.get('status');

    if (status === 'successful' && transactionId && txRef) {
      verifyPayment(transactionId, txRef);
    } else if (status === 'cancelled') {
      setStatus('failed');
      setMessage('Payment was cancelled');
    } else {
      setStatus('failed');
      setMessage('Payment verification failed');
    }
  }, []);

  const verifyPayment = async (transactionId: string, txRef: string) => {
    try {
      const response = await apiRequest('POST', '/api/payment/flutterwave/verify', {
        transaction_id: transactionId,
        tx_ref: txRef
      });

      if (response.success) {
        setStatus('success');
        setMessage('Payment verified successfully!');
        toast({
          title: "Payment Successful",
          description: "Your order has been confirmed.",
        });
      } else {
        setStatus('failed');
        setMessage('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage('Failed to verify payment');
      toast({
        title: "Verification Error",
        description: "Could not verify your payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (status === 'verifying') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button onClick={() => setLocation('/')} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button onClick={() => setLocation('/checkout')} className="w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/')}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}