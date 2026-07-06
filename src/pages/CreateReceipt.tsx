import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../lib/AuthContext';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { generateReceiptNumber, saveReceipt, getPredefinedServices, getPaymentMethods, getReceipts } from '../lib/localDb';

export function CreateReceipt() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [staffName, setStaffName] = useState('');
  
  const [services, setServices] = useState([{ id: Date.now().toString(), name: '', amount: 0 }]);
  
  const paymentMethodsList = getPaymentMethods();
  const predefinedServices = getPredefinedServices();

  useEffect(() => {
    if (paymentMethodsList.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethodsList[0]);
    }
  }, [paymentMethodsList, paymentMethod]);

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setWhatsappNumber(val);
    
    // Lookup customer name from previous receipts
    if (val.length >= 10) {
      const allReceipts = getReceipts();
      const match = allReceipts.find(r => r.whatsappNumber === val && r.customerName);
      if (match && match.customerName) {
        setCustomerName(match.customerName);
      }
    }
  };

  const addService = () => {
    setServices([...services, { id: Date.now().toString(), name: '', amount: 0 }]);
  };

  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleServiceChange = (id: string, value: string) => {
    // Check if it matches a predefined service
    const predefined = predefinedServices.find(ps => ps.name === value);
    setServices(services.map(s => {
      if (s.id === id) {
        return {
          ...s,
          name: value,
          amount: predefined ? predefined.defaultAmount : s.amount
        };
      }
      return s;
    }));
  };

  const updateServiceAmount = (id: string, amount: number) => {
    setServices(services.map(s => {
      if (s.id === id) {
        return { ...s, amount };
      }
      return s;
    }));
  };

  const totalAmount = services.reduce((sum, service) => sum + (Number(service.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    // Validation
    const validServices = services.filter(s => s.name.trim() !== '' && s.amount > 0);
    if (validServices.length === 0) {
      alert("Please add at least one valid service with an amount greater than 0.");
      return;
    }
    
    if (!staffName.trim()) {
      alert("Please enter the name of the staff verifying the payment.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const receiptNumber = generateReceiptNumber();
        const id = Date.now().toString();
        const newReceipt = {
          id,
          receiptNumber,
          date: Date.now(),
          customerName,
          whatsappNumber,
          paymentMethod,
          transactionId,
          remarks,
          services: validServices,
          totalAmount,
          createdBy: profile.uid,
          staffName: staffName.trim(),
          createdAt: Date.now()
        };

        saveReceipt(newReceipt);
        navigate(`/receipt/${id}`);
      } catch (error) {
        console.error("Error creating receipt", error);
        alert("Failed to create receipt");
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-purple-900">Create New Receipt</h1>
      </header>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-gray-200 p-6 sm:p-8 flex flex-col">
        <h2 className="text-lg font-bold text-purple-900 mb-6">Receipt Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp Number</label>
            <input
              type="text"
              required
              value={whatsappNumber}
              onChange={handleWhatsappChange}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="e.g. 9800000000"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            >
              {paymentMethodsList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transaction ID <span className="lowercase font-normal tracking-normal text-gray-400">(Optional)</span></label>
            <input
              type="text"
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="Transaction Ref"
            />
          </div>
        </div>

        <div className="mb-8 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Services</label>
            <button
              type="button"
              onClick={addService}
              className="text-xs text-orange-600 font-bold hover:text-orange-700 uppercase tracking-wider flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Service
            </button>
          </div>
          
          <div className="space-y-3">
            <datalist id="predefined-services">
              {predefinedServices.map(ps => (
                <option key={ps.id} value={ps.name} />
              ))}
            </datalist>

            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    list="predefined-services"
                    value={service.name}
                    onChange={e => handleServiceChange(service.id, e.target.value)}
                    className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Select or type service..."
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={service.amount || ''}
                    onChange={e => updateServiceAmount(service.id, parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-sm p-2 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Amount"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeService(service.id)}
                  disabled={services.length === 1}
                  className="p-2 text-gray-300 hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-between items-center bg-purple-50 p-4 rounded-sm border border-purple-100">
             <span className="text-xs font-bold text-purple-900 uppercase tracking-widest opacity-80">Total Preview</span>
             <span className="text-lg font-bold text-purple-900">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Remarks <span className="lowercase font-normal tracking-normal text-gray-400">(Optional)</span></label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-sm p-3 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none transition-colors"
              placeholder="Additional notes..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Verified By (Staff Name)</label>
            <input
              type="text"
              required
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-auto border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-sm text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-purple-900 text-white rounded-sm font-bold hover:bg-purple-800 transition-colors uppercase text-xs tracking-widest disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate & Preview'}
          </button>
        </div>
      </form>
    </div>
  );
}
