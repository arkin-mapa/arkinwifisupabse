import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { CreditBalanceCard } from "@/components/client/credits/CreditBalance";
import { motion } from "framer-motion";
import { LogOut, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-900">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Internet Plans
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
        className="pb-20"
      >
        <div className="p-4">
          <CreditBalanceCard />
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <div className="sticky top-[52px] z-40 bg-white border-b">
            <TabsList className="w-full justify-between rounded-none">
              <TabsTrigger value="plans" className="flex-1">Plans</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1">Vouchers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans" className="m-0">
            <PlansList />
          </TabsContent>
          
          <TabsContent value="history" className="m-0 p-4">
            <PurchaseHistory />
          </TabsContent>
          
          <TabsContent value="wallet" className="m-0 p-4">
            <VoucherWallet />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;