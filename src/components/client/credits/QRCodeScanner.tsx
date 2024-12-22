import { useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeScanner = ({ isOpen, onClose }: QRCodeScannerProps) => {
  const [amount, setAmount] = useState("");
  const [recipientData, setRecipientData] = useState<{ userId: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isMobile = useIsMobile();

  const initializeScanner = () => {
    if (!scannerRef.current && !recipientData) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        (result) => {
          try {
            const data = JSON.parse(result);
            if (data.type === 'credit-transfer') {
              setRecipientData({
                userId: data.userId,
                email: data.email
              });
              toast.success("QR Code scanned successfully!");
              if (scannerRef.current) {
                scannerRef.current.clear();
              }
            }
          } catch (error) {
            console.error('QR scan error:', error);
            toast.error("Invalid QR Code");
          }
        },
        (error) => {
          console.log(error);
        }
      );
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

      onClose();
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

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setAmount("");
    setRecipientData(null);
    onClose();
  };

  // Initialize scanner when dialog opens
  if (isOpen && !recipientData) {
    initializeScanner();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] rounded-lg p-4' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!recipientData ? (
            <div id="qr-reader" className={`${isMobile ? 'w-full aspect-square' : 'w-full'}`} />
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
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={handleTransfer}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Transfer"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};