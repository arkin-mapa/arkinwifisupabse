import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Purchase } from "@/types/plans";
import { useState, useMemo } from "react";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";

interface SalesSummaryProps {
  purchases: Purchase[];
}

const SalesSummary = ({ purchases }: SalesSummaryProps) => {
  const [timeFrame, setTimeFrame] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");

  const filteredPurchases = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (timeFrame) {
      case "daily":
        startDate = startOfDay(now);
        break;
      case "weekly":
        startDate = startOfWeek(now);
        break;
      case "monthly":
        startDate = startOfMonth(now);
        break;
      case "yearly":
        startDate = startOfYear(now);
        break;
      default:
        startDate = startOfDay(now);
    }

    return purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.date);
      return isAfter(purchaseDate, startDate) || purchaseDate.getTime() === startDate.getTime();
    });
  }, [purchases, timeFrame]);

  const totalSales = filteredPurchases.reduce((sum, purchase) => {
    return purchase.status === "approved" ? sum + purchase.total : sum;
  }, 0);

  const approvedCount = filteredPurchases.filter(
    (purchase) => purchase.status === "approved"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={timeFrame} onValueChange={(value: any) => setTimeFrame(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
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
      </div>
    </div>
  );
};

export default SalesSummary;