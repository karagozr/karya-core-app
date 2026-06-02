import { Form, LoadPanel, Toolbar } from "devextreme-react";
import React from "react";
import type { IFormOptions } from "../../interfaces";
import { useAppFormContext } from "../../contexts";
import { useAppFormDatasource } from "../../hooks";
import './app-form.css';

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};


export function AppForm(formOptions: React.PropsWithChildren<IFormOptions>) {

  const appFormContext = useAppFormContext();
  const formDatasource = useAppFormDatasource(formOptions.operationUrl, "id");

  const [formData, setFormData] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (appFormContext.key && !appFormContext.isNew) {
      formDatasource.byKey(appFormContext.key);
    } else {
      formDatasource.createNew();
      setFormData(null);
    }
  }, [appFormContext.key]);

  const handleFieldDataChanged = React.useCallback((e: any) => {
    const { dataField, value } = e;
    setFormData((prevData: any) => ({
      ...prevData,
      [dataField]: value
    }));
  }, []);

  return <div>
    <div className={'dx-form-loader-container'} >
      <LoadPanel shadingColor="rgba(0,0,0,0.4)" position={{ of: '.dx-form-loader-container' }}
        visible={formDatasource.isLoading}
        showIndicator={true}
        shading={true}
        showPane={true}
      />
      {/* {actionButtons && actionButtons.length > 0 &&  */}
      <Toolbar
        className='main-toolbar-content action-button-toolbar' multiline={false} items={[
          {
            location: 'after',
            widget: 'dxButton',
            options: {
              text: 'Save',
              type: 'default',
              icon: 'save',
              onClick: () => {
                formDatasource.save(appFormContext.key!, formData);
              }
            }
          },
          {
            location: 'after',
            widget: 'dxButton',
            options: {
              text: 'New',
              type: 'default',
              icon: 'plus',
              onClick: () => {
                appFormContext.newFormContext();
              }
            }
          }
        ]} />
        <div className="main-form-content">
          <Form labelMode='static' {...formOptions} formData={formDatasource.data} onFieldDataChanged={handleFieldDataChanged} colCountByScreen={colCountByScreen} />
        </div>
      
      {/* {contextMasterId && <div style={{ display: 'none' }}>{contextMasterId}</div>} */}
    </div>
  </div>
}
