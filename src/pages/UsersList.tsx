import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { UserProfile } from '../types';
import { Navigate } from 'react-router';

export function UsersList() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    function fetchUsers() {
      try {
        const allUsers: UserProfile[] = [
          { uid: 'demo-admin', email: 'admin@digitalsolutionnepal.com', role: 'admin', createdAt: Date.now() },
          { uid: 'demo-staff', email: 'staff@digitalsolutionnepal.com', role: 'staff', createdAt: Date.now() }
        ];
        setUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-purple-900">Staff Users</h1>
      </header>
      
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
      <div className="mt-6 text-xs text-gray-400 font-semibold uppercase tracking-wider text-center">
        Note: To create a new staff member, ask them to register via the register page.
      </div>
    </div>
  );
}
