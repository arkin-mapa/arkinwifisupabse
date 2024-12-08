import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Voucher } from "@/types/plans";

interface VoucherPoolProps {
  vouchers: Record<string, Voucher[]>;
}

const VoucherPool = ({ vouchers }: VoucherPoolProps) => {
  const { toast } = useToast();
  const [localVouchers, setLocalVouchers] = useState(vouchers);

  const handleDeleteVoucher = (planDuration: string, voucherId: string) => {
    // Update local state
    const updatedVouchers = {
      ...localVouchers,
      [planDuration]: localVouchers[planDuration].filter(v => v.id !== voucherId)
    };

    // Update localStorage
    localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
    setLocalVouchers(updatedVouchers);

    // Update plans with new voucher count
    const plans = JSON.parse(localStorage.getItem('wifiPlans') || '[]');
    const updatedPlans = plans.map(p => 
      p.duration === planDuration
        ? { ...p, availableVouchers: updatedVouchers[planDuration].filter(v => !v.isUsed).length }
        : p
    );
    localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));

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
          {Object.keys(localVouchers).length === 0 ? (
            <p className="text-muted-foreground">No vouchers available in the pool.</p>
          ) : (
            <ScrollArea className="h-[400px]">
              {Object.entries(localVouchers).map(([planDuration, planVouchers]) => {
                const usedCount = planVouchers.filter(v => v.isUsed).length;
                const unusedCount = planVouchers.length - usedCount;
                
                return (
                  <div key={planDuration} className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Plan: {planDuration}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Used: {usedCount}</span>
                        <span>Available: {unusedCount}</span>
                        <span>Total: {planVouchers.length}</span>
                      </div>
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
                );
              })}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPool;