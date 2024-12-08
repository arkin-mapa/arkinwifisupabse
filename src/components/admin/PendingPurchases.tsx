import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import PurchaseActions from "./PurchaseActions";
import { assignVouchersToClient } from "@/utils/purchaseUtils";

interface Purchase {
  id: number;
  date: string;
  customerName: string;
  plan: string;
  quantity: number;
  total: number;
  paymentMethod: string;
  status: string;
}

const mockPendingPurchases = [
  {
    id: 1,
    date: "2024-02-20",
    customerName: "John Doe",
    plan: "2 hrs",
    quantity: 2,
    total: 10,
    paymentMethod: "gcash",
    status: "pending"
  },
  {
    id: 2,
    date: "2024-02-21",
    customerName: "Jane Smith",
    plan: "4 hrs",
    quantity: 1,
    total: 15,
    paymentMethod: "paymaya",
    status: "pending"
  },
  {
    id: 3,
    date: "2024-02-22",
    customerName: "Bob Wilson",
    plan: "6 hrs",
    quantity: 3,
    total: 25,
    paymentMethod: "cash",
    status: "approved"
  }
];

const paymentInstructions = {
  cash: "Please visit our office at...",
  gcash: "GCash Number: 09123456789\nAccount Name: Juan Dela Cruz",
  paymaya: "PayMaya Number: 09987654321\nAccount Name: Juan Dela Cruz"
};

const PendingPurchases = () => {
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<keyof typeof paymentInstructions | null>(null);
  const [instructions, setInstructions] = useState(paymentInstructions);
  const [purchases, setPurchases] = useState<Purchase[]>(mockPendingPurchases);

  const handleApprove = (purchaseId: number) => {
    try {
      const purchase = purchases.find(p => p.id === purchaseId);
      if (!purchase) return;

      // Here you would integrate with your voucher pool management
      // For now, we'll just update the status
      setPurchases(prevPurchases =>
        prevPurchases.map(purchase =>
          purchase.id === purchaseId
            ? { ...purchase, status: "approved" }
            : purchase
        )
      );
      
      toast.success("Purchase approved and vouchers assigned to client");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve purchase");
    }
  };

  const handleReject = (purchaseId: number) => {
    setPurchases(prevPurchases =>
      prevPurchases.map(purchase =>
        purchase.id === purchaseId
          ? { ...purchase, status: "rejected" }
          : purchase
      )
    );
    toast.success("Purchase rejected");
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleSaveInstructions = () => {
    if (selectedPaymentMethod) {
      toast.success("Payment instructions updated successfully");
      setEditingInstructions(false);
      setSelectedPaymentMethod(null);
    }
  };

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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
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
                    <TableCell>{purchase.customerName}</TableCell>
                    <TableCell>{purchase.plan}</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>₱{purchase.total}</TableCell>
                    <TableCell className="capitalize">{purchase.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PurchaseActions
                        purchaseId={purchase.id}
                        status={purchase.status}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(instructions).map(([method, text]) => (
              <div key={method} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="capitalize">{method}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPaymentMethod(method as keyof typeof paymentInstructions);
                      setEditingInstructions(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editingInstructions} onOpenChange={setEditingInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedPaymentMethod} Payment Instructions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={selectedPaymentMethod ? instructions[selectedPaymentMethod] : ""}
              onChange={(e) => setInstructions(prev => ({
                ...prev,
                [selectedPaymentMethod as string]: e.target.value
              }))}
              rows={5}
            />
            <Button onClick={handleSaveInstructions}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingPurchases;