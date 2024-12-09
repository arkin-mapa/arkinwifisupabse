import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PaymentInstructionsCard from "./PaymentInstructionsCard";
import PurchasesTable from "./PurchasesTable";
import { usePurchases } from "@/hooks/usePurchases";
import { supabase } from "@/integrations/supabase/client";
import type { Purchase } from "@/types/plans";

const paymentInstructions = {
  cash: "Please visit our office at...",
  gcash: "GCash Number: 09123456789\nAccount Name: Juan Dela Cruz",
  paymaya: "PayMaya Number: 09987654321\nAccount Name: Juan Dela Cruz"
};

const PendingPurchases = () => {
  const [instructions, setInstructions] = useState(paymentInstructions);
  const { purchases, isLoading, cancelPurchase, deletePurchase } = usePurchases();

  const handleApprove = async (purchaseId: string) => {
    try {
      // Get the purchase details first
      const { data: purchase, error: fetchError } = await supabase
        .from("purchases")
        .select("*, wifi_plans(duration)")
        .eq("id", purchaseId)
        .single();

      if (fetchError) throw fetchError;
      if (!purchase) {
        toast.error("Purchase not found");
        return;
      }

      // Get available vouchers for the plan
      const { data: vouchers, error: vouchersError } = await supabase
        .from("vouchers")
        .select("id")
        .eq("plan_id", purchase.plan_id)
        .is("user_id", null)
        .is("purchase_id", null)
        .limit(purchase.quantity);

      if (vouchersError) throw vouchersError;

      if (!vouchers || vouchers.length < purchase.quantity) {
        toast.error(`Not enough vouchers available. Need ${purchase.quantity}, but only have ${vouchers?.length || 0}`);
        return;
      }

      // Update purchase status to approved
      const { error: updateError } = await supabase
        .from("purchases")
        .update({ status: "approved" })
        .eq("id", purchaseId);

      if (updateError) throw updateError;

      // Assign vouchers to the user
      const { error: assignError } = await supabase
        .from("vouchers")
        .update({
          user_id: purchase.user_id,
          purchase_id: purchaseId
        })
        .in("id", vouchers.map(v => v.id));

      if (assignError) throw assignError;

      // Update available vouchers count in the plan
      const { error: planError } = await supabase
        .from("wifi_plans")
        .update({
          available_vouchers: supabase.sql`available_vouchers - ${purchase.quantity}`
        })
        .eq("id", purchase.plan_id);

      if (planError) throw planError;

      toast.success("Purchase approved and vouchers assigned successfully");
    } catch (error) {
      console.error('Error approving purchase:', error);
      toast.error("Failed to approve purchase");
    }
  };

  const handleReject = async (purchaseId: string) => {
    try {
      const { error } = await supabase
        .from("purchases")
        .update({ status: "rejected" })
        .eq("id", purchaseId);

      if (error) throw error;
      toast.success("Purchase rejected");
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      toast.error("Failed to reject purchase");
    }
  };

  const handleDelete = async (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase || purchase.status === "pending") {
      toast.error("Only approved, rejected, or cancelled purchases can be deleted");
      return;
    }

    try {
      await deletePurchase.mutateAsync(purchaseId);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error("Failed to delete purchase");
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <p className="text-muted-foreground">No purchase requests to review.</p>
          ) : (
            <PurchasesTable
              purchases={purchases}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <PaymentInstructionsCard
        instructions={instructions}
        setInstructions={setInstructions}
      />
    </div>
  );
};

export default PendingPurchases;