import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onTransferComplete?: (transferredVoucherIds: string[]) => void;
}

export const QRCodeGenerator = ({ isOpen, onClose, vouchers }: QRCodeGeneratorProps) => {
  const [qrData, setQrData] = useState<string>("");

  useEffect(() => {
    const generateQRData = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        // Optimize data structure to reduce size
        const qrContent = {
          t: 'v', // shortened 'type' to 't' for voucher-transfer
          u: session.session.user.id, // shortened 'userId' to 'u'
          v: vouchers.map(v => v.id) // shortened 'vouchers' to 'v'
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
        <div className="flex flex-col items-center justify-center p-4">
          <div className="flex items-center justify-center w-full aspect-square max-w-[288px]">
            <QRCodeSVG
              value={qrData}
              size={288}
              level="H"
              includeMargin
              className="w-full h-full"
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Scan this QR code to transfer {vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};