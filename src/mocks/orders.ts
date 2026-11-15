// MOCK DATA: simulated, not real. Customer and addresses are fictional.
import type { Address, Money, Order } from '@/services/types';

const egp = (pounds: number): Money => ({ amount: pounds * 100, currency: 'EGP' });

const HOME: Address = {
  id: 'addr-1', label: 'Home', recipient: 'Alex Vance', phone: '01012345678',
  line1: '12 Example Street', city: 'Nasr City', governorate: 'Cairo', country: 'EG',
};

export const ORDERS: Order[] = [
  {
    id: 'o-1003', number: 'GS-1003', placedAt: '2026-11-02T10:15:00Z', status: 'processing', paymentState: 'SUCCEEDED',
    lines: [{ productId: 'p-004', variantId: 'p-004-std', name: { en: 'DualSense Charging Station', ar: 'محطة شحن DualSense' }, quantity: 1, unitPrice: egp(1299) }],
    subtotal: egp(1299), shipping: egp(75), total: egp(1374), address: HOME,
  },
  {
    id: 'o-1002', number: 'GS-1002', placedAt: '2026-10-21T14:40:00Z', status: 'shipped', paymentState: 'SUCCEEDED',
    lines: [{ productId: 'p-001', variantId: 'p-001-black', name: { en: 'DualSense Edge Wireless Controller', ar: 'يد تحكم DualSense Edge اللاسلكية' }, quantity: 1, unitPrice: egp(11999) }],
    subtotal: egp(11999), shipping: egp(0), total: egp(11999), address: HOME, trackingNumber: 'MOCK-TRK-000271',
  },
  {
    id: 'o-1001', number: 'GS-1001', placedAt: '2026-09-30T09:05:00Z', status: 'delivered', paymentState: 'SUCCEEDED',
    lines: [{ productId: 'p-011', variantId: 'p-011-std', name: { en: 'Starfall Odyssey (PS5 Digital)', ar: 'رحلة سقوط النجوم (نسخة PS5 رقمية)' }, quantity: 2, unitPrice: egp(1799) }],
    subtotal: egp(3598), shipping: egp(0), total: egp(3598), address: HOME,
  },
];
