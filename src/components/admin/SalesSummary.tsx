import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Purchase } from "@/types/plans";

interface SalesSummaryProps {
  purchases: Purchase[];
}

const SalesSummary = ({ purchases }: SalesSummaryProps) => {
  const totalSales = purchases.reduce((sum, purchase) => {
    return purchase.status === "approved" ? sum + purchase.total : sum;
  }, 0);

  const pendingAmount = purchases.reduce((sum, purchase) => {
    return purchase.status === "pending" ? sum + purchase.total : sum;
  }, 0);

  const approvedCount = purchases.filter(
    (purchase) => purchase.status === "approved"
  ).length;

  const pendingCount = purchases.filter(
    (purchase) => purchase.status === "pending"
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{totalSales.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            From {approvedCount} approved purchases
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{pendingAmount.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            From {pendingCount} pending requests
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {purchases.length > 0
              ? Math.round((approvedCount / purchases.length) * 100)
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            Of total {purchases.length} purchases
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₱
            {approvedCount > 0
              ? Math.round(totalSales / approvedCount).toLocaleString()
              : 0}
          </div>
          <p className="text-xs text-muted-foreground">Per approved purchase</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSummary;