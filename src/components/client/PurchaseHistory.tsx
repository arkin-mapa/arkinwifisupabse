import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockPurchases = [
  {
    id: 1,
    date: "2024-02-20",
    plan: "Basic",
    quantity: 2,
    amount: 10,
    paymentMethod: "gcash",
    status: "approved"
  },
  {
    id: 2,
    date: "2024-02-19",
    plan: "Standard",
    quantity: 1,
    amount: 25,
    paymentMethod: "cash",
    status: "pending"
  }
];

const PurchaseHistory = () => {
  const handleCancel = (id: number) => {
    toast.success("Purchase cancelled successfully");
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPurchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.date}</TableCell>
              <TableCell>{purchase.plan}</TableCell>
              <TableCell>{purchase.quantity}</TableCell>
              <TableCell>${purchase.amount}</TableCell>
              <TableCell className="capitalize">{purchase.paymentMethod}</TableCell>
              <TableCell>
                <Badge variant={purchase.status === "approved" ? "default" : "secondary"}>
                  {purchase.status}
                </Badge>
              </TableCell>
              <TableCell>
                {purchase.status === "pending" && (
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleCancel(purchase.id)}
                  >
                    Cancel
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