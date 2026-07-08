import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Receipt } from '../types';
import { formatCurrency } from '../lib/utils';
import { Receipt as ReceiptIcon, Wallet, PieChart } from 'lucide-react';
import { getReceipts } from '../lib/localDb';

export function Dashboard() {
  const { profile } = useAuth();
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [totalReceipts, setTotalReceipts] = useState(0);
  const [paymentMediumStats, setPaymentMediumStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!profile) return;
      try {
        let allReceipts = await getReceipts();
        
        if (profile.role === 'staff') {
          allReceipts = allReceipts.filter(r => r.createdBy === profile.uid);
        }

        allReceipts.sort((a, b) => b.createdAt - a.createdAt);
        
        setTotalReceipts(allReceipts.length);
        setRecentReceipts(allReceipts.slice(0, 5));

        // Calculate today's total
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayCollection = allReceipts
          .filter(r => r.date >= today.getTime())
          .reduce((sum, r) => sum + r.totalAmount, 0);
          
        setTodayTotal(todayCollection);

        // Calculate payment medium stats (Admin only or everyone?)
        if (profile.role === 'admin') {
          const stats: Record<string, number> = {};
          allReceipts.forEach(r => {
            stats[r.paymentMethod] = (stats[r.paymentMethod] || 0) + r.totalAmount;
          });
          setPaymentMediumStats(stats);
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [profile]);

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-purple-900">Receipt Management</h1>
          <p className="text-sm text-gray-500">Welcome back, {profile?.email}</p>
        </div>
        <Link
          to="/create"
          className="bg-purple-900 text-white px-5 py-2 rounded-sm text-sm font-semibold flex items-center gap-2 hover:bg-purple-800 transition-colors"
        >
          <span className="text-lg leading-none">+</span> Create New
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Today's Collection</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(todayTotal)}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-sm text-purple-900">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-sm border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Receipts</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">{totalReceipts}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-sm text-orange-600">
            <ReceiptIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {profile?.role === 'admin' && Object.keys(paymentMediumStats).length > 0 && (
        <div className="mb-8 bg-white p-6 rounded-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-900">Collection by Medium</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(paymentMediumStats).sort((a, b) => b[1] - a[1]).map(([method, amount]) => (
              <div key={method} className="bg-gray-50 p-4 rounded-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">{method}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold text-purple-900 mb-4">Recent Receipts</h2>
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 font-bold uppercase text-xs border-b border-gray-200 bg-gray-50/50 tracking-wider">
                <th className="px-6 py-4 text-left">Receipt No</th>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Method</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {recentReceipts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                recentReceipts.map((receipt) => (
                  <tr key={receipt.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-900">{receipt.receiptNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{receipt.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">{formatCurrency(receipt.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs font-bold rounded-sm bg-gray-100 text-gray-600 uppercase">
                        {receipt.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                      <Link to={`/receipt/${receipt.id}`} className="text-orange-500 hover:text-orange-600 uppercase text-xs tracking-wider">
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
