import QRCode from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@supabase/auth-helpers-react";
import type { Voucher } from "@/types/plans";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onTransferComplete: (transferredVoucherIds: string[]) => void;
}

export const QRCodeGenerator = ({ isOpen, onClose, vouchers, onTransferComplete }: QRCodeGeneratorProps) => {
  const session = useSession();

  const qrData = JSON.stringify({
    type: 'voucher-transfer',
    userId: session?.user?.id,
    email: session?.user?.email,
    vouchers: vouchers.map(v => v.id)
  });

  const handleClose = () => {
    onClose();
    // Call onTransferComplete with the transferred voucher IDs
    onTransferComplete(vouchers.map(v => v.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Vouchers</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <QRCode
            value={qrData}
            size={256}
            level="H"
            includeMargin={true}
          />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Scan this QR code to transfer {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};