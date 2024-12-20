import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete: () => void;
}

export const QRCodeScanner = ({ isOpen, onClose, onTransferComplete }: QRCodeScannerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleScan = async (result: any) => {
    if (result && !isLoading) {
      try {
        setIsLoading(true);
        console.log('Scanned QR data:', result.text); // Debug log
        
        const data = JSON.parse(result?.text);
        
        if (data.type !== 'voucher-transfer' || !data.userId || !data.vouchers) {
          console.error('Invalid QR data format:', data); // Debug log
          toast.error("Invalid QR Code format");
          return;
        }

        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          toast.error("Please log in to transfer vouchers");
          return;
        }

        console.log('Attempting transfer:', {
          from: data.userId,
          to: session.session.user.id,
          vouchers: data.vouchers
        }); // Debug log

        const { error: transferError } = await supabase.rpc('transfer_vouchers', {
          from_client_id: data.userId,
          to_client_id: session.session.user.id,
          voucher_ids: data.vouchers
        });

        if (transferError) {
          console.error('Transfer error:', transferError); // Debug log
          throw transferError;
        }

        toast.success("Vouchers transferred successfully");
        onTransferComplete();
        onClose();
      } catch (error: any) {
        console.error('Error transferring vouchers:', error);
        toast.error(error.message || "Failed to transfer vouchers");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] rounded-lg p-4' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className={`${isMobile ? 'w-full aspect-square' : 'w-full'}`}>
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: 'environment' }}
              className="w-full"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {isLoading ? "Processing transfer..." : "Scan a voucher QR code to receive vouchers"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};