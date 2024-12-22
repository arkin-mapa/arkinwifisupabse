import { useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const session = useSession();

  const initializeScanner = () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader-voucher",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        async (result) => {
          if (!isLoading) {
            try {
              setIsLoading(true);
              console.log('Scanned QR data:', result);
              
              const data = JSON.parse(result);
              
              // Validate QR data structure
              if (data.type !== 'voucher-transfer' || !data.from || !Array.isArray(data.vouchers)) {
                console.error('Invalid QR data format:', data);
                toast.error("Invalid QR Code format");
                return;
              }

              if (data.from === session?.user?.id) {
                toast.error("Cannot transfer vouchers to yourself");
                return;
              }

              console.log('Attempting transfer:', {
                from: data.from,
                to: session?.user?.id,
                vouchers: data.vouchers
              });

              const { error: transferError } = await supabase.rpc('transfer_vouchers', {
                from_client_id: data.from,
                to_client_id: session?.user?.id,
                voucher_ids: data.vouchers
              });

              if (transferError) {
                console.error('Transfer error:', transferError);
                throw transferError;
              }

              toast.success("Vouchers transferred successfully");
              onTransferComplete();
              handleClose();
            } catch (error) {
              console.error('Error processing QR code:', error);
              toast.error("Failed to transfer vouchers");
            } finally {
              setIsLoading(false);
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    onClose();
  };

  // Initialize scanner when dialog opens
  if (isOpen) {
    initializeScanner();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="relative w-full aspect-square">
          <div id="qr-reader-voucher" className="w-full h-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};