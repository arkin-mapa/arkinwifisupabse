import { useState, useEffect } from "react";
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
import { Trash2 } from "lucide-react";
import type { Purchase } from "@/types/plans";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = () => {
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  };

  const handleCancel = (purchaseId: number) => {
    const updatedPurchases = purchases.map(purchase =>
      purchase.id === purchaseId
        ? { ...purchase, status: "cancelled" as const }
        : purchase
    );
    
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    setPurchases(updatedPurchases);
    toast.success("Purchase cancelled successfully");
  };

  const handleDelete = async (purchaseId: number) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase || !["approved", "rejected", "cancelled"].includes(purchase.status)) {
      toast.error("Only approved, rejected, or cancelled purchases can be deleted");
      return;
    }

    try {
      // First update state to ensure immediate UI update
      setPurchases(prevPurchases => 
        prevPurchases.filter(p => p.id !== purchaseId)
      );

      // Then update localStorage
      const updatedPurchases = purchases.filter(p => p.id !== purchaseId);
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
      
      toast.success("Purchase record deleted successfully");
    } catch (error) {
      // If there's an error, reload the original state
      loadPurchases();
      toast.error("Failed to delete purchase record");
    }
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
                      <>
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
                              >
                                Yes, cancel it
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    {(purchase.status === "approved" || purchase.status === "rejected" || purchase.status === "cancelled") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Purchase Record</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this purchase record?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>No, keep it</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(purchase.id)}
                            >
                              Yes, delete it
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