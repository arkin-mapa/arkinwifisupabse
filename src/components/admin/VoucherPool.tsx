import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteVoucher, fetchVouchers } from "@/utils/supabaseData";
import type { Voucher } from "@/types/plans";
import { motion } from "framer-motion";

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
      
      const updatedVouchersArray = await fetchVouchers();
      const updatedVouchersByPlan = updatedVouchersArray.reduce((acc: Record<string, Voucher[]>, voucher) => {
        const planDuration = Object.keys(localVouchers).find(duration => 
          localVouchers[duration].some(v => v.planId === voucher.planId)
        );
        if (planDuration) {
          if (!acc[planDuration]) {
            acc[planDuration] = [];
          }
          acc[planDuration].push(voucher);
        }
        return acc;
      }, {});

      setLocalVouchers(updatedVouchersByPlan);
      toast({
        title: "Success",
        description: "Voucher deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast({
        title: "Error",
        description: "Failed to delete voucher",
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
      <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
          <Ticket className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No vouchers available in the pool.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Voucher Pool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {Object.entries(localVouchers).map(([planDuration, planVouchers]) => {
                if (!planVouchers || planVouchers.length === 0) return null;
                
                const unusedCount = planVouchers.filter(v => !v.isUsed).length;
                const isExpanded = expandedPlans[planDuration];
                
                return (
                  <motion.div 
                    key={planDuration}
                    initial={false}
                    animate={{ height: 'auto' }}
                    className="rounded-lg overflow-hidden"
                  >
                    <div 
                      className="flex justify-between items-center p-3 bg-accent/50 rounded-lg cursor-pointer hover:bg-accent/70 transition-colors"
                      onClick={() => togglePlanExpansion(planDuration)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? 
                          <ChevronUp className="h-4 w-4 text-muted-foreground" /> : 
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        }
                        <h3 className="font-medium">{planDuration}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-background/50">
                        {unusedCount} available
                      </Badge>
                    </div>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2 p-2"
                      >
                        {planVouchers.map((voucher) => (
                          <div key={voucher.id} className="relative group">
                            <Badge
                              variant={voucher.isUsed ? "secondary" : "default"}
                              className="w-full justify-between py-2 px-3 font-mono text-xs"
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
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VoucherPool;