import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PlanCard from "./PlanCard";
import VoucherPool from "./VoucherPool";
import AddPlanDialog from "./AddPlanDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Plan, Voucher } from "@/types/plans";

const PlansManager = () => {
  const [vouchers, setVouchers] = useState<Record<string, Voucher[]>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wifi_plans")
        .select("*")
        .order("price");

      if (error) throw error;
      return data.map(plan => ({
        id: plan.id,
        duration: plan.duration,
        price: plan.price,
        availableVouchers: plan.available_vouchers
      }));
    },
  });

  const addPlanMutation = useMutation({
    mutationFn: async (newPlan: Omit<Plan, 'id' | 'availableVouchers'>) => {
      const { data, error } = await supabase
        .from("wifi_plans")
        .insert([{
          duration: newPlan.duration,
          price: newPlan.price,
          available_vouchers: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast({
        title: "Success",
        description: "New plan added successfully",
      });
    },
    onError: (error) => {
      console.error('Error adding plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add plan. Please try again.",
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from("wifi_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting plan:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete plan. Please try again.",
      });
    },
  });

  const handleAddPlan = (newPlan: Omit<Plan, 'id' | 'availableVouchers'>) => {
    addPlanMutation.mutate(newPlan);
  };

  const handleDeletePlan = (planId: string) => {
    deletePlanMutation.mutate(planId);
  };

  const handleVoucherExtracted = async (planId: string, voucherCodes: string[]) => {
    try {
      // Insert new vouchers into Supabase
      const { error } = await supabase
        .from("vouchers")
        .insert(
          voucherCodes.map(code => ({
            plan_id: planId,
            code,
            is_used: false
          }))
        );

      if (error) throw error;

      // Update available_vouchers count in wifi_plans
      const { error: updateError } = await supabase
        .from("wifi_plans")
        .update({ 
          available_vouchers: voucherCodes.length 
        })
        .eq("id", planId);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ["plans"] });
      
      toast({
        title: "Success",
        description: `${voucherCodes.length} vouchers added successfully`,
      });
    } catch (error) {
      console.error('Error handling vouchers:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add vouchers. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">WiFi Plans</h2>
        <AddPlanDialog onAddPlan={handleAddPlan} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onDelete={handleDeletePlan}
            onVoucherExtracted={handleVoucherExtracted}
          />
        ))}
      </div>

      <VoucherPool vouchers={vouchers} />
    </div>
  );
};

export default PlansManager;