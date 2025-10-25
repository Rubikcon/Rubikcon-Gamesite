import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BackButton from "@/components/back-button";

interface FlutterwavePaymentProps {
  orderData?: any;
}

export default function FlutterwavePayment({ orderData }: FlutterwavePaymentProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'initializing' | 'pending' | 'success' | 'failed'>('initializing');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    if (orderData) {
      initializePayment();
    }
  }, [orderData]);

  const initializePayment = async () => {
    try {
      const response = await apiRequest('POST', '/api/payment/flutterwave/initialize', {
        orderData
      });

      setPaymentUrl(response.paymentUrl);
      setOrderId(response.orderId);
      setPaymentStatus('pending');

      // Redirect to Flutterwave payment page
      window.location.href = response.paymentUrl;
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setPaymentStatus('failed');
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    setPaymentStatus('initializing');
    initializePayment();
  };

  if (paymentStatus === 'initializing') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Initializing Payment</h2>
              <p className="text-muted-foreground">
                Setting up your secure payment with Flutterwave...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'pending') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Redirecting to Payment</h2>
              <p className="text-muted-foreground mb-6">
                You're being redirected to Flutterwave to complete your payment securely.
              </p>
              <Button onClick={() => window.location.href = paymentUrl} className="w-full">
                Continue to Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <BackButton fallbackUrl="/checkout" />
          <Card className="mt-4">
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't process your payment. Please try again.
              </p>
              <div className="space-y-3">
                <Button onClick={handleRetry} className="w-full">
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation('/checkout')}
                  className="w-full"
                >
                  Back to Checkout
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
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your order has been confirmed and will be processed shortly.
            </p>
            <Button onClick={() => setLocation('/')} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}