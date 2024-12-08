import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VoucherPool = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Voucher Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No vouchers available in the pool.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPool;