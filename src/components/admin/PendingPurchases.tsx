import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import PaymentInstructionsCard from "./PaymentInstructionsCard";
import PurchasesTable from "./PurchasesTable";
import type { Purchase } from "@/types/plans";

const paymentInstructions = {
  cash: "Please visit our office at...",
  gcash: "GCash Number: 09123456789\nAccount Name: Juan Dela Cruz",
  paymaya: "PayMaya Number: 09987654321\nAccount Name: Juan Dela Cruz"
};

const PendingPurchases = () => {
  const [instructions, setInstructions] = useState(paymentInstructions);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

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
            <PurchasesTable
              purchases={purchases}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </CardContent>
      </Card>

      <PaymentInstructionsCard
        instructions={instructions}
        setInstructions={setInstructions}
      />
    </div>
  );
};

export default PendingPurchases;