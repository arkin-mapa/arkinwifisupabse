import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansManager from "@/components/admin/PlansManager";
import PurchasesTable from "@/components/admin/PurchasesTable";
import VoucherPool from "@/components/admin/VoucherPool";
import SalesSummary from "@/components/admin/SalesSummary";
import PendingPurchases from "@/components/admin/PendingPurchases";
import CreditRequests from "@/components/admin/credits/CreditRequests";
import { useQuery } from "@tanstack/react-query";
import { fetchPurchases } from "@/utils/supabaseData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [logoName, setLogoName] = useState("Admin Dashboard");

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: fetchPurchases,
    meta: {
      onError: (error: Error) => {
        console.error('Error fetching purchases:', error);
        toast.error("Failed to load purchases");
      }
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleLogoEdit = () => {
    if (isEditing) {
      if (logoName.trim()) {
        toast.success("Logo name updated successfully!");
      } else {
        setLogoName("Admin Dashboard");
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
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
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

      <div className="container mx-auto p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
          <SalesSummary purchases={purchases} />
          <PendingPurchases onPurchaseUpdate={() => {}} />
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList className="grid grid-cols-4 gap-4 bg-muted p-1">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            <PlansManager />
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <PurchasesTable 
              purchases={purchases} 
              onApprove={() => {}} 
              onReject={() => {}} 
              onDelete={() => {}} 
            />
          </TabsContent>

          <TabsContent value="vouchers" className="space-y-4">
            <VoucherPool />
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <CreditRequests />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;