import { Receipt, PredefinedService } from '../types';
import { db } from './firebase';
import { collection, getDocs, setDoc, doc, updateDoc, getDoc, addDoc, query, orderBy } from 'firebase/firestore';

const SERVICES_KEY = 'demo_services';
const PAYMENT_METHODS_KEY = 'demo_payment_methods';

export async function getReceipts(): Promise<Receipt[]> {
  const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receipt));
}

export async function saveReceipt(receipt: Receipt): Promise<string> {
  const newReceiptRef = doc(collection(db, 'receipts'));
  await setDoc(newReceiptRef, { ...receipt, id: newReceiptRef.id });
  return newReceiptRef.id;
}

export async function updateReceipt(updatedReceipt: Receipt): Promise<void> {
  if (!updatedReceipt.id) return;
  const docRef = doc(db, 'receipts', updatedReceipt.id);
  await updateDoc(docRef, updatedReceipt as any);
}

export async function getReceiptById(id: string): Promise<Receipt | undefined> {
  const docRef = doc(db, 'receipts', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Receipt;
  }
  return undefined;
}

export async function generateReceiptNumber(): Promise<string> {
  // A simple generation method, not highly concurrency-safe but okay for now
  const receipts = await getReceipts();
  const year = new Date().getFullYear();
  const count = receipts.length + 1;
  return `DS-${year}-${count.toString().padStart(5, '0')}`;
}

export async function getPredefinedServices(): Promise<PredefinedService[]> {
  const docRef = doc(db, 'settings', 'services');
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().list) {
    return snap.data().list;
  }
  return [
    { id: '1', name: 'Web Development', defaultAmount: 15000 },
    { id: '2', name: 'Digital Marketing', defaultAmount: 5000 },
    { id: '3', name: 'Domain & Hosting', defaultAmount: 3500 },
  ];
}

export async function savePredefinedService(service: PredefinedService): Promise<void> {
  const services = await getPredefinedServices();
  services.push(service);
  await setDoc(doc(db, 'settings', 'services'), { list: services });
}

export async function deletePredefinedService(id: string): Promise<void> {
  let services = await getPredefinedServices();
  services = services.filter(s => s.id !== id);
  await setDoc(doc(db, 'settings', 'services'), { list: services });
}

export async function getPaymentMethods(): Promise<string[]> {
  const docRef = doc(db, 'settings', 'payment_methods');
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().list) {
    return snap.data().list;
  }
  return ['eSewa', 'Khalti', 'Bank Transfer', 'Cash'];
}

export async function savePaymentMethods(methods: string[]): Promise<void> {
  await setDoc(doc(db, 'settings', 'payment_methods'), { list: methods });
}
