import { useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import DropDownButton from 'devextreme-react/drop-down-button';
import List from 'devextreme-react/list';
import './user-panel.scss';
import { useAuthContext } from '../../contexts';
import { ThemeSwitcher } from '../theme-switcher';

export interface UserPanelProps {
    menuMode: 'context' | 'list';
}

export const UserPanel = ({ menuMode }: UserPanelProps) => {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  const navigateToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);


  const menuItems = useMemo(() => ([
    {
      text: 'Profile',
      icon: 'card',
      onClick: navigateToProfile
    },
    {
      text: 'Logout',
      icon: 'runner',
      onClick: signOut
    }
  ]), [navigateToProfile, signOut]);

  const dropDownButtonAttributes = {
    class: 'user-button'
  };

  const buttonDropDownOptions = {
    width: '150px'
  };

  return (
    <div className='user-panel'>
      {menuMode === 'context' && (
        <DropDownButton
            stylingMode='text'
          icon={user?.avatarUrl?.trim() || 'user'}
            showArrowIcon={false}
            elementAttr={dropDownButtonAttributes}
            dropDownOptions={buttonDropDownOptions}
            items={menuItems}>
        </DropDownButton>
      )}
      {menuMode === 'list' && (
        <List items={menuItems} />
      )}
    </div>
  );
}
