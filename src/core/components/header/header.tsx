import Toolbar, { Item } from 'devextreme-react/toolbar';
import Button, { type ButtonTypes } from 'devextreme-react/button';
import './header.scss';
import { Template } from 'devextreme-react/core/template';
import { LanguageSwitcher } from '../language-switcher';
import { TenantSwitcher } from '../tenant-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import { UserPanel } from '../user-panel';


export interface HeaderProps {
    menuToggleEnabled: boolean;
    title?: string;
    toggleMenu: (e: ButtonTypes.ClickEvent) => void;
}

export  const Header = ({ menuToggleEnabled, title, toggleMenu }: HeaderProps)=> {
  return (
    <header className={'header-component'}>
      <Toolbar className={'header-toolbar'}>
        <Item
          visible={menuToggleEnabled}
          location={'before'}
          widget={'dxButton'}
          cssClass={'menu-button'}
        >
          <Button icon="menu" stylingMode="text" onClick={toggleMenu} />
        </Item>
        <Item
          location={'before'}
          cssClass={'header-title'}
          text={title}
          visible={!!title}
        />
        <Item locateInMenu='auto'
          location={'after'}
        >
          <TenantSwitcher />
        </Item>
        <Item locateInMenu='auto'
          location={'after'}
        >
          <LanguageSwitcher />
        </Item>
        <Item locateInMenu='auto'
          location={'after'}
        >
          <ThemeSwitcher />
        </Item>
        <Item location='after' locateInMenu='auto' menuItemTemplate='userPanelTemplate'>
          <UserPanel menuMode='context' />
        </Item>
        <Template name='userPanelTemplate'>
          <UserPanel menuMode='list' />
        </Template>

      </Toolbar>
    </header>
)}
