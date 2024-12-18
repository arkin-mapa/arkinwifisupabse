import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeGenerator = ({ isOpen, onClose }: QRCodeGeneratorProps) => {
  const [qrData, setQrData] = useState<string>("");
  const isMobile = useIsMobile();

  useEffect(() => {
    const generateQRData = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const qrContent = {
          type: 'credit-transfer',
          userId: session.session.user.id,
          email: session.session.user.email
        };
        setQrData(JSON.stringify(qrContent));
      }
    };

    generateQRData();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-[95vw] rounded-lg' : 'sm:max-w-md'}`}>
        <DialogHeader>
          <DialogTitle>Your QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-4">
          <div className={`${isMobile ? 'w-64 h-64' : 'w-72 h-72'}`}>
            <QRCodeSVG
              value={qrData}
              size={isMobile ? 256 : 288}
              level="H"
              includeMargin
              className="w-full h-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};