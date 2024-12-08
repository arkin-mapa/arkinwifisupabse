import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { Navbar } from "@/components/ui/navbar";
import { motion } from "framer-motion";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 md:p-6"
      >
        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-16 z-10 backdrop-blur-sm rounded-lg p-1.5 bg-white/50 border shadow-sm">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-1">
              <TabsTrigger value="plans" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Available Plans
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Purchase History
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Vouchers
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PlansList />
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PurchaseHistory />
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <VoucherWallet />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;