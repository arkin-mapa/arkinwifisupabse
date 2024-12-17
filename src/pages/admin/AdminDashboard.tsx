import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import PlansManager from "@/components/admin/PlansManager";
import SalesSummary from "@/components/admin/SalesSummary";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/plans";
import { fetchPurchases } from "@/utils/supabaseData";
import { toast } from "sonner";

const AdminDashboard = () => {
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
      toast.error("Failed to load sales data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-6 space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold mb-4">Sales Overview</h2>
          <SalesSummary purchases={purchases} />
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <Card className="p-4">
              <PlansManager />
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card className="p-4">
              <PendingPurchases onPurchaseUpdate={loadPurchases} />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;