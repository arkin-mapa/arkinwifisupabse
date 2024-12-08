import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { Purchase } from "@/types/plans";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Load purchases from localStorage on component mount
  useEffect(() => {
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  }, []);

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

  const handleDelete = (purchaseId: number) => {
    const updatedPurchases = purchases.filter(purchase => purchase.id !== purchaseId);
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    setPurchases(updatedPurchases);
    toast.success("Purchase record deleted successfully");
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
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.date}</TableCell>
              <TableCell>{purchase.customerName}</TableCell>
              <TableCell>{purchase.plan}</TableCell>
              <TableCell>{purchase.quantity}</TableCell>
              <TableCell>₱{purchase.total}</TableCell>
              <TableCell>{purchase.paymentMethod}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(purchase.status)}>
                  {purchase.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-x-2">
                  {purchase.status === "pending" && (
                    <>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancel(purchase.id)}
                      >
                        Cancel
                      </Button>
                      {purchase.paymentInstructions && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info(purchase.paymentInstructions)}
                        >
                          Payment Instructions
                        </Button>
                      )}
                    </>
                  )}
                  {(purchase.status === "cancelled" || purchase.status === "rejected") && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(purchase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseHistory;