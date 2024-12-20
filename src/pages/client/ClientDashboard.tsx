import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { CreditBalanceCard } from "@/components/client/credits/CreditBalance";
import { motion } from "framer-motion";
import { LogOut, Wifi, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [logoName, setLogoName] = useState("Internet Plans");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleLogoEdit = () => {
    if (isEditing) {
      if (logoName.trim()) {
        toast.success("Logo name updated successfully!");
      } else {
        setLogoName("Internet Plans");
        toast.error("Logo name cannot be empty");
      }
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-900">
        <div className="flex justify-between items-center px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 flex-1 max-w-[60%]">
            <Wifi className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
            <div className="flex items-center gap-1 min-w-0">
              {isEditing ? (
                <Input
                  value={logoName}
                  onChange={(e) => setLogoName(e.target.value)}
                  className="h-7 text-sm font-bold bg-transparent"
                  autoFocus
                />
              ) : (
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent truncate">
                  {logoName}
                </h1>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleLogoEdit}
              >
                <Edit2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 border-purple-200 hover:bg-purple-50 hover:text-purple-700 
                     dark:border-purple-800 dark:hover:bg-purple-900/50 dark:hover:text-purple-300 
                     transition-all duration-200 ml-2 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
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
          <div className="sticky top-[52px] z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b">
            <TabsList className="w-full justify-between rounded-none px-2">
              <TabsTrigger value="plans" className="flex-1 text-sm">Plans</TabsTrigger>
              <TabsTrigger value="history" className="flex-1 text-sm">History</TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1 text-sm">Vouchers</TabsTrigger>
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