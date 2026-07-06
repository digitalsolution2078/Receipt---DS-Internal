import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getPaymentMethods, savePaymentMethods, getPredefinedServices, savePredefinedService, PredefinedService } from '../lib/localDb';
import { Trash2, Plus } from 'lucide-react';
import { Navigate } from 'react-router';

export function Settings() {
  const { profile, loading } = useAuth();
  
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [newMethod, setNewMethod] = useState('');
  
  const [services, setServices] = useState<PredefinedService[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceAmount, setNewServiceAmount] = useState('');

  useEffect(() => {
    setPaymentMethods(getPaymentMethods());
    setServices(getPredefinedServices());
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/" replace />;

  const handleAddMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.trim()) return;
    if (paymentMethods.includes(newMethod.trim())) {
      alert("Payment method already exists");
      return;
    }
    const updated = [...paymentMethods, newMethod.trim()];
    setPaymentMethods(updated);
    savePaymentMethods(updated);
    setNewMethod('');
  };

  const handleDeleteMethod = (method: string) => {
    const updated = paymentMethods.filter(m => m !== method);
    setPaymentMethods(updated);
    savePaymentMethods(updated);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServiceAmount) return;
    
    const newService: PredefinedService = {
      id: Date.now().toString(),
      name: newServiceName.trim(),
      defaultAmount: parseFloat(newServiceAmount) || 0
    };
    
    const updated = [...services, newService];
    setServices(updated);
    // Actually we need to rewrite `savePredefinedService` to save array or we can just push.
    // In localDb it pushes to array. So we can just call savePredefinedService.
    savePredefinedService(newService);
    setNewServiceName('');
    setNewServiceAmount('');
  };

  // For delete service we need to update localDb as well, let's just rewrite the storage manually or add a delete function.
  const handleDeleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    localStorage.setItem('demo_services', JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-purple-900">Admin Settings</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Payment Methods */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-purple-900 uppercase tracking-widest mb-4">Payment Methods</h2>
          
          <form onSubmit={handleAddMethod} className="flex gap-2 mb-6">
            <input
              type="text"
              value={newMethod}
              onChange={e => setNewMethod(e.target.value)}
              placeholder="e.g. Fonepay"
              className="flex-1 border border-gray-200 rounded-sm p-2 text-sm focus:border-purple-500 focus:outline-none"
            />
            <button type="submit" className="bg-purple-900 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-1 hover:bg-purple-800">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <ul className="space-y-2">
            {paymentMethods.map(method => (
              <li key={method} className="flex justify-between items-center bg-gray-50 p-3 rounded-sm border border-gray-100">
                <span className="font-semibold text-gray-700 text-sm">{method}</span>
                <button onClick={() => handleDeleteMethod(method)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Predefined Services */}
        <div className="bg-white rounded-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-purple-900 uppercase tracking-widest mb-4">Predefined Services</h2>
          
          <form onSubmit={handleAddService} className="flex gap-2 mb-6">
            <input
              type="text"
              required
              value={newServiceName}
              onChange={e => setNewServiceName(e.target.value)}
              placeholder="Service Name"
              className="flex-[2] border border-gray-200 rounded-sm p-2 text-sm focus:border-purple-500 focus:outline-none"
            />
            <input
              type="number"
              required
              min="0"
              value={newServiceAmount}
              onChange={e => setNewServiceAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 border border-gray-200 rounded-sm p-2 text-sm focus:border-purple-500 focus:outline-none"
            />
            <button type="submit" className="bg-purple-900 text-white px-3 py-2 rounded-sm text-sm font-bold flex items-center gap-1 hover:bg-purple-800">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>

          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {services.map(service => (
              <li key={service.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-sm border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-700 text-sm">{service.name}</p>
                  <p className="text-xs text-gray-500 font-medium">₹{service.defaultAmount.toFixed(2)}</p>
                </div>
                <button onClick={() => handleDeleteService(service.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
}
