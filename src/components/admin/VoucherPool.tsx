import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteVoucher } from "@/utils/supabaseData";
import type { Voucher } from "@/types/plans";
import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useVoucherSync } from "@/hooks/useVoucherSync";
import { VoucherItem } from "./voucher/VoucherItem";

interface VoucherPoolProps {
  vouchers: Record<string, Voucher[]>;
}

const VoucherPool = ({ vouchers: initialVouchers }: VoucherPoolProps) => {
  const { toast } = useToast();
  const { localVouchers, setLocalVouchers, syncVoucherStatus } = useVoucherSync(initialVouchers);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      await deleteVoucher(voucherId);
      await syncVoucherStatus();
      
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
    <TooltipProvider>
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
                            <VoucherItem
                              key={voucher.id}
                              voucher={voucher}
                              onDelete={handleDeleteVoucher}
                            />
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
    </TooltipProvider>
  );
};

export default VoucherPool;