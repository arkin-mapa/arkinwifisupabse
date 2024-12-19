import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Upload } from "lucide-react";
import { Plan } from "@/types/plans";
import { FileUploader } from "./FileUploader";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: string) => void;
  onVoucherExtracted: (planId: string, codes: string[]) => void;
}

const PlanCard = ({ plan, onDelete, onVoucherExtracted }: PlanCardProps) => {
  const handleVoucherExtracted = (codes: string[]) => {
    onVoucherExtracted(plan.id, codes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{plan.duration}</h3>
              <p className="text-2xl font-bold text-primary">₱{plan.price.toFixed(2)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(plan.id)}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-2">
              <Badge variant={plan.availableVouchers > 0 ? "default" : "destructive"} className="px-2.5 py-0.5">
                {plan.availableVouchers} voucher{plan.availableVouchers !== 1 ? 's' : ''} available
              </Badge>
            </div>
            <div className="relative">
              <FileUploader 
                onExtracted={handleVoucherExtracted}
                className="w-full bg-background/50 hover:bg-background/80 transition-colors border-2 border-dashed rounded-lg p-4 text-center"
              >
                <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload vouchers</span>
              </FileUploader>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlanCard;