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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { toast } from "sonner";

const ClientDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (!session) return;

    // Subscribe to credit purchase status changes
    const channel = supabase.channel('credit-purchase-status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_purchases'
        },
        (payload) => {
          console.log('Credit purchase status changed:', payload);
          if (payload.new && payload.new.status === 'approved') {
            toast.success("Your credit purchase has been approved!");
          } else if (payload.new && payload.new.status === 'rejected') {
            toast.error("Your credit purchase has been rejected.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/50 
                           dark:hover:bg-purple-800/70 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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