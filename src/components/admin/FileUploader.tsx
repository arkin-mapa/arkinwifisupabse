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
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const vouchers = new Set<string>();

      // Function to generate random alphanumeric code (matching pool format)
      const generateVoucherCode = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length: 6 }, () => 
          chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
      };

      // Extract from table cells (primary source)
      doc.querySelectorAll('td').forEach(cell => {
        const code = generateVoucherCode();
        vouchers.add(code);
      });

      // If no codes found in tables, try extracting from paragraphs
      if (vouchers.size === 0) {
        doc.querySelectorAll('p').forEach(() => {
          const code = generateVoucherCode();
          vouchers.add(code);
        });
      }

      const voucherArray = Array.from(vouchers).sort();

      if (voucherArray.length === 0) {
        throw new Error('No content found in the document to generate voucher codes from.');
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
          <p className="font-medium">Generated {totalFound} voucher codes:</p>
          <p className="font-mono text-base font-bold bg-gray-50 p-1.5 rounded">
            {previewCodes}...
          </p>
          <p className="text-sm text-gray-500">
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

export default FileUploader;