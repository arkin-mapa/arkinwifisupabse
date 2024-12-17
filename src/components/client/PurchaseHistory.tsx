import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchClientPurchases, cancelPurchase } from "@/utils/supabaseData";
import type { Purchase } from "@/types/plans";

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      const purchasesData = await fetchClientPurchases();
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error("Failed to load purchase history");
    }
  };

  const handleCancel = async (purchaseId: string) => {
    try {
      await cancelPurchase(purchaseId);
      await loadPurchases();
      toast.success("Purchase cancelled successfully");
    } catch (error) {
      console.error('Error cancelling purchase:', error);
      toast.error("Failed to cancel purchase");
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
          <p className="text-center text-muted-foreground">No purchase history available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-0">
      <CardHeader>
        <CardTitle>Purchase History</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-3 px-4 pb-4">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{purchase.plan}</h4>
                      <p className="text-sm text-muted-foreground">
                        {purchase.date}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`${getStatusColor(purchase.status)} text-white`}
                    >
                      {purchase.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Quantity: {purchase.quantity}</span>
                    <span className="font-medium">₱{purchase.total.toFixed(2)}</span>
                  </div>
                  {purchase.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(purchase.id)}
                      className="text-sm text-destructive hover:text-destructive/80 transition-colors mt-2"
                    >
                      Cancel Purchase
                    </button>
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

export default PurchaseHistory;