import { create } from "zustand";

interface ChatSheetStore {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useChatSheetStore = create<ChatSheetStore>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
