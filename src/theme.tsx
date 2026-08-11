import React, { useCallback, useMemo, useState } from 'react';

const themes = ['light', 'dark'];
const themeClassNamePrefix = 'dx-swatch-';

function getInitialTheme() {
  try {
    const rawSession = localStorage.getItem('auth-session');
    if (!rawSession) {
      return getNextTheme();
    }

    const session = JSON.parse(rawSession) as { theme?: string };
    return themes.includes(session.theme || '') ? (session.theme as string) : getNextTheme();
  } catch {
    return getNextTheme();
  }
}

let currentTheme = getInitialTheme();

function getNextTheme(theme = '') {
  return themes[themes.indexOf(theme) + 1] || themes[0];
}

function getCurrentTheme() {
  return currentTheme;
}

function toggleTheme(prevTheme: string) {
  const isCurrentThemeDark = prevTheme === 'dark';
  const newTheme = getNextTheme(prevTheme);

  document.getElementById('root')?.classList.replace(
    themeClassNamePrefix + prevTheme,
    themeClassNamePrefix + newTheme
  );

  const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
  const additionalClassNamePostfix = isCurrentThemeDark ? '-' + prevTheme : '';
  const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`

  document.getElementById('root')?.querySelector(`.${additionalClassName}`)?.classList
    .replace(additionalClassName, additionalClassNamePrefix + (isCurrentThemeDark ? '' : '-dark'));

  currentTheme = newTheme;

  return newTheme;
}

function applyTheme(prevTheme: string, nextTheme: string) {
  if (prevTheme === nextTheme) {
    return nextTheme;
  }

  const isCurrentThemeDark = prevTheme === 'dark';

  document.getElementById('root')?.classList.replace(
    themeClassNamePrefix + prevTheme,
    themeClassNamePrefix + nextTheme
  );

  const additionalClassNamePrefix = themeClassNamePrefix + 'additional';
  const additionalClassNamePostfix = isCurrentThemeDark ? '-' + prevTheme : '';
  const additionalClassName = `${additionalClassNamePrefix}${additionalClassNamePostfix}`;

  document.getElementById('root')?.querySelector(`.${additionalClassName}`)?.classList
    .replace(additionalClassName, additionalClassNamePrefix + (nextTheme === 'dark' ? '-dark' : ''));

  currentTheme = nextTheme;

  return nextTheme;
}

export function useThemeContext() {
  const [theme, setTheme] = useState(getCurrentTheme());
  const switchTheme = useCallback(() => {
    let newTheme = currentTheme;
    setTheme((activeTheme) => {
      newTheme = toggleTheme(activeTheme);
      return newTheme;
    });

    return newTheme;
  }, []);
  const isDark = useCallback((): boolean => {
    return currentTheme === 'dark';
  }, []);

  const setThemeValue = useCallback((nextTheme: string) => {
    if (!themes.includes(nextTheme)) {
      return currentTheme;
    }

    setTheme((activeTheme) => applyTheme(activeTheme, nextTheme));
    return nextTheme;
  }, []);

  if (!document.getElementById('root')?.className.includes(themeClassNamePrefix)) {
    document.getElementById('root')?.classList.add(themeClassNamePrefix + theme);
  }

  return useMemo(()=> ({ theme, switchTheme, setTheme: setThemeValue, isDark }), [theme, switchTheme, setThemeValue, isDark]);
}

export const ThemeContext = React.createContext<ReturnType<typeof useThemeContext> | null>(null);
