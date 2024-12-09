import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Voucher } from "@/types/plans";

interface VoucherPoolProps {
  vouchers: Record<string, Voucher[]>;
}

const VoucherPool = ({ vouchers }: VoucherPoolProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const { data: voucherData = {}, isLoading } = useQuery({
    queryKey: ["vouchers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vouchers")
        .select(`
          *,
          wifi_plans (
            duration
          )
        `)
        .order("created_at");

      if (error) throw error;

      // Group vouchers by plan duration
      const groupedVouchers: Record<string, Voucher[]> = {};
      data.forEach((voucher) => {
        if (!voucher.wifi_plans?.duration) return; // Skip if no duration
        const duration = voucher.wifi_plans.duration;
        if (!groupedVouchers[duration]) {
          groupedVouchers[duration] = [];
        }
        groupedVouchers[duration].push({
          id: voucher.id,
          code: voucher.code,
          planId: voucher.plan_id,
          isUsed: voucher.is_used || false
        });
      });

      return groupedVouchers;
    },
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: async ({ voucherId, planId }: { voucherId: string, planId: string }) => {
      const { error: deleteError } = await supabase
        .from("vouchers")
        .delete()
        .eq("id", voucherId);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("wifi_plans")
        .update({ available_vouchers: 0 })
        .eq("id", planId)
        .select("available_vouchers")
        .single();

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast({
        title: "Success",
        description: "Voucher deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting voucher:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete voucher",
      });
    },
  });

  const togglePlanExpansion = (planDuration: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planDuration]: !prev[planDuration]
    }));
  };

  const handleDeleteVoucher = (voucherId: string, planId: string) => {
    deleteVoucherMutation.mutate({ voucherId, planId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
        <CardHeader>
          <CardTitle>Voucher Pool</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(voucherData).length === 0 ? (
            <p className="text-muted-foreground">No vouchers available in the pool.</p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              {Object.entries(voucherData).map(([planDuration, planVouchers]) => {
                if (!Array.isArray(planVouchers) || planVouchers.length === 0) return null;
                
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
                              onClick={() => handleDeleteVoucher(voucher.id, voucher.planId)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPool;