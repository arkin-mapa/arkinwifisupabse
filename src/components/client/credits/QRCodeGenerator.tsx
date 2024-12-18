import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@supabase/auth-helpers-react";

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeGenerator = ({ isOpen, onClose }: QRCodeGeneratorProps) => {
  const session = useSession();

  if (!session?.user?.id) return null;

  const qrData = JSON.stringify({
    type: 'credit-transfer',
    userId: session.user.id,
    email: session.user.email
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your Transfer QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center p-6">
          <QRCodeSVG
            value={qrData}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};