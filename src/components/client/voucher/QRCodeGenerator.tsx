import { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onTransferComplete?: (transferredVoucherIds: string[]) => void;
}

export const QRCodeGenerator = ({ isOpen, onClose, vouchers, onTransferComplete }: QRCodeGeneratorProps) => {
  const [qrData, setQrData] = useState<string>("");

  useEffect(() => {
    const generateQRData = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const qrContent = {
          type: 'voucher-transfer',
          userId: session.session.user.id,
          email: session.session.user.email,
          voucherIds: vouchers.map(v => v.id)
        };
        setQrData(JSON.stringify(qrContent));
      }
    };

    generateQRData();
  }, [vouchers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Vouchers</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center w-full p-4">
          <div className="relative w-full max-w-[288px] aspect-square mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <QRCode
                value={qrData}
                size={288}
                level="H"
                includeMargin={true}
                className="w-full h-full"
              />
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Scan this QR code to transfer {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};