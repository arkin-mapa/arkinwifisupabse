import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCreditBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBalance = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        console.log('No authenticated user found');
        setIsLoading(false);
        return;
      }

      const { data: credits, error } = await supabase
        .from('credits')
        .select('amount, transaction_type')
        .eq('client_id', session.session.user.id);

      if (error) {
        console.error('Error fetching balance:', error);
        throw error;
      }

      const totalBalance = credits.reduce((acc, credit) => {
        const amount = Number(credit.amount);
        return credit.transaction_type === 'deposit' 
          ? acc + amount 
          : acc - amount;
      }, 0);

      console.log('New balance calculated:', totalBalance);
      setBalance(totalBalance);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchBalance:', error);
      toast.error("Failed to fetch credit balance");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      await fetchBalance();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Real-time subscription for credit balance changes
      const channel = supabase
        .channel('credit-balance-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'credits',
            filter: `client_id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('Credits changed:', payload);
            fetchBalance();
          }
        )
        .subscribe((status) => {
          console.log('Credit subscription status:', status);
        });

      return () => {
        console.log('Cleaning up credit subscription');
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, []);

  return { balance, isLoading, refetchBalance: fetchBalance };
};