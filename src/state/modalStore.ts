import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ModalType = "shortcuts" | "auth" | "export" | "settings";

export type ModalState = {
  // Modal visibility states
  shortcutsOpen: boolean;
  authOpen: boolean;
  exportOpen: boolean;
  settingsOpen: boolean;
  // Auth modal specific state
  authMode: "signin" | "signup";
};

export type ModalActions = {
  // Generic modal actions
  openModal: (type: ModalType) => void;
  closeModal: (type: ModalType) => void;
  toggleModal: (type: ModalType) => void;
  closeAllModals: () => void;

  // Specific modal actions
  openShortcuts: () => void;
  closeShortcuts: () => void;

  openAuth: (mode?: "signin" | "signup") => void;
  closeAuth: () => void;

  openExport: () => void;
  closeExport: () => void;

  openSettings: () => void;
  closeSettings: () => void;

  setAuthMode: (mode: "signin" | "signup") => void;
};

export type ModalStore = ModalState & ModalActions;

const defaultState: ModalState = {
  shortcutsOpen: false,
  authOpen: false,
  exportOpen: false,
  settingsOpen: false,
  authMode: "signin",
};

export const useModalStore = create<ModalStore>()(
  devtools(
    (set, get) => ({
      ...defaultState,

      // Generic modal actions
      openModal: (type) => {
        switch (type) {
          case "shortcuts":
            get().openShortcuts();
            break;
          case "auth":
            get().openAuth();
            break;
          case "export":
            get().openExport();
            break;
          case "settings":
            get().openSettings();
            break;
        }
      },

      closeModal: (type) => {
        switch (type) {
          case "shortcuts":
            get().closeShortcuts();
            break;
          case "auth":
            get().closeAuth();
            break;
          case "export":
            get().closeExport();
            break;
          case "settings":
            get().closeSettings();
            break;
        }
      },

      toggleModal: (type) => {
        const state = get();
        switch (type) {
          case "shortcuts":
            if (state.shortcutsOpen) {
              state.closeShortcuts();
            } else {
              state.openShortcuts();
            }
            break;
          case "auth":
            if (state.authOpen) {
              state.closeAuth();
            } else {
              state.openAuth();
            }
            break;
          case "export":
            if (state.exportOpen) {
              state.closeExport();
            } else {
              state.openExport();
            }
            break;
          case "settings":
            if (state.settingsOpen) {
              state.closeSettings();
            } else {
              state.openSettings();
            }
            break;
        }
      },

      closeAllModals: () => {
        set({
          shortcutsOpen: false,
          authOpen: false,
          exportOpen: false,
          settingsOpen: false,
        });
      },

      // Specific modal actions
      openShortcuts: () => set({ shortcutsOpen: true }),
      closeShortcuts: () => set({ shortcutsOpen: false }),

      openAuth: (mode = "signin") =>
        set({
          authOpen: true,
          authMode: mode,
        }),
      closeAuth: () => set({ authOpen: false }),

      openExport: () => set({ exportOpen: true }),
      closeExport: () => set({ exportOpen: false }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),

      setAuthMode: (mode) => set({ authMode: mode }),
    }),
    { name: "modal-store" }
  )
);

// Convenience exports for easy access
export const modalActions = {
  openModal: (type: ModalType) => useModalStore.getState().openModal(type),
  closeModal: (type: ModalType) => useModalStore.getState().closeModal(type),
  toggleModal: (type: ModalType) => useModalStore.getState().toggleModal(type),
  closeAllModals: () => useModalStore.getState().closeAllModals(),

  openShortcuts: () => useModalStore.getState().openShortcuts(),
  closeShortcuts: () => useModalStore.getState().closeShortcuts(),

  openAuth: (mode?: "signin" | "signup") =>
    useModalStore.getState().openAuth(mode),
  closeAuth: () => useModalStore.getState().closeAuth(),

  openExport: () => useModalStore.getState().openExport(),
  closeExport: () => useModalStore.getState().closeExport(),

  openSettings: () => useModalStore.getState().openSettings(),
  closeSettings: () => useModalStore.getState().closeSettings(),

  setAuthMode: (mode: "signin" | "signup") =>
    useModalStore.getState().setAuthMode(mode),
};
