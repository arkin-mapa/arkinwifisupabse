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
      case 'approved': return 'bg-[#4CAF50] text-white';
      case 'pending': return 'bg-[#FFC107] text-black';
      case 'rejected': return 'bg-red-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (!purchases || purchases.length === 0) {
    return (
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">No purchase requests to review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md shadow-none border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-3xl font-bold">Purchase Requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-4 px-4 pb-4">
            {purchases.map((purchase) => (
              <div 
                key={purchase.id} 
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-bold">{purchase.plan}</h4>
                      <p className="text-gray-500 text-sm">
                        {purchase.date}
                      </p>
                    </div>
                    <Badge 
                      className={`${getStatusColor(purchase.status)} rounded-full px-4 py-1 text-sm font-medium border-none`}
                    >
                      {purchase.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Quantity: {purchase.quantity}</span>
                    <span className="font-bold text-lg">₱{purchase.total.toFixed(2)}</span>
                  </div>
                  {purchase.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-9 text-sm flex-1 bg-[#4CAF50] hover:bg-[#45a049] border-none"
                        onClick={() => handleApprove(purchase.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-9 text-sm flex-1 border-none"
                        onClick={() => handleReject(purchase.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {purchase.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-9 text-sm mt-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(purchase.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PendingPurchases;