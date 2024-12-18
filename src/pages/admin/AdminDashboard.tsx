import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import PlansManager from "@/components/admin/PlansManager";
import SalesSummary from "@/components/admin/SalesSummary";
import { CreditRequests } from "@/components/admin/credits/CreditRequests";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/plans";
import { fetchPurchases } from "@/utils/supabaseData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

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
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
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

          <TabsContent value="credits">
            <CreditRequests />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;