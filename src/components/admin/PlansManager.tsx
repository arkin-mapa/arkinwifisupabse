import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlansManager = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Plans Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No plans configured yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlansManager;