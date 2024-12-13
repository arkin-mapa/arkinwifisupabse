import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPurchases, updatePurchaseStatus } from "@/utils/supabaseData";
import PurchasesTable from "./PurchasesTable";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PendingPurchases = () => {
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: fetchPurchases,
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-purchase-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        () => {
          // Refetch purchases when any change occurs
          queryClient.invalidateQueries({ queryKey: ['purchases'] });
          toast.info("Purchase status updated");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: ({ purchaseId, status }: { purchaseId: string, status: "approved" | "rejected" }) =>
      updatePurchaseStatus(purchaseId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success("Purchase status updated successfully");
    },
    onError: (error) => {
      console.error('Error updating purchase:', error);
      toast.error("Failed to update purchase status");
    }
  });

  const pendingPurchases = purchases.filter(
    (purchase) => purchase.status === "pending"
  );

  const handleApprove = async (purchaseId: string) => {
    try {
      await updateMutation.mutateAsync({ purchaseId, status: "approved" });
    } catch (error) {
      console.error('Error approving purchase:', error);
    }
  };

  const handleReject = async (purchaseId: string) => {
    try {
      await updateMutation.mutateAsync({ purchaseId, status: "rejected" });
    } catch (error) {
      console.error('Error rejecting purchase:', error);
    }
  };

  if (isLoading) {
    return <div>Loading purchases...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pending Purchases</h2>
      {pendingPurchases.length === 0 ? (
        <p className="text-muted-foreground">No pending purchases.</p>
      ) : (
        <PurchasesTable
          purchases={pendingPurchases}
          onApprove={handleApprove}
          onReject={handleReject}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
};

export default PendingPurchases;