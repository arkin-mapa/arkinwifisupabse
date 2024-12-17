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
        className="container mx-auto px-4 py-6 space-y-6 mb-20"
      >
        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-[4.5rem] z-10 bg-white/80 backdrop-blur-lg rounded-lg p-1.5 border shadow-sm">
            <TabsList className="w-full grid grid-cols-3 gap-1">
              <TabsTrigger 
                value="plans" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
              >
                Plans
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
              >
                History
              </TabsTrigger>
              <TabsTrigger 
                value="wallet" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
              >
                Vouchers
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans" className="mt-6">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PlansList />
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card className="bg-white border shadow-sm p-4 rounded-lg">
              <PurchaseHistory />
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet" className="mt-6">
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