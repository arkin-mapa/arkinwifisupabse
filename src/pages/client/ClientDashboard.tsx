import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlansList from "@/components/client/PlansList";
import PurchaseHistory from "@/components/client/PurchaseHistory";
import VoucherWallet from "@/components/client/VoucherWallet";
import { Navbar } from "@/components/ui/navbar";
import Background3D from "@/components/client/Background3D";
import { motion } from "framer-motion";

const ClientDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Background3D />
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4 md:p-6 relative z-10"
      >
        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-0 z-20 backdrop-blur-md rounded-xl p-2 bg-white/5 border border-white/10">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2">
              <TabsTrigger value="plans" className="data-[state=active]:bg-white/20 text-white">
                Available Plans
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white/20 text-white">
                Purchase History
              </TabsTrigger>
              <TabsTrigger value="wallet" className="data-[state=active]:bg-white/20 text-white">
                My Vouchers
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 rounded-xl">
              <PlansList />
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 rounded-xl overflow-x-auto">
              <PurchaseHistory />
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 rounded-xl">
              <VoucherWallet />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;