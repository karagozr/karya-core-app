import { Form, LoadPanel, Toolbar } from "devextreme-react";
import React from "react";
import type { IFormOptions } from "../../interfaces";
import { useAppFormContext } from "../../contexts";
import { useAppFormDatasource } from "../../hooks";
import './app-form.css';
import type { dxToolbarItem } from "devextreme/ui/toolbar";
import type dxForm from "devextreme/ui/form";

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4
};

const loadingMessage = "Loading";

export function AppForm(formOptions: React.PropsWithChildren<IFormOptions>) {

  const formRef = React.useRef<dxForm>(null);
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

  const onSave = () => {
    formDatasource.save(appFormContext.key!, formData);
  }

  const onNew = () => {
    appFormContext.newFormContext();
    // formDatasource.createNew();
    // setFormData(null);
  }


  const toolbarItems = createToolbarItems(onSave, onNew, formOptions.customToolbarItems, formRef, appFormContext.isNew||false);

  return <React.Fragment>
    <div className={'dx-form-loader-container'} >
      <LoadPanel shadingColor="rgba(0, 0, 0, 0.36)" position={{ of: '.dx-form-loader-container' }}
        visible={formDatasource.isLoading}
        showIndicator={true}
        message={loadingMessage + '...'}
        shading={true}
        showPane={true} />
      <Toolbar className='main-toolbar-content action-button-toolbar' multiline={false}
        items={toolbarItems} />
      <div className="main-form-content">
        <Form ref={formRef} labelMode='static' {...formOptions} formData={formDatasource.data} onFieldDataChanged={handleFieldDataChanged} colCountByScreen={colCountByScreen} />
      </div>
    </div>
  </React.Fragment>
}

const createToolbarItems = (onSave: () => void, onNew: () => void , 
customToolbarItems: Array<dxToolbarItem> | undefined, formRef: any,isNew: boolean) => {
  const defaultItems = [
          {
            location: 'after',
            widget: 'dxButton',
            options: {
              text: 'Save',
              type: 'success',
              icon: 'save',
              onClick: onSave
            }
          },
          {
            location: 'after',
            widget: 'dxButton',
            options: {
              text: 'New',
              type: 'default',
              icon: 'plus',
              onClick: onNew
            }
          }
        ];
  
  if(customToolbarItems && customToolbarItems.length > 0) {

    const externalToolbarItems = customToolbarItems.map(item => {
    if (item.widget === 'dxButton' && item.options && item.options.onClick) 
    {
      const originalOnClick = item.options.onClick;
      item.options.onClick = () => 
      {
        originalOnClick(formRef?.current?.instance().option('formData'));
      }    
    }
    return item;

    });

    return [...defaultItems, ...externalToolbarItems];
  }
  return defaultItems;
}

