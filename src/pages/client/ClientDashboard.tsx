import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { Navbar } from "@/components/ui/navbar";
import Background3D from "@/components/client/Background3D";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
      <Background3D />
      <Navbar />
      <div className="container mx-auto p-4 md:p-6">
        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-2 rounded-lg shadow-sm">
            <TabsList className="w-full grid grid-cols-3 gap-2">
              <TabsTrigger value="plans" className="text-sm md:text-base">Available Plans</TabsTrigger>
              <TabsTrigger value="history" className="text-sm md:text-base">Purchase History</TabsTrigger>
              <TabsTrigger value="wallet" className="text-sm md:text-base">My Vouchers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans">
            <Card className="p-4 bg-white/80 backdrop-blur-md">
              <PlansList />
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="p-4 bg-white/80 backdrop-blur-md overflow-x-auto">
              <PurchaseHistory />
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <Card className="p-4 bg-white/80 backdrop-blur-md">
              <VoucherWallet />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;