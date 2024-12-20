import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
}

export const QRCodeScanner = ({ isOpen, onClose, onTransferComplete }: QRCodeScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const handleScan = async (result: any) => {
    if (result?.text && !isLoading) {
      try {
        setIsLoading(true);
        console.log('Scanned QR data:', result.text);
        
        const data = JSON.parse(result.text);
        
        // Check for shortened keys in optimized data structure
        if (data.t !== 'v' || !data.u || !data.v) {
          console.error('Invalid QR data format:', data);
          toast.error("Invalid QR Code format");
          return;
        }

        if (data.u === session?.user?.id) {
          toast.error("Cannot transfer vouchers to yourself");
          return;
        }

        console.log('Attempting transfer:', {
          from: data.u,
          to: session?.user?.id,
          vouchers: data.v
        });

        const { error: transferError } = await supabase.rpc('transfer_vouchers', {
          from_client_id: data.u,
          to_client_id: session?.user?.id,
          voucher_ids: data.v
        });

        if (transferError) {
          console.error('Transfer error:', transferError);
          throw transferError;
        }

        toast.success("Vouchers transferred successfully");
        onTransferComplete();
        onClose();
      } catch (error) {
        console.error('Error processing QR code:', error);
        toast.error("Failed to transfer vouchers");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-square">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={handleScan}
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};