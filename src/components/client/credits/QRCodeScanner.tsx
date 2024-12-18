import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const QRCodeScanner = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientData, setRecipientData] = useState<{ userId: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = (result: any, error: any) => {
    if (error) {
      console.error(error);
      toast.error("Error scanning QR code");
      return;
    }

    if (result) {
      try {
        const data = JSON.parse(result?.text);
        if (data.type === 'credit-transfer') {
          setRecipientData({
            userId: data.userId,
            email: data.email
          });
          toast.success("QR Code scanned successfully!");
        }
      } catch (error) {
        toast.error("Invalid QR Code");
      }
    }
  };

  const handleTransfer = async () => {
    if (!recipientData) {
      toast.error("Please scan a valid QR code first");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        toast.error("Please log in to transfer credits");
        return;
      }

      const { data, error } = await supabase.rpc('transfer_credits', {
        from_client_id: session.session.user.id,
        to_client_id: recipientData.userId,
        transfer_amount: transferAmount
      });

      if (error) throw error;

      setIsOpen(false);
      setAmount("");
      setRecipientData(null);
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
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full mt-4">
        Scan QR Code to Transfer
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!recipientData ? (
              <QrReader
                onResult={handleScan}
                constraints={{ facingMode: 'environment' }}
                className="w-full"
              />
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Recipient Email</Label>
                  <Input value={recipientData.email} disabled />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};