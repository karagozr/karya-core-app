import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  type FormTypes,
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import './login-page.scss';
import { coreI18n } from "../../core/i18n";
import { SingleCard } from '../../layouts';
import { useAuthContext } from '../../core';


export default function AppLoginPage() {
  const auth = useAuthContext();
  console.log('auth', auth);
  const { signIn } = auth;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ tenantId: '', username: '', password: '', rememberMe: false });

  const onFieldDataChanged = useCallback((e: FormTypes.FieldDataChangedEvent) => {
    const { dataField, value } = e;

    if (dataField) {
      setFormData(formData => ({
        ...formData,
        [dataField]: value,
      }));
    }
  }, []);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { tenantId, username, password, rememberMe } = formData;
    setLoading(true);
    var res = await signIn(tenantId, username, password, rememberMe);
    console.log('signIn result', res);
    setLoading(false);
  }, [signIn, formData]);

  return (
    <SingleCard title={coreI18n.login.title} description={coreI18n.login.description}>
        <form className={'login-form'} onSubmit={onSubmit}>
      <Form formData={formData} disabled={loading} onFieldDataChanged={onFieldDataChanged}>
        <Item
          dataField={'tenantId'}
          editorType={'dxTextBox'}
          editorOptions={tenantIdEditorOptions}
        >
          <RequiredRule message={coreI18n.login.tenantIdRequired} />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'username'}
          editorType={'dxTextBox'}
          editorOptions={usernameEditorOptions}
        >
          <RequiredRule message={coreI18n.login.usernameRequired} />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'password'}
          editorType={'dxTextBox'}
          editorOptions={passwordEditorOptions}
        >
          <RequiredRule message={coreI18n.login.passwordRequired} />
          <Label visible={false} />
        </Item>
        <Item
          dataField={'rememberMe'}
          editorType={'dxCheckBox'}
          editorOptions={rememberMeEditorOptions}
        >
          <Label visible={false} />
        </Item>
        <ButtonItem>
          <ButtonOptions
            width={'100%'}
            type={'default'}
            useSubmitBehavior={true}
          >
            <span className="dx-button-text">
              {
                loading
                  ? <LoadIndicator width={'24px'} height={'24px'} visible={true} />
                  : coreI18n.login.signIn
              }
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
      <div className={'link'}>
        <Link to={'/reset-password'}>{coreI18n.login.forgotPassword}</Link>
      </div>
    </form>
    </SingleCard>
    
  );
}

const tenantIdEditorOptions = { stylingMode: 'filled', placeholder: coreI18n.login.tenantId, mode: 'text' };
const usernameEditorOptions = { stylingMode: 'filled', placeholder: coreI18n.login.username, mode: 'text' };
const passwordEditorOptions = { stylingMode: 'filled', placeholder: coreI18n.login.password, mode: 'password' };
const rememberMeEditorOptions = { text: coreI18n.login.rememberMe, elementAttr: { class: 'form-text' } };
