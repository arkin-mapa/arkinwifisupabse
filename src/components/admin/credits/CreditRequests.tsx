import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreditRequest {
  id: string;
  client_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const CreditRequests = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_purchases')
        .select('*')
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

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_purchases')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      toast.success("Credit request approved");
      loadRequests();
    } catch (error) {
      console.error('Error approving credit request:', error);
      toast.error("Failed to approve credit request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_purchases')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      toast.success("Credit request rejected");
      loadRequests();
    } catch (error) {
      console.error('Error rejecting credit request:', error);
      toast.error("Failed to reject credit request");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Credit Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground">No pending credit requests</p>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">₱{request.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      request.status === 'pending' ? 'warning' : 
                      request.status === 'approved' ? 'success' : 
                      'destructive'
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};