import { motion } from "framer-motion";
import PlansList from "@/components/client/PlansList";
import VoucherWallet from "@/components/client/VoucherWallet";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar className="border-b shadow-sm bg-white/80 backdrop-blur-sm sticky top-0 z-50" />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 md:p-6 max-w-6xl"
      >
        <Tabs defaultValue="plans" className="space-y-6">
          <div className="sticky top-16 z-10 backdrop-blur-sm rounded-lg p-1.5 bg-white/50 border shadow-sm">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-1">
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Available Plans
              </TabsTrigger>
              <TabsTrigger 
                value="wallet"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                My Vouchers
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Purchase History
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm p-6 rounded-lg">
              <PlansList />
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm p-6 rounded-lg">
              <VoucherWallet />
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="bg-white/80 backdrop-blur-sm border shadow-sm p-6 rounded-lg">
              <PurchaseHistory />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;