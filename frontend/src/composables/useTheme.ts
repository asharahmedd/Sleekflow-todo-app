import { ref, onMounted, watch } from 'vue';

type Theme = 'light' | 'dark';

const theme = ref<Theme>('light');

export function useTheme() {
  // Initialize theme from localStorage or system preference
  const initTheme = () => {
    const stored = localStorage.getItem('theme') as Theme | null;
    
    if (stored) {
      theme.value = stored;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark';
    }
    
    applyTheme(theme.value);
  };

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  // Watch for theme changes
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // Listen for system theme changes
  onMounted(() => {
    initTheme();
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        theme.value = e.matches ? 'dark' : 'light';
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  });

  return {
    theme,
    toggleTheme,
    initTheme
  };
}
