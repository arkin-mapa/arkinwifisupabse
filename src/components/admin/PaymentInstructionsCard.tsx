import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentInstructionsProps {
  instructions: Record<string, string>;
  setInstructions: (instructions: Record<string, string>) => void;
}

const PaymentInstructionsCard = ({ instructions, setInstructions }: PaymentInstructionsProps) => {
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const handleSaveInstructions = () => {
    if (selectedPaymentMethod) {
      toast.success("Payment instructions updated successfully");
      setEditingInstructions(false);
      setSelectedPaymentMethod(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(instructions).map(([method, text]) => (
            <div key={method} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="capitalize">{method}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPaymentMethod(method);
                    setEditingInstructions(true);
                  }}
                >
                  Edit
                </Button>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{text}</p>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={editingInstructions} onOpenChange={setEditingInstructions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {selectedPaymentMethod} Payment Instructions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={selectedPaymentMethod ? instructions[selectedPaymentMethod] : ""}
              onChange={(e) => setInstructions({
                ...instructions,
                [selectedPaymentMethod as string]: e.target.value
              })}
              rows={5}
            />
            <Button onClick={handleSaveInstructions}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PaymentInstructionsCard;