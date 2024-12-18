import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const TransferCredits = () => {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
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

      // First get the recipient's UUID from their email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (
          await supabase
            .from('auth.users')
            .select('id')
            .eq('email', recipientEmail)
            .single()
        ).data?.id)
        .single();

      if (userError || !userData) {
        toast.error("Recipient not found");
        return;
      }

      const { data, error } = await supabase.rpc('transfer_credits', {
        from_client_id: session.session.user.id,
        to_client_id: userData.id,
        transfer_amount: transferAmount
      });

      if (error) throw error;

      setIsTransferOpen(false);
      setAmount("");
      setRecipientEmail("");
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
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email"
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