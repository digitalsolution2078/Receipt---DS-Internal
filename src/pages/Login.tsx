import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../lib/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    setTimeout(async () => {
      try {
        if (email === 'admin@digitalsolutionnepal.com' && password === 'Admin@123') {
          await login(email, 'admin');
          navigate('/');
        } else if (email === 'staff@digitalsolutionnepal.com' && password === 'Staff@123') {
          await login(email, 'staff');
          navigate('/');
        } else {
          setError('Invalid email or password.');
        }
      } catch (err: any) {
        setError('An error occurred during login.');
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-purple-900 rounded-sm flex items-center justify-center text-white font-bold text-3xl mb-6">DS</div>
        <h2 className="text-center text-2xl font-bold tracking-tight text-purple-900">
          Digital Solution
        </h2>
        <p className="mt-2 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
          Receipt System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-sm sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full rounded-sm border border-gray-200 px-3 py-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full rounded-sm border border-gray-200 px-3 py-2.5 bg-gray-50 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-sm bg-purple-900 py-3 px-4 text-xs font-bold uppercase tracking-widest text-white hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
            <p className="font-bold mb-2 uppercase tracking-wider text-gray-400">Demo Credentials:</p>
            <div className="space-y-2">
              <p><span className="font-semibold">Admin:</span> admin@digitalsolutionnepal.com / Admin@123</p>
              <p><span className="font-semibold">Staff:</span> staff@digitalsolutionnepal.com / Staff@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
