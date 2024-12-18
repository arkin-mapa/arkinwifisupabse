import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const TransferCredits = () => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async () => {
    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Please log in to transfer credits");
        return;
      }

      const transferAmount = parseFloat(amount);
      if (isNaN(transferAmount) || transferAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      // Verify recipient exists in profiles table
      const { data: recipientProfile, error: recipientError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', recipientId)
        .single();

      if (recipientError || !recipientProfile) {
        toast.error("Recipient ID not found. Please check and try again.");
        return;
      }

      // Don't allow transfers to admin accounts
      if (recipientProfile.role === 'admin') {
        toast.error("Cannot transfer credits to admin accounts");
        return;
      }

      // Don't allow self-transfers
      if (recipientProfile.id === session.session.user.id) {
        toast.error("Cannot transfer credits to yourself");
        return;
      }

      const { data, error } = await supabase.rpc('transfer_credits', {
        from_client_id: session.session.user.id,
        to_client_id: recipientId,
        transfer_amount: transferAmount
      });

      if (error) throw error;

      setIsTransferOpen(false);
      setAmount("");
      setRecipientId("");
      toast.success("Credits transferred successfully");
    } catch (error: any) {
      console.error('Error transferring credits:', error);
      toast.error(error.message || "Failed to transfer credits");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsTransferOpen(true)} variant="outline" className="w-full mt-4">
        Transfer Credits
      </Button>

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="recipientId">Recipient ID</Label>
              <Input
                id="recipientId"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Enter recipient's ID"
              />
            </div>
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
              className="w-full" 
              onClick={handleTransfer}
              disabled={isLoading}
            >
              Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};