import { Form, LoadPanel, Toolbar } from "devextreme-react";
import React from "react";
import type { IFormMetaItem } from "../../interfaces";
import { useAppFormContext } from "../../contexts";
import { useAppFormDatasource } from "../../hooks";

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};


export function AppForm({ type, caption, operationUrl, metaFormOptions }: React.PropsWithChildren<IFormMetaItem>) {

  const appFormContext = useAppFormContext();
  const formDatasource = useAppFormDatasource(operationUrl, "id");

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

      <div>{caption}</div>

      <LoadPanel shadingColor="rgba(0,0,0,0.4)" position={{ of: '.dx-form-loader-container' }}
        visible={formDatasource.isLoading}
        showIndicator={true}
        shading={true}
        showPane={true}
      />
      {/* {actionButtons && actionButtons.length > 0 &&  */}
      <Toolbar
        className='action-button-toolbar' multiline={false} items={[
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
      <Form labelMode='static' {...metaFormOptions} formData={formDatasource.data} onFieldDataChanged={handleFieldDataChanged} colCountByScreen={colCountByScreen} />
      {/* {contextMasterId && <div style={{ display: 'none' }}>{contextMasterId}</div>} */}
    </div>
  </div>
}
