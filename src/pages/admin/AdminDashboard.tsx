import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import PlansManager from "@/components/admin/PlansManager";
import SalesSummary from "@/components/admin/SalesSummary";
import { Navbar } from "@/components/ui/navbar";
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
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-6 space-y-6 mb-20"
      >
        <div>
          <h2 className="text-2xl font-bold mb-4">Sales Overview</h2>
          <SalesSummary purchases={purchases} />
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-[4.5rem] z-10 bg-white/80 backdrop-blur-lg rounded-lg p-1.5 border shadow-sm">
            <TabsList className="w-full grid grid-cols-2 gap-1">
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Plans
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Requests
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans" className="mt-6">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PlansManager />
            </Card>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-6">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PendingPurchases onPurchaseUpdate={loadPurchases} />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;