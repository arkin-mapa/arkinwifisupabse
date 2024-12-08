import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Voucher, Plan } from "@/types/plans";

const VoucherWallet = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedVouchers = localStorage.getItem('clientVouchers');
    const storedPlans = localStorage.getItem('wifiPlans');
    
    if (storedVouchers) {
      setVouchers(JSON.parse(storedVouchers));
    }
    if (storedPlans) {
      setPlans(JSON.parse(storedPlans));
    }

    const handleStorageChange = () => {
      const updatedVouchers = localStorage.getItem('clientVouchers');
      if (updatedVouchers) {
        setVouchers(JSON.parse(updatedVouchers));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Voucher code copied!", {
        style: { background: '#fff', border: '1px solid #e2e8f0' }
      });
    } catch (err) {
      toast.error("Failed to copy code. Please try again.", {
        style: { background: '#fff', border: '1px solid #e2e8f0' }
      });
    }
  };

  const deleteVoucher = (voucherId: string) => {
    try {
      const updatedVouchers = vouchers.filter(v => v.id !== voucherId);
      setVouchers(updatedVouchers);
      localStorage.setItem('clientVouchers', JSON.stringify(updatedVouchers));
      toast.success("Voucher deleted successfully");
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error("Failed to delete voucher. Please try again.");
    }
  };

  const printVoucher = (voucher: Voucher) => {
    const plan = plans.find(p => p.id === voucher.planId);
    const printWindow = window.open('', '', 'width=600,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>WiFi Voucher</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 400px;
                margin: 0 auto;
              }
              .voucher {
                border: 2px solid #000;
                padding: 20px;
                text-align: center;
                margin-bottom: 20px;
              }
              .code {
                font-size: 24px;
                font-weight: bold;
                padding: 10px;
                background: #f0f0f0;
                margin: 10px 0;
              }
              .plan {
                font-size: 18px;
                margin: 10px 0;
              }
              .instructions {
                font-size: 14px;
                margin-top: 20px;
                text-align: left;
              }
            </style>
          </head>
          <body>
            <div class="voucher">
              <h2>WiFi Access Voucher</h2>
              <div class="plan">${plan?.duration || 'Unknown Plan'}</div>
              <div class="code">${voucher.code}</div>
              <div class="instructions">
                <p><strong>Instructions:</strong></p>
                <ol>
                  <li>Connect to the WiFi network</li>
                  <li>Enter this voucher code when prompted</li>
                  <li>Click connect to access the internet</li>
                </ol>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      toast.error("Unable to open print window. Please check your popup settings.");
    }
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // Group vouchers by plan
  const groupedVouchers = vouchers.reduce((acc, voucher) => {
    if (!acc[voucher.planId]) {
      acc[voucher.planId] = [];
    }
    acc[voucher.planId].push(voucher);
    return acc;
  }, {} as Record<string, Voucher[]>);

  if (vouchers.length === 0) {
    return (
      <Card className="p-6 text-center border">
        <p className="text-gray-600">No vouchers available in your wallet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedVouchers).map(([planId, planVouchers], groupIndex) => {
        const plan = plans.find(p => p.id === planId);
        const isExpanded = expandedPlans[planId];
        
        return (
          <motion.div
            key={planId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="rounded-xl border bg-white p-6"
          >
            <div 
              className="flex justify-between items-center mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
              onClick={() => togglePlanExpansion(planId)}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <h3 className="text-lg font-semibold text-gray-900">
                  {plan?.duration || 'Unknown Plan'}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                {planVouchers.length} voucher{planVouchers.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {isExpanded && (
              <div className="grid gap-4">
                {planVouchers.map((voucher, index) => (
                  <motion.div
                    key={voucher.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 bg-white border hover:bg-gray-50 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800 flex-1 sm:flex-none text-center">
                            {voucher.code}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(voucher.code)}
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => printVoucher(voucher)}
                            className="text-gray-600 hover:bg-gray-100"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteVoucher(voucher.id)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default VoucherWallet;