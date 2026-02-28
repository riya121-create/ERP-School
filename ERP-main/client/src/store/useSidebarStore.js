import { create } from "zustand";

const useSidebarStore = create((set) => ({
  collapsed:false,
  toggle: () => set((state) => ({ collapsed: !state.collapsed })),
  open: () => set({ collapsed: false }),
  close: () => set({ collapsed: true }),
}));

export default useSidebarStore;
