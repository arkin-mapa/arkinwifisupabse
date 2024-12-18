import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditRequest {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export const CreditRequestStatus = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();

    // Subscribe to credit purchase changes
    const channel = supabase
      .channel('credit-purchase-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_purchases'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRequests = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data, error } = await supabase
        .from('credit_purchases')
        .select('*')
        .eq('client_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading credit requests:', error);
      toast.error("Failed to load credit requests");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div key={request.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">
                  Credit Request: ₱{request.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="warning" className="ml-2">
                Pending
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};