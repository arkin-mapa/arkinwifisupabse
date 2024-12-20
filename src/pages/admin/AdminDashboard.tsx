import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import PlansManager from "@/components/admin/PlansManager";
import SalesSummary from "@/components/admin/SalesSummary";
import { CreditRequests } from "@/components/admin/credits/CreditRequests";
import { PaymentMethodSettings } from "@/components/admin/PaymentMethodSettings";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { Purchase } from "@/types/plans";
import { fetchPurchases } from "@/utils/supabaseData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-900">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 
                     dark:border-purple-800 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 
                     transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
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
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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

          <TabsContent value="settings">
            <Card className="p-4">
              <PaymentMethodSettings />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;