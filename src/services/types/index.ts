/**
 * Domain types shared by services, hooks and components. These are the contract a real backend
 * must satisfy. Money is always integer piasters (EGP x 100); never store a float price.
 */

export type LocalizedString = { en: string; ar: string };

export type Money = { amount: number; currency: 'EGP' };

export type Stock = 'in_stock' | 'low_stock' | 'out_of_stock';

export type Page<T> = { items: T[]; nextCursor: string | null; total: number };

export type Category = {
  id: string;
  slug: string;
  name: LocalizedString;
  image: string;
};

export type Variant = {
  id: string;
  sku: string;
  label: LocalizedString;
  /** Swatch colour for colour variants (display only). */
  colorHex?: string;
  /** Overrides the product price when set. */
  price?: Money;
  /** Units available. Authoritative stock lives on the server. */
  quantity: number;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: LocalizedString;
  description: LocalizedString;
  brand: string;
  categoryId: string;
  price: Money;
  compareAtPrice?: Money;
  rating: number;
  reviewCount: number;
  images: string[];
  videoUrl?: string;
  variants: Variant[];
  /** Shown as a protection or warranty badge, e.g. "1-year warranty". */
  protection?: LocalizedString;
  createdAt: string;
  /** Lower is better. Drives the best-selling sort. */
  salesRank: number;
};

export type CartItem = { productId: string; variantId: string; quantity: number };

export type Address = {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  governorate: string;
  country: 'EG';
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  /** Up to two telephone numbers. */
  phones: string[];
  addresses: Address[];
  memberSince: string;
};

/** Payment lifecycle. Only a server-confirmed status may move a payment to SUCCEEDED. */
export type PaymentState =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderLine = {
  productId: string;
  variantId: string;
  name: LocalizedString;
  quantity: number;
  unitPrice: Money;
};

export type Order = {
  id: string;
  number: string;
  placedAt: string;
  status: OrderStatus;
  paymentState: PaymentState;
  lines: OrderLine[];
  subtotal: Money;
  shipping: Money;
  total: Money;
  address: Address;
  trackingNumber?: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type GiftCardStatus = 'valid' | 'redeemed' | 'expired' | 'disabled';

export type GiftCard = {
  id: string;
  /** Only the last four characters; full codes never reach the browser. */
  codeSuffix: string;
  initialValue: Money;
  balance: Money;
  status: GiftCardStatus;
  expiresAt?: string;
};
