import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransferCredits } from "./TransferCredits";
import { QRCodeGenerator } from "./QRCodeGenerator";
import { QRCodeScanner } from "./QRCodeScanner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CreditBalanceCard = () => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: credits, error } = await supabase
        .from('credits')
        .select('amount, transaction_type');

      if (error) throw error;

      const totalBalance = credits.reduce((acc, credit) => {
        return credit.transaction_type === 'deposit' 
          ? acc + Number(credit.amount) 
          : acc - Number(credit.amount);
      }, 0);

      setBalance(totalBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error("Failed to fetch credit balance");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold text-center">
          ₱{balance.toFixed(2)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <TransferCredits />
        <QRCodeGenerator />
        <QRCodeScanner />
      </CardContent>
    </Card>
  );
};