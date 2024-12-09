import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PaymentInstructionsCard from "./PaymentInstructionsCard";
import PurchasesTable from "./PurchasesTable";
import { usePurchases } from "@/hooks/usePurchases";
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
      const { error } = await supabase
        .from("purchases")
        .update({ status: "approved" })
        .eq("id", purchaseId);

      if (error) throw error;
      toast.success("Purchase approved successfully");
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