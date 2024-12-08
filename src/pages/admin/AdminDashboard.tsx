import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPurchases from "@/components/admin/PendingPurchases";
import PlansManager from "@/components/admin/PlansManager";
import { Navbar } from "@/components/ui/navbar";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto p-4 md:p-6"
      >
        <Tabs defaultValue="plans" className="space-y-4">
          <div className="sticky top-0 z-10 backdrop-blur-md rounded-xl p-2 bg-white/5 border border-white/10">
            <TabsList className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              <TabsTrigger value="plans" className="data-[state=active]:bg-white/20 text-white">
                Plans Management
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-white/20 text-white">
                Purchase Requests
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="plans">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 rounded-xl">
              <PlansManager />
            </Card>
          </TabsContent>
          
          <TabsContent value="requests">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-4 rounded-xl">
              <PendingPurchases />
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;