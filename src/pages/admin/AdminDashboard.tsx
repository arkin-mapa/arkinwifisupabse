import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import VoucherPool from "@/components/admin/VoucherPool";
import PlansManager from "@/components/admin/PlansManager";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Purchases</TabsTrigger>
            <TabsTrigger value="vouchers">Voucher Pool</TabsTrigger>
            <TabsTrigger value="plans">Manage Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <Card className="p-4">
              <PendingPurchases />
            </Card>
          </TabsContent>
          
          <TabsContent value="vouchers">
            <Card className="p-4">
              <VoucherPool />
            </Card>
          </TabsContent>
          
          <TabsContent value="plans">
            <Card className="p-4">
              <PlansManager />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;