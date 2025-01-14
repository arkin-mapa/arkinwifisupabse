import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import mammoth from 'mammoth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  onExtracted: (vouchers: string[]) => void;
  className?: string;
  children?: React.ReactNode;
}

export function FileUploader({ onExtracted, className = '', children }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkForDuplicates = async (codes: string[]): Promise<string[]> => {
    const { data: existingVouchers, error } = await supabase
      .from('vouchers')
      .select('code')
      .in('code', codes);

    if (error) {
      console.error('Error checking for duplicates:', error);
      toast.error('Failed to check for duplicate vouchers');
      throw new Error('Failed to check for duplicate vouchers');
    }

    const existingCodes = new Set(existingVouchers?.map(v => v.code) || []);
    const uniqueCodes = codes.filter(code => !existingCodes.has(code));

    if (existingCodes.size > 0) {
      const duplicateCount = codes.length - uniqueCodes.length;
      toast.warning(`Found ${duplicateCount} duplicate voucher${duplicateCount !== 1 ? 's' : ''}. These will be skipped.`);
    }

    return uniqueCodes;
  };

  const extractVouchersFromWord = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
    try {
      // Convert ArrayBuffer to Uint8Array which mammoth can handle
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const { value: html } = await mammoth.convertToHtml({ arrayBuffer: uint8Array });

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const vouchers = new Set<string>();

      // Function to extract voucher codes from text
      const extractCodes = (text: string) => {
        const matches = text.match(/\b\d{6,14}\b/g);
        if (matches) {
          matches.forEach(code => vouchers.add(code));
        }
      };

      // Extract from table cells
      doc.querySelectorAll('td').forEach(cell => {
        const text = cell.textContent?.trim() || '';
        extractCodes(text);
      });

      // Extract from paragraphs and spans
      doc.querySelectorAll('p, span').forEach(element => {
        const text = element.textContent?.trim() || '';
        extractCodes(text);
      });

      const voucherArray = Array.from(vouchers).sort();

      if (voucherArray.length === 0) {
        toast.error('No valid voucher codes found in the document. Please ensure your document contains numeric codes between 6-14 digits.');
        throw new Error('No valid voucher codes found in the document');
      }

      // Check for duplicates in the database
      const uniqueVouchers = await checkForDuplicates(voucherArray);

      if (uniqueVouchers.length === 0) {
        toast.error('All voucher codes in the document already exist in the system.');
        throw new Error('All voucher codes already exist');
      }

      return uniqueVouchers;

    } catch (error) {
      console.error('Error extracting vouchers:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to process the document');
      }
      throw error;
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
      toast.success(`Successfully extracted ${totalFound} unique voucher codes`, {
        description: `Range: ${vouchers[0]} to ${vouchers[vouchers.length - 1]}`
      });

      onExtracted(vouchers);
    } catch (error) {
      console.error('Error reading document:', error);
      // Error toast is already shown in extractVouchersFromWord
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
      {loading ? (
        <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs border rounded bg-gray-50 text-gray-400">
          <Loader2 size={14} className="animate-spin" />
          Processing...
        </div>
      ) : (
        children
      )}
    </div>
  );
}
