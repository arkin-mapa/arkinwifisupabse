import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Voucher } from "@/types/plans";

const VoucherPool = () => {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({
    "2 hrs": [
      { id: "1", code: "ABC123456", planId: "1", isUsed: false },
      { id: "2", code: "DEF789012", planId: "1", isUsed: true },
    ],
    "4 hrs": [
      { id: "3", code: "GHI345678", planId: "2", isUsed: false },
      { id: "4", code: "JKL901234", planId: "2", isUsed: false },
    ],
  });

  const handleDeleteVoucher = (planDuration: string, voucherId: string) => {
    setVouchers(prev => {
      const planVouchers = prev[planDuration] || [];
      const updatedVouchers = planVouchers.filter(v => v.id !== voucherId);
      
      if (updatedVouchers.length === 0) {
        const { [planDuration]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [planDuration]: updatedVouchers
      };
    });

    toast({
      title: "Voucher deleted",
      description: "The voucher has been removed from the pool.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Voucher Pool</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(vouchers).length === 0 ? (
            <p className="text-muted-foreground">No vouchers available in the pool.</p>
          ) : (
            <ScrollArea className="h-[400px]">
              {Object.entries(vouchers).map(([planDuration, planVouchers]) => (
                <div key={planDuration} className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Plan: {planDuration}</h3>
                    <span className="text-sm text-muted-foreground">
                      Total: {planVouchers.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {planVouchers.map((voucher) => (
                      <div key={voucher.id} className="relative group">
                        <Badge
                          variant={voucher.isUsed ? "secondary" : "default"}
                          className="w-full justify-center py-2"
                        >
                          {voucher.code}
                        </Badge>
                        {!voucher.isUsed && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-red-100 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteVoucher(planDuration, voucher.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPool;