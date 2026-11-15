import { CATEGORIES } from '@/mocks/categories';
import type { CategoryService } from '../category-service';
import type { MockConfig } from './config';
import { simulate } from './latency';

export function createMockCategoryService(config: MockConfig): CategoryService {
  return { list: () => simulate(config, () => CATEGORIES) };
}
