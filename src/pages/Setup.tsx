import React, { useState, useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router';
import { UserProfile } from '../types';

export function Setup() {
  const [loading, setLoading] = useState(true);
  const [canSetup, setCanSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUsers() {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (snap.empty) {
          setCanSetup(true);
        }
      } catch (error) {
        console.error("Error checking users", error);
      } finally {
        setLoading(false);
      }
    }
    checkUsers();
  }, []);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const auth = getAuth();
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: email,
        role: 'admin',
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to setup admin account');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Checking system status...</div>;
  if (!canSetup) return <div className="p-8 text-center">System already initialized. <a href="/login" className="text-purple-600 underline">Go to Login</a></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-sm border border-gray-200 p-8 shadow-sm">
        <h1 className="text-xl font-bold text-purple-900 mb-4 text-center">Initial Admin Setup</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Create the first administrator account.</p>
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Admin Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 p-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 p-2 text-sm" />
          </div>
          <button type="submit" disabled={creating} className="w-full bg-purple-900 text-white py-2 font-bold uppercase text-xs">
            {creating ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
