import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Receipt } from '../types';
import { formatCurrency } from '../lib/utils';
import { Download, FileText, Send } from 'lucide-react';
import { getReceipts } from '../lib/localDb';

export function ReceiptsList() {
  const { profile } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReceipts() {
      if (!profile) return;
      try {
        let allReceipts = await getReceipts();
        
        if (profile.role === 'staff') {
          allReceipts = allReceipts.filter(r => r.createdBy === profile.uid);
        }

        allReceipts.sort((a, b) => b.createdAt - a.createdAt);
        setReceipts(allReceipts);
      } catch (error) {
        console.error("Error fetching receipts", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReceipts();
  }, [profile]);

  if (loading) {
    return <div className="p-4">Loading receipts...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-purple-900">All Receipts</h1>
      </header>
      
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 font-bold uppercase text-xs border-b border-gray-200 bg-gray-50/50 tracking-wider">
                <th className="px-6 py-4 text-left">Receipt No</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-900">{receipt.receiptNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">{new Date(receipt.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{receipt.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{formatCurrency(receipt.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs font-bold rounded-sm bg-gray-100 text-gray-600 uppercase">
                        {receipt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                      <Link to={`/receipt/${receipt.id}`} className="text-orange-600 hover:text-orange-700 font-bold uppercase text-xs tracking-wider">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
