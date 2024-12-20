import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Voucher } from "@/types/plans";
import { useIsMobile } from "@/hooks/use-mobile";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Voucher[];
  onTransferComplete?: (transferredVoucherIds: string[]) => void;
}

export const QRCodeGenerator = ({ isOpen, onClose, vouchers }: QRCodeGeneratorProps) => {
  const [qrData, setQrData] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const generateQRData = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        // Create a compact data structure for QR code
        const qrContent = {
          type: 'voucher-transfer',
          from: session.session.user.id,
          vouchers: vouchers.map(v => v.id)
        };
        setQrData(JSON.stringify(qrContent));
      }
    };

    if (isOpen) {
      generateQRData();
    }
  }, [vouchers, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] rounded-lg' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle>Share Vouchers</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div className="flex items-center justify-center w-full aspect-square max-w-[288px]">
            <QRCodeSVG
              value={qrData}
              size={isMobile ? 256 : 288}
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