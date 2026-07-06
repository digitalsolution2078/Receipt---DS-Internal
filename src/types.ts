export type Role = 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  createdAt: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  amount: number;
}

export interface Receipt {
  id?: string;
  receiptNumber: string;
  date: number;
  customerName: string;
  whatsappNumber: string;
  paymentMethod: string;
  transactionId?: string;
  remarks?: string;
  services: ServiceItem[];
  totalAmount: number;
  createdBy: string;
  staffName?: string;
  createdAt: number;
}
