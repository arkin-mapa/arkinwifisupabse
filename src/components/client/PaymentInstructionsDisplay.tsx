import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CreditCard, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentInstructionsDisplayProps {
  instructions: {
    bank: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    planName: string;
  };
  className?: string;
}

const PaymentInstructionsDisplay = ({ instructions, className }: PaymentInstructionsDisplayProps) => {
  return (
    <Card className={cn("bg-white/50 backdrop-blur-sm border-yellow-100/50", className)}>
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Info className="h-5 w-5 text-yellow-600" />
        <CardTitle className="text-lg font-medium text-yellow-800">Payment Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-yellow-50/50 p-4 backdrop-blur-sm border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-800 font-medium mb-3">
            <CreditCard className="h-4 w-4" />
            <span>Bank Transfer Details</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bank</span>
              <span className="font-medium">{instructions.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Number</span>
              <span className="font-medium font-mono">{instructions.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Name</span>
              <span className="font-medium">{instructions.accountName}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50/50 p-4 backdrop-blur-sm border border-yellow-100">
          <div className="flex items-center gap-2 text-yellow-800 font-medium mb-3">
            <Clock className="h-4 w-4" />
            <span>Payment Details</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">{instructions.planName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount to Pay</span>
              <span className="font-medium">₱{instructions.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInstructionsDisplay;