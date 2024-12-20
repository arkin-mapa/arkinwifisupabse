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
        return credit.transaction_type === 'deposit' 
          ? acc + Number(credit.amount) 
          : acc - Number(credit.amount);
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
    fetchBalance();
    
    // Real-time subscription for credit balance changes
    const channel = supabase
      .channel('credit-balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'credits',
          filter: `client_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('Credits changed:', payload);
          fetchBalance(); // Refresh balance when any change occurs
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return { balance, isLoading, refetchBalance: fetchBalance };
};