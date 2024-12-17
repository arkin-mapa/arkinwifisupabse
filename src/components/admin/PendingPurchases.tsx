import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchPurchases, updatePurchaseStatus, deletePurchase } from "@/utils/supabaseData";
import { transferVouchersToClient } from "@/utils/voucherTransfer";
import type { Purchase } from "@/types/plans";
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";

interface PendingPurchasesProps {
  onPurchaseUpdate?: () => void;
}

const PendingPurchases = ({ onPurchaseUpdate }: PendingPurchasesProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const purchasesData = await fetchPurchases();
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error("Failed to load purchases");
    }
  };

  const handleApprove = async (purchase: Purchase) => {
    try {
      // First transfer the vouchers
      await transferVouchersToClient(purchase);
      
      // Then update the purchase status
      await updatePurchaseStatus(purchase.id, "approved");
      
      await loadPurchases();
      onPurchaseUpdate?.();
      toast.success("Purchase approved and vouchers transferred successfully");
    } catch (error) {
      console.error('Error approving purchase:', error);
      toast.error(error instanceof Error ? error.message : "Failed to approve purchase");
    }
  };

  const handleReject = async (purchaseId: string) => {
    try {
      await updatePurchaseStatus(purchaseId, "rejected");
      await loadPurchases();
      onPurchaseUpdate?.();
      toast.success("Purchase rejected");
    } catch (error) {
      console.error('Error rejecting purchase:', error);
      toast.error("Failed to reject purchase");
    }
  };

  const handleDelete = async (purchaseId: string) => {
    try {
      await deletePurchase(purchaseId);
      await loadPurchases();
      onPurchaseUpdate?.();
      toast.success("Purchase deleted successfully");
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast.error("Failed to delete purchase");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (!purchases || purchases.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No purchase requests to review.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl">Purchase Requests</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="bg-card">
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{purchase.customerName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {purchase.date}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`${getStatusColor(purchase.status)} text-white text-xs`}
                    >
                      {purchase.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1 text-xs">
                    <p>Plan: {purchase.plan}</p>
                    <p>Quantity: {purchase.quantity}</p>
                    <p>Payment: {purchase.paymentMethod}</p>
                    <p className="font-medium">Total: ₱{purchase.total.toFixed(2)}</p>
                  </div>
                  {purchase.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1 bg-green-500 hover:bg-green-600"
                        onClick={() => handleApprove(purchase)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs flex-1"
                        onClick={() => handleReject(purchase.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {purchase.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 text-xs mt-2"
                      onClick={() => handleDelete(purchase.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PendingPurchases;