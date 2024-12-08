import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { Navbar } from "@/components/ui/navbar";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="history">Purchase History</TabsTrigger>
            <TabsTrigger value="wallet">My Vouchers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <Card className="p-4">
              <PlansList />
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="p-4">
              <PurchaseHistory />
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <Card className="p-4">
              <VoucherWallet />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;