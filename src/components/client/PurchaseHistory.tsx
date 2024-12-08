import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockPurchases = [
  {
    id: 1,
    date: "2024-02-20",
    plan: "Basic",
    amount: 5,
    status: "approved"
  },
  {
    id: 2,
    date: "2024-02-19",
    plan: "Standard",
    amount: 25,
    status: "pending"
  }
];

const PurchaseHistory = () => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockPurchases.map((purchase) => (
            <TableRow key={purchase.id}>
              <TableCell>{purchase.date}</TableCell>
              <TableCell>{purchase.plan}</TableCell>
              <TableCell>${purchase.amount}</TableCell>
              <TableCell>
                <Badge variant={purchase.status === "approved" ? "default" : "secondary"}>
                  {purchase.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PurchaseHistory;