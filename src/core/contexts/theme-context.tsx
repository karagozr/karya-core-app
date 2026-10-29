import React, { useCallback, useMemo, useState } from 'react';
import { readLocalStorage, saveLocalStorage, updateUserProfileClaims } from '../services';
import { APP_STORAGE_KEYS } from '../constants';

const themeClassNamePrefix = 'dx-swatch-';



function getCurrentTheme() {
  var sesData : string | null = readLocalStorage('theme_id');
  return sesData || 'light';
}

function toggleTheme(prevTheme: string) {
  const isCurrentThemeDark = prevTheme === 'dark';
  const newTheme = prevTheme === 'dark' ? 'light' : 'dark';

  document.getElementById('root')?.classList.replace(
    themeClassNamePrefix + prevTheme,
    themeClassNamePrefix + newTheme
  );

  const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
  const additionalClassNamePostfix = isCurrentThemeDark ? '-' + prevTheme : '';
  const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

  document.getElementById('root')?.querySelector(`.${additionalClassName}`)?.classList
    .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

  saveLocalStorage(APP_STORAGE_KEYS.themeId, newTheme);

  updateUserProfileClaims('https://localhost:7131/api/AppProfile', '', {theme: newTheme})

  return newTheme;
}

export function useThemeContext() {
  const [theme, setTheme] = useState(getCurrentTheme());
  const switchTheme = useCallback(() => setTheme((currentTheme) => toggleTheme(currentTheme)), []);
  
  const isDark = useCallback((): boolean => {
    return theme === 'dark';
  }, []);

  if (!document.getElementById('root')?.className.includes(themeClassNamePrefix)) {
    document.getElementById('root')?.classList.add(themeClassNamePrefix + theme);
  }

  return useMemo(()=> ({ theme, switchTheme, isDark }), [theme, switchTheme, isDark]);
}

export const ThemeContext = React.createContext<ReturnType<typeof useThemeContext> | null>(null);