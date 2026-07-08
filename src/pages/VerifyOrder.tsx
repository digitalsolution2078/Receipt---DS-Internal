import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Receipt } from '../types';
import { formatCurrency } from '../lib/utils';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export function VerifyOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchReceipt() {
      if (!id) return;
      try {
        const docRef = doc(db, 'receipts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReceipt({ id: docSnap.id, ...docSnap.data() } as Receipt);
        } else {
          setError('Receipt not found.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load receipt details.');
      } finally {
        setLoading(false);
      }
    }
    fetchReceipt();
  }, [id]);

  const handleVerify = async () => {
    if (!id || !receipt) return;
    setVerifying(true);
    try {
      const docRef = doc(db, 'receipts', id);
      await updateDoc(docRef, {
        verified: true,
        verifiedAt: Date.now()
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to verify. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading verification details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!receipt) return null;

  if (success || receipt.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-sm border border-green-200 p-8 text-center shadow-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Verified Successfully</h1>
          <p className="text-gray-600 mb-6">Thank you, {receipt.customerName}. Your payment of {formatCurrency(receipt.totalAmount)} has been verified.</p>
          <button onClick={() => window.close()} className="px-6 py-2 bg-gray-900 text-white rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-gray-800">
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-sm border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
           <img src="/logo.png" alt="Digital Solution Logo" className="h-16 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
        <h1 className="text-xl font-bold text-purple-900 text-center mb-6">Digital Solution - Order Verification</h1>
        
        <div className="bg-gray-50 p-4 rounded-sm border border-gray-100 mb-6">
          <p className="text-sm text-gray-600 mb-2"><strong>Receipt No:</strong> {receipt.receiptNumber}</p>
          <p className="text-sm text-gray-600 mb-2"><strong>Customer:</strong> {receipt.customerName}</p>
          <p className="text-sm text-gray-600 mb-2"><strong>Total Amount:</strong> {formatCurrency(receipt.totalAmount)}</p>
          <div className="mt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Services:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {receipt.services.map((s, i) => (
                <li key={i}>- {s.name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-sm mb-6 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 leading-relaxed">
            By clicking verify, I confirm that I have paid the amount of <strong>{formatCurrency(receipt.totalAmount)}</strong> for the listed services. I understand and agree to the Terms & Conditions and Refund Policy of Digital Solution.
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full py-3 bg-purple-900 text-white rounded-sm font-bold uppercase tracking-widest text-sm hover:bg-purple-800 transition-colors disabled:opacity-50"
        >
          {verifying ? 'Verifying...' : 'I Agree & Verify'}
        </button>
      </div>
    </div>
  );
}
