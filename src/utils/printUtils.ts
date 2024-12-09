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
    <div class="price">Price: ₱${plan?.price.toFixed(2) || '0.00'}</div>
  </div>
`;

const getStyles = () => `
  @page {
    size: 58mm auto;
    margin: 0;
  }
  body {
    font-family: 'Courier New', monospace;
    width: 58mm;
    margin: 0;
    padding: 4mm;
    box-sizing: border-box;
  }
  .voucher {
    text-align: center;
    border-bottom: 1px dashed #000;
    padding-bottom: 4mm;
    margin-bottom: 4mm;
    page-break-inside: avoid;
  }
  .plan {
    font-size: 14px;
    margin: 2mm 0;
  }
  .code {
    font-size: 16px;
    font-weight: bold;
    margin: 2mm 0;
  }
  .price {
    font-size: 14px;
    margin: 2mm 0;
  }
`;

const createPrintWindow = () => {
  const printWindow = window.open('', '', 'width=600,height=600');
  if (!printWindow) return null;
  return printWindow;
};

export const printVoucher = (voucher: Voucher, plan: Plan | undefined) => {
  const printWindow = createPrintWindow();
  if (!printWindow) return false;

  printWindow.document.write(`
    <html>
      <head>
        <title>WiFi Voucher</title>
        <style>${getStyles()}</style>
      </head>
      <body>
        ${generateVoucherHTML(voucher, plan)}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
  return true;
};

export const printAllVouchers = (vouchers: Voucher[], plans: Plan[]) => {
  const printWindow = createPrintWindow();
  if (!printWindow) return false;

  printWindow.document.write(`
    <html>
      <head>
        <title>WiFi Vouchers</title>
        <style>${getStyles()}</style>
      </head>
      <body>
        ${vouchers.map(voucher => {
          const plan = plans.find(p => p.id === voucher.planId);
          return generateVoucherHTML(voucher, plan);
        }).join('')}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
  return true;
};