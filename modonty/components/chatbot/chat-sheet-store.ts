import { create } from "zustand";

interface ChatSheetStore {
  open: boolean;
  draft: string;
  setOpen: (open: boolean) => void;
  setDraft: (draft: string) => void;
}

export const useChatSheetStore = create<ChatSheetStore>((set) => ({
  open: false,
  draft: "",
  setOpen: (open) => set({ open }),
  setDraft: (draft) => set({ draft }),
}));
