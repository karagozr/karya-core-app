import { useCallback } from 'react';
import SelectBox from 'devextreme-react/select-box';
import notify from 'devextreme/ui/notify';
import { useAuth } from '../../core/contexts/auth-hooks';

const languageOptions = [
  { id: 'tr-TR', text: 'TR' },
  { id: 'en-US', text: 'EN' },
  { id: 'de-DE', text: 'DE' },
];

export const LanguageSwitcher = () => {
  const { user, updateUserProfile } = useAuth();

  const handleValueChanged = useCallback(async (e: any) => {
    const selectedLanguage = e.value as string;

    if (!selectedLanguage || selectedLanguage === user?.language) {
      return;
    }

    const result = await updateUserProfile({ language: selectedLanguage });

    if (!result.isOk) {
      notify(result.message || 'Dil guncellenemedi.', 'error', 2000);
    }
  }, [updateUserProfile, user?.language]);

  return (
    <SelectBox
      width={82}
      valueExpr={'id'}
      displayExpr={'text'}
      dataSource={languageOptions}
      value={user?.language || 'tr-TR'}
      onValueChanged={handleValueChanged}
      stylingMode={'outlined'}
      inputAttr={{ 'aria-label': 'Language' }}
    />
  );
};
