import type { Category } from './types';

export interface CategoryService {
  list(): Promise<Category[]>;
}
