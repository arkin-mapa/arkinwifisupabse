import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import mammoth from "mammoth";
import { toast } from "sonner";

interface FileUploaderProps {
  onExtracted?: (vouchers: string[]) => void;
  className?: string;
}

export const FileUploader = ({ onExtracted, className }: FileUploaderProps) => {
  const [extractedVouchers, setExtractedVouchers] = useState<string[]>([]);

  const extractVouchersFromWord = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
    try {
      const uint8Array = new Uint8Array(arrayBuffer);
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: uint8Array });
      
      // Create a temporary div to parse the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Get all text content
      const textContent = tempDiv.textContent || '';
      
      // Improved regex pattern to match voucher codes
      // This will match any sequence of 6-14 digits that might be separated by spaces, dashes, or other characters
      const voucherPattern = /\b\d[\d\s-]{4,12}\d\b/g;
      
      // Find all matches and clean them
      const matches = textContent.match(voucherPattern) || [];
      const vouchers = new Set<string>();
      
      matches.forEach(match => {
        // Clean the voucher code by removing any non-digit characters
        const cleanCode = match.replace(/[^\d]/g, '');
        if (cleanCode.length >= 6 && cleanCode.length <= 14) {
          vouchers.add(cleanCode);
        }
      });

      const voucherArray = Array.from(vouchers).sort();
      
      if (voucherArray.length === 0) {
        throw new Error('No valid voucher codes found in the document');
      }

      return voucherArray;
    } catch (error) {
      console.error('Error extracting vouchers:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while extracting vouchers');
      }
      return [];
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const vouchers = await extractVouchersFromWord(arrayBuffer);
      setExtractedVouchers(vouchers);
      onExtracted?.(vouchers);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          Upload Word Document
        </Button>
        <input
          id="fileInput"
          type="file"
          accept=".docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {extractedVouchers.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base font-bold">No.</TableHead>
                <TableHead className="text-base font-bold">Voucher Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractedVouchers.map((voucher, index) => (
                <TableRow key={voucher}>
                  <TableCell className="text-lg font-bold">{index + 1}</TableCell>
                  <TableCell className="text-lg font-bold font-mono">{voucher}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FileUploader;