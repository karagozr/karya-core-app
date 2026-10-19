import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from "react-router-dom";
import Form, {
  Item,
  Label,
  ButtonItem,
  ButtonOptions,
  RequiredRule,
  EmailRule,
  type FormTypes,
} from 'devextreme-react/form';
import LoadIndicator from 'devextreme-react/load-indicator';
import notify from 'devextreme/ui/notify';
import './reset-password-form-page.scss';
import { SingleCard } from '../../layouts';
import { coreI18n } from '../../core/i18n';
import { ApiRequest } from '../../core';

export default function ResetPasswordFormPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: ''});

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
    const { email } = formData;
    setLoading(true);

    const result = await ApiRequest.Post('email', { email },{
      isActiveError: true,
      isActiveInfo:true,
      isActiveSuccess: true,
      isActiveWarning: true
    });
    setLoading(false);

    if (result.success) {
      notify(coreI18n.resetPassword.notificationText, 'success', 2500);
      navigate('/login');
    } 
  }, [navigate, formData]);

  return (
    <SingleCard title={coreI18n.resetPassword.title} description={coreI18n.resetPassword.description}>
    <form className={'reset-password-form'} onSubmit={onSubmit}>
      <Form formData={formData} disabled={loading} onFieldDataChanged={onFieldDataChanged}>
        <Item
          dataField={'email'}
          editorType={'dxTextBox'}
          editorOptions={emailEditorOptions}
        >
          <RequiredRule message={coreI18n.resetPassword.emailRequired} />
          <EmailRule message={coreI18n.resetPassword.emailInvalid} />
          <Label visible={false} />
        </Item>
        <ButtonItem>
          <ButtonOptions
            elementAttr={submitButtonAttributes}
            width={'100%'}
            type={'default'}
            useSubmitBehavior={true}
          >
            <span className="dx-button-text">
              {
                loading ? <LoadIndicator width={'24px'} height={'24px'} visible={true} /> 
                : coreI18n.resetPassword.resetMyPassword
              }
            </span>
          </ButtonOptions>
        </ButtonItem>
      </Form>
      <div className={'login-link'}>
        {coreI18n.resetPassword.returnTo} <Link to={'/login'}>{coreI18n.resetPassword.signIn}</Link>
      </div>
    </form>
    </SingleCard>
  );
}

const emailEditorOptions = { stylingMode: 'filled', placeholder: coreI18n.resetPassword.email, mode: 'email' };
const submitButtonAttributes = { class: 'submit-button' };