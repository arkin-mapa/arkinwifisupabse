import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // Add this import
import PurchaseActions from "./PurchaseActions";
import type { Purchase } from "@/types/plans";

const paymentInstructions = {
  cash: "Please visit our office at...",
  gcash: "GCash Number: 09123456789\nAccount Name: Juan Dela Cruz",
  paymaya: "PayMaya Number: 09987654321\nAccount Name: Juan Dela Cruz"
};

const PendingPurchases = () => {
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<keyof typeof paymentInstructions | null>(null);
  const [instructions, setInstructions] = useState(paymentInstructions);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // Load purchases from localStorage
  useEffect(() => {
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  }, []);

  const handleApprove = (purchaseId: number) => {
    const updatedPurchases = purchases.map(purchase =>
      purchase.id === purchaseId
        ? { ...purchase, status: "approved" as const }
        : purchase
    );
    
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    setPurchases(updatedPurchases);
    toast.success("Purchase approved successfully");
  };

  const handleReject = (purchaseId: number) => {
    const updatedPurchases = purchases.map(purchase =>
      purchase.id === purchaseId
        ? { ...purchase, status: "rejected" as const }
        : purchase
    );
    
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    setPurchases(updatedPurchases);
    toast.success("Purchase rejected");
  };

  const handleDelete = (purchaseId: number) => {
    const updatedPurchases = purchases.filter(purchase => purchase.id !== purchaseId);
    localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    setPurchases(updatedPurchases);
    toast.success("Purchase request deleted successfully");
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
                      <div className="flex items-center gap-2">
                        <PurchaseActions
                          purchaseId={purchase.id}
                          status={purchase.status}
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                        {purchase.status !== "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(purchase.id)}
                            className="text-red-500 hover:text-red-600"
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
