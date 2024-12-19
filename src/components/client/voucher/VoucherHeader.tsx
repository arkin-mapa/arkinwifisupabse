import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Printer, Wallet, CheckSquare } from "lucide-react";
import type { Voucher } from "@/types/plans";

interface VoucherHeaderProps {
  selectedVouchers: Voucher[];
  onOpenQRGenerator: () => void;
  onOpenQRScanner: () => void;
  onPrintSelected: () => void;
  onSelectAll: () => void;
  totalVouchers: number;
}

const VoucherHeader = ({
  selectedVouchers,
  onOpenQRGenerator,
  onOpenQRScanner,
  onPrintSelected,
  onSelectAll,
  totalVouchers
}: VoucherHeaderProps) => {
  return (
    <CardHeader className="pb-3 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your Vouchers</CardTitle>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          variant="default"
          size="sm"
          onClick={onOpenQRGenerator}
          disabled={selectedVouchers.length === 0}
          className="w-full sm:w-auto"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Share ({selectedVouchers.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenQRScanner}
          className="w-full sm:w-auto"
        >
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrintSelected}
          disabled={selectedVouchers.length === 0}
          className="w-full sm:w-auto"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print ({selectedVouchers.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSelectAll}
          className="w-full sm:w-auto"
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Select All ({totalVouchers})
        </Button>
      </div>
    </CardHeader>
  );
};

export default VoucherHeader;