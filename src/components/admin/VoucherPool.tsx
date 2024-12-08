import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Voucher {
  code: string;
  planId: string;
  isUsed: boolean;
}

const VoucherPool = () => {
  const [vouchers] = useState<Record<string, Voucher[]>>({
    "2 hrs": [
      { code: "ABC123456", planId: "1", isUsed: false },
      { code: "DEF789012", planId: "1", isUsed: true },
    ],
    "4 hrs": [
      { code: "GHI345678", planId: "2", isUsed: false },
      { code: "JKL901234", planId: "2", isUsed: false },
    ],
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Voucher Pool</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(vouchers).length === 0 ? (
            <p className="text-muted-foreground">No vouchers available in the pool.</p>
          ) : (
            <ScrollArea className="h-[400px]">
              {Object.entries(vouchers).map(([planDuration, planVouchers]) => (
                <div key={planDuration} className="mb-6">
                  <h3 className="font-medium mb-2">Plan: {planDuration}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {planVouchers.map((voucher) => (
                      <Badge
                        key={voucher.code}
                        variant={voucher.isUsed ? "secondary" : "default"}
                        className="justify-center py-2"
                      >
                        {voucher.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoucherPool;