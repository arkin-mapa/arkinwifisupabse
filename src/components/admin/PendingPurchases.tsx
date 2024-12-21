import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchPurchases, updatePurchaseStatus, deletePurchase } from "@/utils/supabaseData";
import type { Purchase } from "@/types/plans";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart } from "lucide-react";
import { CreditPurchaseHandler } from "./credits/CreditPurchaseHandler";
import { VoucherPurchaseHandler } from "./vouchers/VoucherPurchaseHandler";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { formatAmount } from "@/utils/formatters";

interface PendingPurchasesProps {
  onPurchaseUpdate?: () => void;
}

const PendingPurchases = ({ onPurchaseUpdate }: PendingPurchasesProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    loadPurchases();

    // Subscribe to realtime changes for purchases table
    const channel = supabase
      .channel('purchase-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        (payload) => {
          console.log('Purchase changed:', payload);
          loadPurchases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleSuccess = async () => {
    await loadPurchases();
    onPurchaseUpdate?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500';
      case 'pending': return 'bg-amber-500';
      case 'rejected': return 'bg-rose-500';
      case 'cancelled': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  if (!purchases || purchases.length === 0) {
    return (
      <Card className="bg-white/50 backdrop-blur-sm border shadow-sm">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No purchase requests to review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Purchase Requests
        </CardTitle>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <motion.div
              key={purchase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{purchase.customerName}</h4>
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
                    <div className="flex flex-col gap-1.5 text-sm">
                      {purchase.paymentMethod !== 'credit' && (
                        <>
                          <p className="text-muted-foreground">Plan: <span className="text-foreground">{purchase.plan}</span></p>
                          <p className="text-muted-foreground">Quantity: <span className="text-foreground">{purchase.quantity}</span></p>
                        </>
                      )}
                      <p className="text-muted-foreground">Payment: <span className="text-foreground capitalize">{purchase.paymentMethod}</span></p>
                      <p className="font-medium">Total: <span className="text-primary">{formatAmount(purchase.total)}</span></p>
                    </div>
                    {purchase.status === 'pending' && (
                      purchase.paymentMethod === 'credit' ? (
                        <CreditPurchaseHandler
                          purchase={purchase}
                          onSuccess={handleSuccess}
                          onReject={handleReject}
                        />
                      ) : (
                        <VoucherPurchaseHandler
                          purchase={purchase}
                          onSuccess={handleSuccess}
                          onReject={handleReject}
                        />
                      )
                    )}
                    {purchase.status !== 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-8 text-sm mt-2 text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(purchase.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default PendingPurchases;
