import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TransferCredits } from "./TransferCredits";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { QRCodeScanner } from "./QRCodeScanner";
import { CreditRequestStatus } from "./CreditRequestStatus";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, QrCode, Send } from "lucide-react";

export const CreditBalanceCard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: credits, error } = await supabase
        .from('credits')
        .select('amount, transaction_type');

      if (error) throw error;

      const totalBalance = credits.reduce((acc, credit) => {
        return credit.transaction_type === 'deposit' 
          ? acc + Number(credit.amount) 
          : acc - Number(credit.amount);
      }, 0);

      setBalance(totalBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error("Failed to fetch credit balance");
    }
  };

  const handleTopUp = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Please log in to top up credits");
        return;
      }

      const topUpAmount = parseFloat(amount);
      if (isNaN(topUpAmount) || topUpAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const { error } = await supabase
        .from('credit_purchases')
        .insert({
          client_id: session.session.user.id,
          amount: topUpAmount,
          status: 'pending'
        });

      if (error) throw error;

      setIsTopUpOpen(false);
      setAmount("");
      toast.success("Top-up request submitted successfully");
    } catch (error: any) {
      console.error('Error submitting top-up request:', error);
      toast.error(error.message || "Failed to submit top-up request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CreditRequestStatus />
      <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ₱{balance.toFixed(2)}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsTopUpOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Top Up
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4"
                onClick={() => document.getElementById('transferCreditsBtn')?.click()}
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4"
                onClick={() => document.getElementById('scanQRBtn')?.click()}
              >
                <QrCode className="h-4 w-4" />
                <span>Scan QR</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="hidden">
        <TransferCredits />
        <QRCodeGenerator />
        <QRCodeScanner />
      </div>

      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top Up Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              onClick={handleTopUp}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};