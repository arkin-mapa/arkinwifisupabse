import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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

  const handleApprove = (purchaseId: number) => {
    toast.success("Purchase approved successfully");
  };

  const handleReject = (purchaseId: number) => {
    toast.success("Purchase rejected successfully");
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
          <CardTitle>Pending Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          {mockPendingPurchases.length === 0 ? (
            <p className="text-muted-foreground">No pending purchases to review.</p>
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
                {mockPendingPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell>{purchase.customerName}</TableCell>
                    <TableCell>{purchase.plan}</TableCell>
                    <TableCell>{purchase.quantity}</TableCell>
                    <TableCell>₱{purchase.total}</TableCell>
                    <TableCell>{purchase.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{purchase.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-x-2">
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
                      </div>
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