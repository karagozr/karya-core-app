import { useCallback, useContext } from 'react';
import Button from 'devextreme-react/button';
import { ThemeContext,useAuthContext } from '../../contexts';

export const ThemeSwitcher = () => {
  const themeContext = useContext(ThemeContext);
  const { updateUserProfile } = useAuthContext();

  const onButtonClick = useCallback(async () => {
    const nextTheme = themeContext?.switchTheme();

    if (!nextTheme) {
      return;
    }

    // const result = await updateUserProfile({ theme: nextTheme as 'light' | 'dark' });
    // if (!result.isOk) {
    //   notify(result.message || 'Tema guncellenemedi.', 'error', 2000);
    // }
  }, [themeContext, updateUserProfile]);

  return <div>
            <Button
              className='theme-button'
              stylingMode='text'
              icon={`${themeContext?.theme === 'dark' ? 'sun' : 'moon'}`}
              onClick={onButtonClick}
            />
        </div>;
};
