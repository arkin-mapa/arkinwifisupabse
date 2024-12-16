import type { Voucher, Plan } from "@/types/plans";

interface PrintDimensions {
  width: number;  // in mm
  height: number; // in mm
}

const PAPER_SIZES = {
  SMALL: { width: 58, height: 210 },
  MEDIUM: { width: 58, height: 297 },
  LARGE: { width: 58, height: 3276 }
};

const generateVoucherHTML = (voucher: Voucher, plan: Plan | undefined) => `
  <div class="voucher">
    <div class="plan">${plan?.duration || 'Unknown Plan'}</div>
    <div class="code">${voucher.code}</div>
    <div class="price">Price: ₱${plan?.price?.toFixed(2) || '0.00'}</div>
  </div>
`;

const getStyles = () => `
  @page {
    size: 58mm auto;
    margin: 0;
  }
  @media screen {
    body {
      max-width: 58mm;
      margin: 0 auto;
      background: #f0f0f0;
    }
  }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    width: 58mm;
    padding: 0;
    box-sizing: border-box;
  }
  .voucher {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding: 4mm 2mm;
    margin: 0;
    height: auto;
    min-height: 15mm;
    page-break-inside: avoid;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1mm;
    background: white;
  }
  .plan {
    font-size: 14px;
    margin: 0;
    font-weight: bold;
  }
  .code {
    font-size: 18px;
    font-weight: bold;
    margin: 2mm 0;
    padding: 1mm;
    background: #f0f0f0;
    border-radius: 2px;
    line-height: 1.2;
    word-break: break-all;
  }
  .price {
    font-size: 14px;
    margin: 0;
    line-height: 1.2;
  }
  @media print {
    .voucher {
      background: white !important;
      -webkit-print-color-adjust: exact;
    }
  }
`;

const createPrintWindow = () => {
  const printWindow = window.open('', '_blank', 'width=300,height=600');
  if (!printWindow) return null;
  return printWindow;
};

export const printVoucher = (voucher: Voucher, plan: Plan | undefined) => {
  const printWindow = createPrintWindow();
  if (!printWindow) return false;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WiFi Voucher</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getStyles()}</style>
      </head>
      <body>
        ${generateVoucherHTML(voucher, plan)}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  return true;
};

export const printPlanVouchers = (vouchers: Voucher[], plan: Plan) => {
  const printWindow = createPrintWindow();
  if (!printWindow) return false;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${plan.duration} Vouchers</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getStyles()}</style>
      </head>
      <body>
        ${vouchers.map(voucher => generateVoucherHTML(voucher, plan)).join('')}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  return true;
};