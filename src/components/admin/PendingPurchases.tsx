import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockPurchases = [
  {
    id: 1,
    date: "2024-02-20",
    customerName: "John Doe",
    plan: "Basic",
    quantity: 2,
    amount: 10,
    paymentMethod: "gcash",
    status: "pending"
  },
  {
    id: 2,
    date: "2024-02-19",
    customerName: "Jane Smith",
    plan: "Standard",
    quantity: 1,
    amount: 25,
    paymentMethod: "cash",
    status: "pending"
  }
];

const PendingPurchases = () => {
  const handleApprove = (id: number) => {
    toast.success("Purchase approved successfully");
  };

  const handleReject = (id: number) => {
    toast.success("Purchase rejected successfully");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
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
                  <TableCell>{purchase.customerName}</TableCell>
                  <TableCell>{purchase.plan}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell>${purchase.amount}</TableCell>
                  <TableCell className="capitalize">{purchase.paymentMethod}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(purchase.id)}
                    >
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleReject(purchase.id)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingPurchases;