import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { CreditBalance } from "@/types/credits";

export const CreditBalanceCard = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");

  useEffect(() => {
    loadCreditBalance();
  }, []);

  const loadCreditBalance = async () => {
    try {
      const { data: credits, error } = await supabase
        .from('credits')
        .select('amount, transaction_type')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const total = credits?.reduce((acc, curr) => {
        return curr.transaction_type === 'deposit' 
          ? acc + Number(curr.amount) 
          : acc - Number(curr.amount);
      }, 0) || 0;

      setBalance(total);
    } catch (error) {
      console.error('Error loading credit balance:', error);
      toast.error("Failed to load credit balance");
    }
  };

  const handleTopUpRequest = async () => {
    try {
      const amount = parseFloat(topUpAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Please log in to request top-up");
        return;
      }

      const { error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          customer_name: session.session.user.email,
          client_id: session.session.user.id,
          quantity: 1,
          total_amount: amount,
          payment_method: 'cash',
          status: 'pending'
        });

      if (purchaseError) throw purchaseError;

      setIsTopUpOpen(false);
      setTopUpAmount("");
      toast.success("Top-up request submitted successfully");
    } catch (error) {
      console.error('Error requesting top-up:', error);
      toast.error("Failed to submit top-up request");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Credit Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold">₱{balance.toFixed(2)}</p>
          <Button onClick={() => setIsTopUpOpen(true)}>Top Up</Button>
        </div>

        <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
          <DialogContent>
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
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleTopUpRequest}
              >
                Request Top Up
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};