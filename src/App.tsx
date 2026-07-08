/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateReceipt } from './pages/CreateReceipt';
import { EditReceipt } from './pages/EditReceipt';
import { ReceiptsList } from './pages/ReceiptsList';
import { ReceiptPreview } from './pages/ReceiptPreview';
import { UsersList } from './pages/UsersList';
import { Settings } from './pages/Settings';
import { VerifyOrder } from './pages/VerifyOrder';
import { Reports } from './pages/Reports';
import { Setup } from './pages/Setup';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/verify/:id" element={<VerifyOrder />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateReceipt />} />
            <Route path="edit/:id" element={<EditReceipt />} />
            <Route path="receipts" element={<ReceiptsList />} />
            <Route path="receipt/:id" element={<ReceiptPreview />} />
            <Route path="users" element={<UsersList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>

    </AuthProvider>
  );
}
