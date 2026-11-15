import { newUuid } from '@/lib/uuid';

/**
 * A fresh key per payment attempt. The server uses it to recognise a replayed request,
 * so a retry after an unknown outcome can never charge twice.
 */
export const newIdempotencyKey = (): string => newUuid();
