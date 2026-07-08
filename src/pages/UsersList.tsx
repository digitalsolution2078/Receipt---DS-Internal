import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { UserProfile } from '../types';
import { Navigate } from 'react-router';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, firebaseConfig } from '../lib/firebase';
import { Trash2, Plus } from 'lucide-react';

export function UsersList() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map(d => ({ ...d.data(), uid: d.id } as UserProfile));
      setUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setCreating(true);
    
    try {
      // Use secondary app to not log out the current admin
      const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        role: 'staff',
        createdAt: Date.now()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
      
      // Clean up secondary app (optional, but good practice, though not trivial without async delete)
      await secondaryAuth.signOut();
      
      setEmail('');
      setPassword('');
      fetchUsers();
      alert('Staff user created successfully!');
    } catch (err: any) {
      console.error("Error creating user", err);
      alert(err.message || 'Failed to create user.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-purple-900">Staff Users Management</h1>
      </header>
      
      <div className="bg-white border border-gray-200 rounded-sm p-6 mb-8">
        <h2 className="text-sm font-bold text-purple-900 uppercase tracking-widest mb-4">Add New Staff</h2>
        <form onSubmit={handleCreateUser} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none"
              placeholder="staff@digitalsolutionnepal.com"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-sm p-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none"
              placeholder="Min 6 characters"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-900 text-white rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-purple-800 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'Create Staff'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-gray-400 font-bold uppercase text-xs border-b border-gray-200 bg-gray-50/50 tracking-wider">
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {users.map((user) => (
                <tr key={user.uid} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs font-bold rounded-sm uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
