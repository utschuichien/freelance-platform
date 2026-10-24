import { create } from 'zustand';

interface UIState {
  isProfileModalOpen: boolean;
  setProfileModalOpen: (isOpen: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
  isAdminMobileMenuOpen: boolean;
  setAdminMobileMenuOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isProfileModalOpen: false,
  setProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  isAdminMobileMenuOpen: false,
  setAdminMobileMenuOpen: (isOpen) => set({ isAdminMobileMenuOpen: isOpen }),
}));
