import { Receipt } from '../types';

const STORAGE_KEY = 'demo_receipts';
const SERVICES_KEY = 'demo_services';
const PAYMENT_METHODS_KEY = 'demo_payment_methods';

export interface PredefinedService {
  id: string;
  name: string;
  defaultAmount: number;
}

export function getReceipts(): Receipt[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReceipt(receipt: Receipt): void {
  const receipts = getReceipts();
  receipts.push(receipt);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function updateReceipt(updatedReceipt: Receipt): void {
  let receipts = getReceipts();
  receipts = receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export function getReceiptById(id: string): Receipt | undefined {
  const receipts = getReceipts();
  return receipts.find(r => r.id === id);
}

export function generateReceiptNumber(): string {
  const receipts = getReceipts();
  const year = new Date().getFullYear();
  const count = receipts.length + 1;
  return `DS-${year}-${count.toString().padStart(5, '0')}`;
}

export function getPredefinedServices(): PredefinedService[] {
  const data = localStorage.getItem(SERVICES_KEY);
  if (data) return JSON.parse(data);
  return [
    { id: '1', name: 'Web Development', defaultAmount: 15000 },
    { id: '2', name: 'Digital Marketing', defaultAmount: 5000 },
    { id: '3', name: 'Domain & Hosting', defaultAmount: 3500 },
  ];
}

export function savePredefinedService(service: PredefinedService): void {
  const services = getPredefinedServices();
  services.push(service);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

export function getPaymentMethods(): string[] {
  const data = localStorage.getItem(PAYMENT_METHODS_KEY);
  if (data) return JSON.parse(data);
  return ['eSewa', 'Khalti', 'Bank Transfer', 'Cash'];
}

export function savePaymentMethods(methods: string[]): void {
  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods));
}
