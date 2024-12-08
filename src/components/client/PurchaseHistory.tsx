import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  }
];

const PurchaseHistory = () => {
  const handleCancel = (purchaseId: number) => {
    // Here you would typically make an API call to cancel the purchase
    toast.success("Purchase cancelled successfully");
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
          {mockPurchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.date}</TableCell>
              <TableCell>{purchase.customerName}</TableCell>
              <TableCell>{purchase.plan}</TableCell>
              <TableCell>{purchase.quantity}</TableCell>
              <TableCell>₱{purchase.total}</TableCell>
              <TableCell>{purchase.paymentMethod}</TableCell>
              <TableCell>
                <Badge variant={purchase.status === "approved" ? "default" : "secondary"}>
                  {purchase.status}
                </Badge>
              </TableCell>
              <TableCell>
                {purchase.status === "pending" && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleCancel(purchase.id)}
                  >
                    Cancel
                  </Button>
                )}
                {purchase.status === "pending" && purchase.paymentInstructions && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => toast.info(purchase.paymentInstructions)}
                  >
                    Payment Instructions
                  </Button>
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