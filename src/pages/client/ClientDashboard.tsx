import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-lg font-semibold">Internet Plans</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <TabsList className="w-full justify-between rounded-none border-b">
          <TabsTrigger 
            value="plans" 
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Plans
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            History
          </TabsTrigger>
          <TabsTrigger 
            value="wallet" 
            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Vouchers
          </TabsTrigger>
        </TabsList>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pb-20"
      >
        <Tabs defaultValue="plans" className="w-full">
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