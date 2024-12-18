import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSession } from "@supabase/auth-helpers-react";

export const QRCodeGenerator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const session = useSession();

  if (!session?.user?.id) return null;

  const qrData = JSON.stringify({
    type: 'credit-transfer',
    userId: session.user.id,
    email: session.user.email
  });

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full mt-4">
        Show My QR Code
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
    </>
  );
};