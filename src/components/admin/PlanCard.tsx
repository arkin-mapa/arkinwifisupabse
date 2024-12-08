import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "@/types/plans";

interface PlanCardProps {
  plan: Plan;
  onDelete: (id: string) => void;
  onVoucherUpload: (planId: string, vouchers: string[]) => void;
}

const PlanCard = ({ plan, onDelete, onVoucherUpload }: PlanCardProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      toast({
        title: "Processing vouchers",
        description: "Extracting voucher codes from document...",
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        // Extract vouchers that are 6-10 digits with font size 14
        const vouchers = text.match(/\b\d{6,10}\b/g) || [];
        
        if (vouchers.length === 0) {
          toast({
            variant: "destructive",
            title: "No valid vouchers found",
            description: "The document doesn't contain any valid voucher codes.",
          });
          return;
        }

        onVoucherUpload(plan.id, vouchers);
        
        toast({
          title: "Success",
          description: `${vouchers.length} vouchers have been extracted and added to the pool.`,
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process vouchers. Please try again.",
      });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/msword' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        handleFileUpload(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
        });
      }
    }
  };

  return (
    <Card className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onDelete(plan.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{plan.duration}</h3>
              <p className="text-emerald-600 font-semibold">₱{plan.price}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Available vouchers: {plan.availableVouchers}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Enter voucher code" className="flex-1" />
            <Button variant="secondary">Add</Button>
          </div>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleUploadClick}
          >
            <Upload className="h-4 w-4" />
            Upload Vouchers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanCard;