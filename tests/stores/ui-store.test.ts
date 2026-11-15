import { describe, expect, it } from 'vitest';
import { createUiStore } from '@/stores/ui-store';

describe('ui store', () => {
  it('starts with everything closed', () => {
    expect(createUiStore().getState()).toMatchObject({ mobileNavOpen: false, filterSheetOpen: false });
  });

  it('opens and closes each panel independently', () => {
    const store = createUiStore();
    store.getState().setMobileNavOpen(true);
    expect(store.getState()).toMatchObject({ mobileNavOpen: true, filterSheetOpen: false });
    store.getState().setFilterSheetOpen(true);
    store.getState().setMobileNavOpen(false);
    expect(store.getState()).toMatchObject({ mobileNavOpen: false, filterSheetOpen: true });
  });
});
