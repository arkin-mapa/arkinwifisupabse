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
import { useIsMobile } from "@/hooks/use-mobile";

export const CreditBalanceCard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchBalance();
    
    // Subscribe to ALL changes on the credits table
    const channel = supabase
      .channel('credit-balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'credits',
          filter: `client_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('Credits changed:', payload);
          fetchBalance(); // Refresh balance when any change occurs
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.log('No authenticated user found');
        return;
      }

      const { data: credits, error } = await supabase
        .from('credits')
        .select('amount, transaction_type')
        .eq('client_id', session.session.user.id);

      if (error) {
        console.error('Error fetching balance:', error);
        throw error;
      }

      const totalBalance = credits.reduce((acc, credit) => {
        return credit.transaction_type === 'deposit' 
          ? acc + Number(credit.amount) 
          : acc - Number(credit.amount);
      }, 0);

      console.log('New balance calculated:', totalBalance);
      setBalance(totalBalance);
    } catch (error) {
      console.error('Error in fetchBalance:', error);
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
        <CardContent className={`p-4 ${isMobile ? 'space-y-4' : 'p-6'}`}>
          <div className="flex flex-col space-y-4">
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
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
                className={`bg-purple-600 hover:bg-purple-700 text-white ${isMobile ? 'w-full' : ''}`}
              >
                Top Up
              </Button>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4"
                onClick={() => setIsQRGeneratorOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                <span>Show QR</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4"
                onClick={() => setIsQRScannerOpen(true)}
              >
                <Send className="h-4 w-4" />
                <span>Scan & Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className={`${isMobile ? 'w-[95vw] rounded-lg' : 'sm:max-w-md'}`}>
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

      {/* QR Code Generator Dialog */}
      {isQRGeneratorOpen && (
        <QRCodeGenerator isOpen={isQRGeneratorOpen} onClose={() => setIsQRGeneratorOpen(false)} />
      )}

      {/* QR Code Scanner Dialog */}
      {isQRScannerOpen && (
        <QRCodeScanner isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />
      )}
    </>
  );
};