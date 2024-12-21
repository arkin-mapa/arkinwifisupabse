import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, QrCode, Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCreditBalance } from "@/hooks/useCreditBalance";
import { TopUpDialog } from "./TopUpDialog";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { QRCodeScanner } from "./QRCodeScanner";
import { CreditRequestStatus } from "./CreditRequestStatus";
import { useState } from "react";
import { formatAmount } from "@/utils/formatters";

export const CreditBalanceCard = () => {
  const { balance, isLoading } = useCreditBalance();
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isLoading) {
    return <div>Loading balance...</div>;
  }

  return (
    <>
      <CreditRequestStatus />
      <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <CardContent className={`p-4 ${isMobile ? 'space-y-4' : 'p-6'}`}>
          <div className="flex flex-col space-y-4">
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
              <div className="flex items-center space-x-3">
                <Wallet className="h-6 w-6 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Credits</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatAmount(balance)}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsTopUpOpen(true)}
                className={`bg-purple-600 hover:bg-purple-700 text-white ${isMobile ? 'w-full' : ''}`}
              >
                Top Up
              </Button>
            </div>

            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4"
                onClick={() => setIsQRGeneratorOpen(true)}
              >
                <QrCode className="h-4 w-4" />
                <span>Show QR</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4"
                onClick={() => setIsQRScannerOpen(true)}
              >
                <Send className="h-4 w-4" />
                <span>Scan & Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <TopUpDialog 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
      />

      {/* QR Code Generator Dialog */}
      {isQRGeneratorOpen && (
        <QRCodeGenerator isOpen={isQRGeneratorOpen} onClose={() => setIsQRGeneratorOpen(false)} />
      )}

      {/* QR Code Scanner Dialog */}
      {isQRScannerOpen && (
        <QRCodeScanner isOpen={isQRScannerOpen} onClose={() => setIsQRScannerOpen(false)} />
      )}
    </>
  );
};
