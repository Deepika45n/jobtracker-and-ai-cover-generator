import { create } from 'zustand';

const useThemeStore = create((set) => {
  const prefs = JSON.parse(localStorage.getItem('jt_prefs')) || { theme: 'system', accentColor: '#6c47ff' };
  
  return {
    theme: prefs.theme,
    accentColor: prefs.accentColor,
    setTheme: (theme) => set(() => {
      const current = JSON.parse(localStorage.getItem('jt_prefs')) || { theme: 'system', accentColor: '#6c47ff' };
      localStorage.setItem('jt_prefs', JSON.stringify({ ...current, theme }));
      return { theme };
    }),
    setAccentColor: (color) => set(() => {
      const current = JSON.parse(localStorage.getItem('jt_prefs')) || { theme: 'system', accentColor: '#6c47ff' };
      localStorage.setItem('jt_prefs', JSON.stringify({ ...current, accentColor: color }));
      return { accentColor: color };
    })
  };
});

export default useThemeStore;
