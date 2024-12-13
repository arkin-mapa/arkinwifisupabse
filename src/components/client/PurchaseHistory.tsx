import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Purchase } from "@/types/plans";
import { fetchClientPurchases, cancelPurchase } from "@/utils/supabaseData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PurchaseHistory = () => {
  const queryClient = useQueryClient();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['clientPurchases'],
    queryFn: fetchClientPurchases,
    refetchInterval: 5000 // Refetch every 5 seconds to check for status updates
  });

  const cancelMutation = useMutation({
    mutationFn: cancelPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientPurchases'] });
      toast.success("Purchase cancelled successfully");
    },
    onError: (error) => {
      console.error('Cancel error:', error);
      toast.error("Failed to cancel purchase. Please try again.");
    }
  });

  const handleCancel = (purchaseId: string) => {
    cancelMutation.mutate(purchaseId);
  };

  const getBadgeVariant = (status: Purchase['status']) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "cancelled":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading purchase history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <p className="text-muted-foreground">No purchase history available.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{purchase.plan}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell>₱{purchase.total}</TableCell>
                  <TableCell className="capitalize">
                    {purchase.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(purchase.status)}>
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {purchase.status === "pending" && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel Purchase Request
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this purchase request?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep it</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleCancel(purchase.id)}
                              disabled={cancelMutation.isPending}
                            >
                              Yes, cancel it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchaseHistory;