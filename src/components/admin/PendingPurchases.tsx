import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchPurchases, updatePurchaseStatus, deletePurchase } from "@/utils/supabaseData";
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

  const handleApprove = async (purchaseId: string) => {
    try {
      await updatePurchaseStatus(purchaseId, "approved");
      await loadPurchases();
      onPurchaseUpdate?.();
      toast.success("Purchase approved successfully");
    } catch (error) {
      console.error('Error approving purchase:', error);
      toast.error("Failed to approve purchase");
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
      <Card className="mx-0">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No purchase requests to review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-0">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg">Purchase Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 px-4 pb-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="p-3">
                <div className="flex flex-col gap-1.5">
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
                  <div className="flex flex-col gap-0.5 text-xs">
                    <div className="flex justify-between">
                      <span>Plan:</span>
                      <span>{purchase.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>{purchase.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <span>{purchase.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>₱{purchase.total.toFixed(2)}</span>
                    </div>
                  </div>
                  {purchase.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleApprove(purchase.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 h-8 text-xs"
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
                      className="w-full mt-2 h-8 text-xs"
                      onClick={() => handleDelete(purchase.id)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PendingPurchases;