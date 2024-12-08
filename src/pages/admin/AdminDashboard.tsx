import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import VoucherPool from "@/components/admin/VoucherPool";
import PlansManager from "@/components/admin/PlansManager";
import { Navbar } from "@/components/ui/navbar";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4">
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <PlansManager />
          </TabsContent>
          
          <TabsContent value="vouchers">
            <Card className="p-4">
              <VoucherPool />
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card className="p-4">
              <PendingPurchases />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;