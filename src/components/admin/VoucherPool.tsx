import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteVoucher, fetchVouchers } from "@/utils/supabaseData";
import type { Voucher } from "@/types/plans";

interface VoucherPoolProps {
  vouchers: Record<string, Voucher[]>;
}

const VoucherPool = ({ vouchers: initialVouchers }: VoucherPoolProps) => {
  const { toast } = useToast();
  const [localVouchers, setLocalVouchers] = useState<Record<string, Voucher[]>>(initialVouchers);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalVouchers(initialVouchers);
  }, [initialVouchers]);

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      await deleteVoucher(voucherId);
      
      // Refresh vouchers data
      const updatedVouchers = await fetchVouchers();
      setLocalVouchers(updatedVouchers);

      toast({
        title: "Voucher deleted",
        description: "The voucher has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast({
        title: "Error",
        description: "Failed to delete voucher. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePlanExpansion = (planDuration: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planDuration]: !prev[planDuration]
    }));
  };

  if (!localVouchers || Object.keys(localVouchers).length === 0) {
    return (
      <Card className="p-6 text-center border">
        <p className="text-gray-600">No vouchers available in the pool.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle>Voucher Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {Object.entries(localVouchers).map(([planDuration, planVouchers]) => {
              if (!planVouchers || planVouchers.length === 0) return null;
              
              const unusedCount = planVouchers.filter(v => !v.isUsed).length;
              const isExpanded = expandedPlans[planDuration];
              
              return (
                <div key={planDuration} className="mb-6">
                  <div 
                    className="flex justify-between items-center mb-2 p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70"
                    onClick={() => togglePlanExpansion(planDuration)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <h3 className="font-medium">{planDuration}</h3>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <Badge variant="default">Available: {unusedCount}</Badge>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                      {planVouchers.map((voucher) => (
                        <div key={voucher.id} className="relative group">
                          <Badge
                            variant={voucher.isUsed ? "secondary" : "default"}
                            className="w-full justify-between py-2 px-3"
                          >
                            <span className="truncate">{voucher.code}</span>
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteVoucher(voucher.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPool;