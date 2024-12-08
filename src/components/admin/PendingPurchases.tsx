import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PendingPurchases = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending purchases to review.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingPurchases;