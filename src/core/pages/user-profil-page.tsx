import React from 'react';
import notify from 'devextreme/ui/notify';
import { BaseFormPage } from './form-page';
import { useAuth } from '../contexts/auth-hooks';
import { ThemeContext } from '../../theme';
import { coreI18n } from '../i18n';
import type { IBaseFormPageProps } from './types';

export const UserProfilPage = () => {
  const { user, updateUserProfile } = useAuth();
  const themeContext = React.useContext(ThemeContext);

  const formData = React.useMemo(() => {
    const fullName = user?.profile.fullName || '';
    const [firstName = '', ...rest] = fullName.split(' ');

    return {
      id: user?.profile.username || '',
      firstName,
      lastName: rest.join(' '),
      email: user?.profile.email || '',
      language: user?.language || 'tr-TR',
      theme: user?.theme || 'light',
      timeZone: 'Europe/Istanbul',
      isActive: true,
      bio: '',
      phone: '',
      department: '',
      title: ''
    };
  }, [user]);

  const onCustomSave = React.useCallback(async (data: any) => {
    const fullName = `${data?.firstName || ''} ${data?.lastName || ''}`.trim();

    const result = await updateUserProfile({
      profile: {
        username: user?.profile.username || 'admin',
        fullName,
        email: data?.email || user?.profile.email || '',
      },
      language: data?.language || user?.language,
      theme: data?.theme || user?.theme,
    });

    if (result.isOk) {
      if (data?.theme) {
        themeContext?.setTheme?.(data.theme);
      }
      notify(coreI18n.profile.updated, 'success', 2000);
    } else {
      notify(result.message || coreI18n.profile.updateFailed, 'error', 2500);
    }

    return result.isOk;
  }, [updateUserProfile, user, themeContext]);

  const userProfileMeta: IBaseFormPageProps = React.useMemo(() => ({
    caption: coreI18n.profile.pageCaption,
    breadcrumb: { path: '/profile' },
    detailCaption: coreI18n.profile.detailCaption,
    formOptions: {
      formAllowOptions: {
        allowSave: true,
        allowNew: false,
        allowDelete: false,
        allowEdit: true
      },
      id: 'user-profile-form',
      formData,
      onCustomSave,
      colCount: 8,
      items: [
        {
          itemType: 'group',
          caption: coreI18n.profile.sectionPersonalInfo,
          colSpan: 4,
          colCount: 4,
          items: [
            { dataField: 'id', colSpan: 2, editorOptions: { readOnly: true } },
            {
              dataField: 'firstName',
              colSpan: 2,
              isRequired: true,
              validationRules: [{ type: 'required', message: coreI18n.profile.firstNameRequired }]
            },
            {
              dataField: 'lastName',
              colSpan: 2,
              isRequired: true,
              validationRules: [{ type: 'required', message: coreI18n.profile.lastNameRequired }]
            },
            {
              dataField: 'email',
              colSpan: 2,
              isRequired: true,
              validationRules: [
                { type: 'required', message: coreI18n.profile.emailRequired },
                { type: 'email', message: coreI18n.profile.emailInvalid }
              ]
            },
          ]
        },
        {
          itemType: 'group',
          caption: coreI18n.profile.sectionPreferences,
          colSpan: 4,
          colCount: 4,
          items: [
            {
              dataField: 'language',
              colSpan: 2,
              editorType: 'dxSelectBox',
              editorOptions: {
                items: ['tr-TR', 'en-US', 'de-DE']
              }
            },
            {
              dataField: 'theme',
              colSpan: 2,
              editorType: 'dxSelectBox',
              editorOptions: {
                items: ['light', 'dark']
              }
            },
          ]
        }
      ]
    },
    detailItems: []
  }), [formData, onCustomSave]);

  return <BaseFormPage key='user-profile' {...userProfileMeta} />;
};
