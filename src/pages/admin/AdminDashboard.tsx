import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import PlansManager from "@/components/admin/PlansManager";
import SalesSummary from "@/components/admin/SalesSummary";
import { Navbar } from "@/components/ui/navbar";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/plans";

const AdminDashboard = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    // Load purchases from localStorage
    const storedPurchases = localStorage.getItem('purchases');
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 md:p-6"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Sales Overview</h2>
          <SalesSummary purchases={purchases} />
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-16 z-10 backdrop-blur-sm rounded-lg p-1.5 bg-white/50 border shadow-sm">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1">
              <TabsTrigger value="plans" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Plans Management
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Purchase Requests
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PlansManager />
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PendingPurchases />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;