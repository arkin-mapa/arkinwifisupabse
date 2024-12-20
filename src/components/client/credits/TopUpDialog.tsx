import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TopUpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpDialog = ({ isOpen, onClose }: TopUpDialogProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleTopUp}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};