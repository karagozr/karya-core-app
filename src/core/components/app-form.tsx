import { Form, LoadPanel, Toolbar } from "devextreme-react";
import React, { useContext } from "react";
import type { IFormMetaItem, IFormMetaItemList } from "../interfaces";
import { AppFormContext, useAppFormContext } from "../contexts";
import { useAppFormDatasource } from "../hooks";

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};


export function AppForm({ type,caption }: React.PropsWithChildren<IFormMetaItem>) {
    
  var appFormContext = useAppFormContext();

  console.log('appFormContext', appFormContext.key);
  const formDatasource = useAppFormDatasource("https://6a0efaf31736097c360af529.mockapi.io/api/inventory");

  const [formData, setFormData] = React.useState<any|null>(null);

  console.log('formData', formData);

  React.useEffect(() => {
    if(appFormContext.key) formDatasource.byKey(appFormContext.key);
  }, [appFormContext.key]);

  console.log('formDatasource', formDatasource.data);

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
      <Toolbar disabled={formDatasource.data === null} 
        className='action-button-toolbar' multiline={false} items={[
        {
          location: 'after',
          widget: 'dxButton',
          options: {
            text: 'Save',
            type: 'default',
            icon: 'save',
            onClick: () => {
              if(formData) formDatasource.update(appFormContext.key!, formData);
              else formDatasource.insert(formDatasource.data);
            }
          }
        }
      ]} />
      <Form labelMode='static' formData={formDatasource.data} onFieldDataChanged={handleFieldDataChanged} colCountByScreen={colCountByScreen} />
      {/* {contextMasterId && <div style={{ display: 'none' }}>{contextMasterId}</div>} */}
    </div>
  </div>
}
