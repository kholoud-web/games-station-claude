import { createStore, useStore } from 'zustand';

export type UiState = {
  mobileNavOpen: boolean;
  filterSheetOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  setFilterSheetOpen: (open: boolean) => void;
};

/** Transient interface state only. Nothing here is persisted. */
export function createUiStore() {
  return createStore<UiState>()((set) => ({
    mobileNavOpen: false,
    filterSheetOpen: false,
    setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    setFilterSheetOpen: (open) => set({ filterSheetOpen: open }),
  }));
}

export const uiStore = createUiStore();

export function useUiStore<T>(selector: (state: UiState) => T): T {
  return useStore(uiStore, selector);
}
