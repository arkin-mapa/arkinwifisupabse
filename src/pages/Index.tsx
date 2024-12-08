import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            WiFi Voucher Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Purchase WiFi vouchers quickly and easily
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => navigate("/client")}
              className="bg-primary hover:bg-primary/90"
            >
              Client Portal
            </Button>
            <Button 
              onClick={() => navigate("/admin")}
              variant="outline"
            >
              Admin Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;