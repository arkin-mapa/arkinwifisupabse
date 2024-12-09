import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

interface PaymentMethodInstructionsProps {
  method: "cash" | "gcash" | "paymaya";
}

const PaymentMethodInstructions = ({ method }: PaymentMethodInstructionsProps) => {
  const getInstructions = () => {
    switch (method) {
      case "gcash":
        return {
          bank: "GCash",
          accountNumber: "0917 123 4567",
          accountName: "WiFi Services",
          instructions: "Send payment via GCash and upload your payment screenshot for faster verification."
        };
      case "paymaya":
        return {
          bank: "PayMaya",
          accountNumber: "0918 123 4567",
          accountName: "WiFi Services",
          instructions: "Send payment via PayMaya and upload your payment screenshot for faster verification."
        };
      case "cash":
        return {
          bank: "Cash Payment",
          accountNumber: "N/A",
          accountName: "WiFi Services",
          instructions: "Visit our office to make the cash payment. Your voucher will be provided immediately after payment."
        };
    }
  };

  const details = getInstructions();

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-primary/10">
      <CardContent className="pt-6">
        <div className="flex items-start gap-2 mb-4">
          <Info className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium text-sm text-primary">Payment Instructions</p>
            <p className="text-sm text-muted-foreground mt-1">{details.instructions}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          {method !== "cash" && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name</span>
                <span className="font-medium">{details.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-medium font-mono">{details.accountNumber}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodInstructions;