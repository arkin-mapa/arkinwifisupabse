import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PurchasesTable from "./PurchasesTable";
import { fetchPurchases, updatePurchaseStatus, deletePurchase } from "@/utils/supabaseData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PendingPurchases = () => {
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: fetchPurchases,
    refetchInterval: 5000 // Refetch every 5 seconds
  });

  const updateMutation = useMutation({
    mutationFn: ({ purchaseId, status }: { purchaseId: string, status: 'approved' | 'rejected' }) => 
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

  const deleteMutation = useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast.success("Purchase deleted successfully");
    },
    onError: (error) => {
      console.error('Error deleting purchase:', error);
      toast.error("Failed to delete purchase");
    }
  });

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

  const handleDelete = async (purchaseId: string) => {
    try {
      await deleteMutation.mutateAsync(purchaseId);
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
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
    </div>
  );
};

export default PendingPurchases;