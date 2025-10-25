import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Wallet, Smartphone, Building } from "lucide-react";

type PaymentMethod = 'flutterwave' | 'crypto' | null;

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (method: 'flutterwave' | 'crypto') => void;
  isLoading?: boolean;
}

export function PaymentMethodModal({ isOpen, onClose, onSelect, isLoading }: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  const handleContinue = () => {
    if (selectedMethod) {
      onSelect(selectedMethod);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Select Payment Method</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how you would like to complete your purchase
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup 
            value={selectedMethod || ''} 
            onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-4 p-4 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="flutterwave" id="flutterwave" className="h-5 w-5" />
              <div className="flex-1">
                <Label htmlFor="flutterwave" className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <Smartphone className="h-5 w-5 text-green-500" />
                      <Building className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="font-medium">Fiat Payment</div>
                      <div className="text-sm text-muted-foreground">Cards • Mobile Money • Bank Transfer</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 font-medium">Africa-wide</div>
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer">
              <RadioGroupItem value="crypto" id="crypto" className="h-5 w-5" />
              <div className="flex-1">
                <Label htmlFor="crypto" className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-medium">Crypto Payment</div>
                      <div className="text-sm text-muted-foreground">ETH • USDT • USDC</div>
                    </div>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">WalletConnect</div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedMethod || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Continue to Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
