import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

const mockPurchases = [
  {
    id: 1,
    date: "2024-02-20",
    plan: "2 hrs",
    amount: 5,
    quantity: 2,
    total: 10,
    status: "pending",
    paymentMethod: "gcash",
    customerName: "John Doe",
    paymentInstructions: "GCash Number: 09123456789\nAccount Name: Juan Dela Cruz\nPlease include the reference number in your payment."
  },
  {
    id: 2,
    date: "2024-02-19",
    plan: "4 hrs",
    amount: 10,
    quantity: 1,
    total: 10,
    status: "approved",
    paymentMethod: "cash",
    customerName: "Jane Smith"
  },
  {
    id: 3,
    date: "2024-02-18",
    plan: "6 hrs",
    amount: 15,
    quantity: 1,
    total: 15,
    status: "rejected",
    paymentMethod: "paymaya",
    customerName: "Bob Johnson"
  }
];

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState(mockPurchases);

  const handleCancel = (purchaseId: number) => {
    setPurchases(prevPurchases =>
      prevPurchases.map(purchase =>
        purchase.id === purchaseId
          ? { ...purchase, status: "cancelled" }
          : purchase
      )
    );
    toast.success("Purchase cancelled successfully");
  };

  const getBadgeVariant = (status: string) => {
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
                {purchase.status === "pending" && (
                  <div className="space-x-2">
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
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseHistory;