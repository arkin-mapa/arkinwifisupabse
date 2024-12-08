import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Voucher, Plan } from "@/types/plans";

interface VoucherPoolProps {
  vouchers: Record<string, Voucher[]>;
}

const VoucherPool = ({ vouchers }: VoucherPoolProps) => {
  const { toast } = useToast();
  const [localVouchers, setLocalVouchers] = useState(vouchers);

  useEffect(() => {
    const storedVouchers = localStorage.getItem('vouchers');
    if (storedVouchers) {
      setLocalVouchers(JSON.parse(storedVouchers));
    }
  }, []);

  useEffect(() => {
    // Update plans' voucher counts whenever vouchers change
    const plans: Plan[] = JSON.parse(localStorage.getItem('wifiPlans') || '[]');
    const updatedPlans = plans.map(plan => ({
      ...plan,
      availableVouchers: (localVouchers[plan.duration] || []).filter(v => !v.isUsed).length
    }));
    
    localStorage.setItem('wifiPlans', JSON.stringify(updatedPlans));
    localStorage.setItem('vouchers', JSON.stringify(localVouchers));
  }, [localVouchers]);

  const handleDeleteVoucher = (planDuration: string, voucherId: string) => {
    setLocalVouchers(prev => {
      const planVouchers = prev[planDuration] || [];
      const updatedVouchers = planVouchers.filter(v => v.id !== voucherId);
      
      const newVouchers = {
        ...prev,
        [planDuration]: updatedVouchers
      };

      // If no vouchers left for this plan duration, remove the key
      if (updatedVouchers.length === 0) {
        delete newVouchers[planDuration];
      }

      return newVouchers;
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
