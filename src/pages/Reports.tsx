import React, { useState, useEffect } from 'react';
import { getReceipts } from '../lib/localDb';
import { Receipt } from '../types';
import { Download } from 'lucide-react';
import { formatCurrency, formatEnglishDate, formatNepaliDate } from '../lib/utils';
import Papa from 'papaparse';

export function Reports() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  
  useEffect(() => {
    async function load() {
      const data = await getReceipts();
      setReceipts(data);
    }
    load();
  }, []);

  const exportCSV = () => {
    if (receipts.length === 0) return;

    const data = receipts.map(r => ({
      'Receipt No': r.receiptNumber,
      'Date (AD)': formatEnglishDate(r.date),
      'Date (BS)': formatNepaliDate(r.date),
      'Customer Name': r.customerName,
      'WhatsApp Number': r.whatsappNumber,
      'Services': r.services.map(s => s.name).join(', '),
      'Total Amount': r.totalAmount,
      'Payment Method': r.paymentMethod,
      'Transaction ID': r.transactionId || '',
      'Verified': r.verified ? 'Yes' : 'No',
      'Created By': r.staffName || r.createdBy
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `receipts_report_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-900">Reports</h1>
        <button onClick={exportCSV} className="bg-purple-900 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2 hover:bg-purple-800 transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </header>

      <div className="bg-white rounded-sm border border-gray-200 p-6">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Total Receipts Generated</h2>
        <p className="text-3xl font-bold text-gray-900">{receipts.length}</p>
        <p className="text-sm text-gray-500 mt-2">Click the export button above to download the full detailed report of all generated receipts.</p>
      </div>
    </div>
  );
}
