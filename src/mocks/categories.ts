// MOCK DATA: simulated, not real.
import type { Category } from '@/services/types';

export const CATEGORIES: Category[] = [
  { id: 'console-systems', slug: 'console-systems', name: { en: 'Console Systems', ar: 'أجهزة الألعاب' }, image: '/products/console-systems.svg' },
  { id: 'controllers-input', slug: 'controllers-input', name: { en: 'Controllers & Input', ar: 'وحدات التحكم والإدخال' }, image: '/products/controllers-input.svg' },
  { id: 'vr-simulation', slug: 'vr-simulation', name: { en: 'VR & Simulation', ar: 'الواقع الافتراضي والمحاكاة' }, image: '/products/vr-simulation.svg' },
  { id: 'digital-games', slug: 'digital-games', name: { en: 'Digital Games', ar: 'الألعاب الرقمية' }, image: '/products/digital-games.svg' },
  { id: 'gift-cards', slug: 'gift-cards', name: { en: 'Gift Cards', ar: 'بطاقات الهدايا' }, image: '/products/gift-cards.svg' },
];
