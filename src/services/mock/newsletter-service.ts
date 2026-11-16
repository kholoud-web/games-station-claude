import type { NewsletterService } from '../newsletter-service';
import type { MockConfig } from './config';
import { simulate } from './latency';

/** MOCK: simulated, not real. The email is not stored, logged or sent anywhere. */
export function createMockNewsletterService(config: MockConfig): NewsletterService {
  return {
    subscribe: () => simulate(config, () => ({ status: 'subscribed' as const, simulated: true })),
  };
}
