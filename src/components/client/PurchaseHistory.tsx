import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchases } from "@/hooks/usePurchases";
import { PurchaseStatus } from "./purchase/PurchaseStatus";
import { PurchaseActions } from "./purchase/PurchaseActions";

const PurchaseHistory = () => {
  const { purchases, cancelPurchase, deletePurchase } = usePurchases();

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
                    <PurchaseStatus status={purchase.status} />
                  </TableCell>
                  <TableCell>
                    <PurchaseActions
                      purchase={purchase}
                      onCancel={(id) => cancelPurchase.mutate(id)}
                      onDelete={(id) => deletePurchase.mutate(id)}
                    />
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