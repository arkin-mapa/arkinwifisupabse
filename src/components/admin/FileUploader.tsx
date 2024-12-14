import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import mammoth from 'mammoth';
import { toast } from 'react-hot-toast';

interface Props {
  onExtracted: (vouchers: string[]) => void;
  className?: string;
}

export function FileUploader({ onExtracted, className = '' }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        throw new Error('No valid voucher codes found in the document. Please ensure your document contains numeric codes between 6-14 digits.');
      }

      return voucherArray;
    } catch (error) {
      console.error('Error extracting vouchers:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to process the document');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Please upload a Word document (.docx)');
      return;
    }

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const vouchers = await extractVouchersFromWord(arrayBuffer);
      
      const totalFound = vouchers.length;
      const previewCodes = vouchers.slice(0, 3).join(', ');
      
      toast(
        <div className="space-y-1">
          <p className="font-medium">Found {totalFound} voucher codes:</p>
          <p className="font-mono text-xs bg-gray-50 p-1 rounded">
            {previewCodes}...
          </p>
          <p className="text-xs text-gray-500">
            Range: {vouchers[0]} to {vouchers[vouchers.length - 1]}
          </p>
        </div>,
        { duration: 5000 }
      );

      onExtracted(vouchers);
    } catch (error) {
      console.error('Error reading document:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract voucher codes');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={loading}
      />
      <button
        type="button"
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs border rounded ${
          loading ? 'bg-gray-50 text-gray-400' : 'hover:bg-gray-50'
        }`}
        disabled={loading}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <>
            <Upload size={14} />
            Upload Vouchers
          </>
        )}
      </button>
    </div>
  );
}