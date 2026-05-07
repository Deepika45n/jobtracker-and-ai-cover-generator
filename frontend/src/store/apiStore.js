import { create } from 'zustand';

const useApiStore = create((set, get) => ({
  keys: { rapidApiKey: '', anthropicKey: '' },
  loadKeys: (userId) => {
    if (!userId) return;
    const stored = JSON.parse(localStorage.getItem(`jt_keys_${userId}`)) || { rapidApiKey: '', anthropicKey: '' };
    set({ keys: stored });
  },
  saveKeys: (userId, newKeys) => {
    const updated = { ...get().keys, ...newKeys };
    localStorage.setItem(`jt_keys_${userId}`, JSON.stringify(updated));
    set({ keys: updated });
  }
}));

export default useApiStore;
