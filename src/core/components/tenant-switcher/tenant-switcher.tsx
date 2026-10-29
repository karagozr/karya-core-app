import SelectBox from 'devextreme-react/select-box';
import { readLocalStorage, APP_STORAGE_KEYS } from '../..';



export const TenantSwitcher = () => {

  const tenantId = JSON.parse(readLocalStorage(APP_STORAGE_KEYS.user)).tenantId;
  console.log('Tenant ID:', tenantId);
  return (
    <SelectBox
      width={100}
      valueExpr={'id'}
      displayExpr={'text'}
      value={ tenantId}
      items={[{ id: tenantId, text: tenantId }]}
      // onValueChanged={handleValueChanged}
      stylingMode={'outlined'}
      inputAttr={{ 'aria-label': 'Language' }}
    />
  );
};
