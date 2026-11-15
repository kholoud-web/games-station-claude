// MOCK DATA: simulated, not real. Prices are integer piasters (EGP x 100).
import type { LocalizedString, Money, Product, Variant } from '@/services/types';

const egp = (pounds: number): Money => ({ amount: pounds * 100, currency: 'EGP' });

function variant(id: string, sku: string, en: string, ar: string, quantity: number, colorHex?: string): Variant {
  return { id, sku, label: { en, ar }, quantity, ...(colorHex ? { colorHex } : {}) };
}

type Seed = Omit<Product, 'images' | 'createdAt'> & { createdAt: string };

const WARRANTY: LocalizedString = { en: '1-year warranty', ar: 'ضمان لمدة سنة' };

const seeds: Seed[] = [
  {
    id: 'p-001', slug: 'dualsense-edge-wireless-controller', sku: 'GS-CTL-001', brand: 'Sony', categoryId: 'controllers-input',
    name: { en: 'DualSense Edge Wireless Controller', ar: 'يد تحكم DualSense Edge اللاسلكية' },
    description: { en: 'Swappable stick caps, remappable back buttons and adjustable trigger stops.', ar: 'أغطية عصي قابلة للتبديل وأزرار خلفية قابلة لإعادة التخصيص وحدود قابلة للضبط للأزرار الزنادية.' },
    price: egp(11999), compareAtPrice: egp(13499), rating: 4.8, reviewCount: 214, protection: WARRANTY, salesRank: 1, createdAt: '2026-09-12',
    variants: [variant('p-001-black', 'GS-CTL-001-BK', 'Midnight Black', 'أسود منتصف الليل', 12, '#111418'), variant('p-001-silver', 'GS-CTL-001-SL', 'Cosmic Silver', 'فضي كوني', 3, '#c9ced6'), variant('p-001-white', 'GS-CTL-001-WH', 'Nova White', 'أبيض نوفا', 0, '#f5f8ff')],
  },
  {
    id: 'p-002', slug: 'dualsense-wireless-controller', sku: 'GS-CTL-002', brand: 'Sony', categoryId: 'controllers-input',
    name: { en: 'DualSense Wireless Controller', ar: 'يد تحكم DualSense اللاسلكية' },
    description: { en: 'Haptic feedback and adaptive triggers for PlayStation 5.', ar: 'ردود فعل لمسية وأزرار زنادية تكيفية لجهاز PlayStation 5.' },
    price: egp(3299), rating: 4.7, reviewCount: 530, protection: WARRANTY, salesRank: 2, createdAt: '2026-06-02',
    variants: [variant('p-002-white', 'GS-CTL-002-WH', 'White', 'أبيض', 40, '#f5f8ff'), variant('p-002-black', 'GS-CTL-002-BK', 'Black', 'أسود', 25, '#111418')],
  },
  {
    id: 'p-003', slug: 'pulse-3d-wireless-headset', sku: 'GS-AUD-001', brand: 'Sony', categoryId: 'controllers-input',
    name: { en: 'PULSE 3D Wireless Headset', ar: 'سماعة PULSE 3D اللاسلكية' },
    description: { en: 'Tuned for 3D audio on PlayStation 5 with dual noise-cancelling microphones.', ar: 'مضبوطة للصوت ثلاثي الأبعاد على PlayStation 5 مع ميكروفونين لإلغاء الضوضاء.' },
    price: egp(4299), rating: 4.6, reviewCount: 188, protection: WARRANTY, salesRank: 4, createdAt: '2026-05-20',
    variants: [variant('p-003-white', 'GS-AUD-001-WH', 'White', 'أبيض', 18, '#f5f8ff')],
  },
  {
    id: 'p-004', slug: 'dualsense-charging-station', sku: 'GS-PWR-001', brand: 'Sony', categoryId: 'controllers-input',
    name: { en: 'DualSense Charging Station', ar: 'محطة شحن DualSense' },
    description: { en: 'Charge two DualSense controllers at once, no cable needed.', ar: 'اشحن يدّي تحكم DualSense في وقت واحد بدون كابل.' },
    price: egp(1299), rating: 4.5, reviewCount: 97, salesRank: 6, createdAt: '2026-04-11',
    variants: [variant('p-004-std', 'GS-PWR-001-ST', 'Standard', 'قياسي', 60, '#f5f8ff')],
  },
  {
    id: 'p-005', slug: 'playstation-5-slim-disc', sku: 'GS-CON-001', brand: 'Sony', categoryId: 'console-systems',
    name: { en: 'PlayStation 5 Slim (Disc Edition)', ar: 'بلايستيشن 5 سليم (إصدار الأقراص)' },
    description: { en: '1 TB SSD, 4K gaming and a disc drive.', ar: 'ذاكرة SSD بسعة 1 تيرابايت وألعاب بدقة 4K ومشغل أقراص.' },
    price: egp(27999), rating: 4.9, reviewCount: 402, protection: WARRANTY, salesRank: 3, createdAt: '2026-08-01',
    variants: [variant('p-005-std', 'GS-CON-001-ST', 'Standard', 'قياسي', 4)],
  },
  {
    id: 'p-006', slug: 'playstation-5-digital', sku: 'GS-CON-002', brand: 'Sony', categoryId: 'console-systems',
    name: { en: 'PlayStation 5 Slim (Digital Edition)', ar: 'بلايستيشن 5 سليم (الإصدار الرقمي)' },
    description: { en: '1 TB SSD, 4K gaming, digital games only.', ar: 'ذاكرة SSD بسعة 1 تيرابايت وألعاب بدقة 4K للألعاب الرقمية فقط.' },
    price: egp(24999), rating: 4.8, reviewCount: 261, protection: WARRANTY, salesRank: 5, createdAt: '2026-08-01',
    variants: [variant('p-006-std', 'GS-CON-002-ST', 'Standard', 'قياسي', 0)],
  },
  {
    id: 'p-007', slug: 'xbox-series-x', sku: 'GS-CON-003', brand: 'Microsoft', categoryId: 'console-systems',
    name: { en: 'Xbox Series X', ar: 'إكس بوكس سيريس إكس' },
    description: { en: '1 TB SSD and 4K gaming at up to 120 fps.', ar: 'ذاكرة SSD بسعة 1 تيرابايت وألعاب بدقة 4K حتى 120 إطارًا في الثانية.' },
    price: egp(26999), rating: 4.8, reviewCount: 173, protection: WARRANTY, salesRank: 7, createdAt: '2026-03-15',
    variants: [variant('p-007-std', 'GS-CON-003-ST', 'Standard', 'قياسي', 9)],
  },
  {
    id: 'p-008', slug: 'nintendo-switch-oled', sku: 'GS-CON-004', brand: 'Nintendo', categoryId: 'console-systems',
    name: { en: 'Nintendo Switch OLED', ar: 'نينتندو سويتش OLED' },
    description: { en: '7-inch OLED screen with a wide adjustable stand.', ar: 'شاشة OLED مقاس 7 بوصات مع حامل عريض قابل للضبط.' },
    price: egp(15499), rating: 4.7, reviewCount: 320, protection: WARRANTY, salesRank: 8, createdAt: '2026-02-10',
    variants: [variant('p-008-white', 'GS-CON-004-WH', 'White', 'أبيض', 14, '#f5f8ff'), variant('p-008-neon', 'GS-CON-004-NE', 'Neon', 'نيون', 7, '#ff4d6d')],
  },
  {
    id: 'p-009', slug: 'meta-quest-3-128gb', sku: 'GS-VR-001', brand: 'Meta', categoryId: 'vr-simulation',
    name: { en: 'Meta Quest 3 (128 GB)', ar: 'ميتا كويست 3 (128 جيجابايت)' },
    description: { en: 'Standalone mixed-reality headset with full-colour passthrough.', ar: 'نظارة واقع مختلط مستقلة مع عرض ملوّن للعالم الحقيقي.' },
    price: egp(21999), rating: 4.6, reviewCount: 119, protection: WARRANTY, salesRank: 9, createdAt: '2026-07-04',
    variants: [variant('p-009-std', 'GS-VR-001-ST', '128 GB', '128 جيجابايت', 11)],
  },
  {
    id: 'p-010', slug: 'racing-wheel-pro-set', sku: 'GS-SIM-001', brand: 'Logitech', categoryId: 'vr-simulation',
    name: { en: 'Racing Wheel Pro Set', ar: 'طقم عجلة سباق احترافي' },
    description: { en: 'Force-feedback wheel with pedals for PlayStation and PC.', ar: 'عجلة قيادة بردود فعل قوة مع دواسات لـ PlayStation والكمبيوتر.' },
    price: egp(14999), compareAtPrice: egp(16999), rating: 4.5, reviewCount: 64, protection: WARRANTY, salesRank: 10, createdAt: '2026-01-22',
    variants: [variant('p-010-std', 'GS-SIM-001-ST', 'Wheel + Pedals', 'عجلة + دواسات', 5)],
  },
  {
    id: 'p-011', slug: 'starfall-odyssey-ps5-digital', sku: 'GS-DIG-001', brand: 'Games Station', categoryId: 'digital-games',
    name: { en: 'Starfall Odyssey (PS5 Digital)', ar: 'رحلة سقوط النجوم (نسخة PS5 رقمية)' },
    description: { en: 'A fictional demo title used for mock data. Delivered as a digital code.', ar: 'عنوان تجريبي خيالي لبيانات المحاكاة. يُسلَّم على شكل كود رقمي.' },
    price: egp(1799), rating: 4.4, reviewCount: 41, salesRank: 11, createdAt: '2026-10-01',
    variants: [variant('p-011-std', 'GS-DIG-001-ST', 'Digital code', 'كود رقمي', 500)],
  },
  {
    id: 'p-012', slug: 'neon-drift-ps5-digital', sku: 'GS-DIG-002', brand: 'Games Station', categoryId: 'digital-games',
    name: { en: 'Neon Drift (PS5 Digital)', ar: 'انجراف النيون (نسخة PS5 رقمية)' },
    description: { en: 'A fictional demo racing title used for mock data.', ar: 'لعبة سباقات تجريبية خيالية لبيانات المحاكاة.' },
    price: egp(1499), rating: 4.2, reviewCount: 18, salesRank: 13, createdAt: '2026-10-20',
    variants: [variant('p-012-std', 'GS-DIG-002-ST', 'Digital code', 'كود رقمي', 500)],
  },
  {
    id: 'p-013', slug: 'games-station-gift-card-500', sku: 'GS-GFT-500', brand: 'Games Station', categoryId: 'gift-cards',
    name: { en: 'Games Station Gift Card 500 EGP', ar: 'بطاقة هدايا Games Station بقيمة 500 جنيه' },
    description: { en: 'Digital gift card. Mock product: no real code is issued.', ar: 'بطاقة هدايا رقمية. منتج تجريبي: لا يتم إصدار كود حقيقي.' },
    price: egp(500), rating: 5, reviewCount: 12, salesRank: 12, createdAt: '2026-05-01',
    variants: [variant('p-013-std', 'GS-GFT-500-ST', '500 EGP', '500 جنيه', 999)],
  },
  {
    id: 'p-014', slug: 'games-station-gift-card-1000', sku: 'GS-GFT-1000', brand: 'Games Station', categoryId: 'gift-cards',
    name: { en: 'Games Station Gift Card 1,000 EGP', ar: 'بطاقة هدايا Games Station بقيمة 1000 جنيه' },
    description: { en: 'Digital gift card. Mock product: no real code is issued.', ar: 'بطاقة هدايا رقمية. منتج تجريبي: لا يتم إصدار كود حقيقي.' },
    price: egp(1000), rating: 5, reviewCount: 9, salesRank: 14, createdAt: '2026-05-01',
    variants: [variant('p-014-std', 'GS-GFT-1000-ST', '1,000 EGP', '1000 جنيه', 999)],
  },
];

const IMAGE_BY_CATEGORY: Record<string, string> = {
  'console-systems': '/products/console-systems.svg',
  'controllers-input': '/products/controllers-input.svg',
  'vr-simulation': '/products/vr-simulation.svg',
  'digital-games': '/products/digital-games.svg',
  'gift-cards': '/products/gift-cards.svg',
};

export const PRODUCTS: Product[] = seeds.map((seed) => ({
  ...seed,
  images: [IMAGE_BY_CATEGORY[seed.categoryId] ?? '/products/console-systems.svg'],
}));
