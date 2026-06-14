import { Form, Toolbar } from "devextreme-react";
import React from "react";
import { useAppFormContext } from "../../contexts";
import { useAppFormDatasource } from "../../hooks";
import './app-form.scss';
import type dxForm from "devextreme/ui/form";
import { cascadeHandlingOperation, createFormToolbarItems, createLookupDs } from "../../utils";
import type { AppFormRef, IAppFormProps } from "./types";
import "../../loaders/form-skeleton.scss";

const colCountByScreen = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8
};

const unsavedChangesMessage = "You have unsaved changes. Are you sure you want to leave?";
const deleteConfirmMessage = "Are you sure you want to delete this item?";



export const AppForm = React.forwardRef<AppFormRef, React.PropsWithChildren<IAppFormProps>>(
  function AppForm(formOptions, ref) {

    const formRef = React.useRef<dxForm>(null);
    const appFormContext = useAppFormContext();
    const formDatasource = useAppFormDatasource(formOptions.operationUrl, "id");
    const [formData, setFormData] = React.useState<any | null>(null);

    React.useImperativeHandle(ref, () => {
      return {
        getFormData: () => formRef.current?.instance().option('formData') ?? formDatasource.data ?? null,
        getChangedData: () => formData,
        formData: formData,
        updateData: (field: string, value: any) => formRef.current?.instance().updateData(field, value),
      };
    }, [formDatasource.data, formData]);

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

      

      if (formOptions.onFieldDataChanged) formOptions.onFieldDataChanged(e);

      cascadeHandlingOperation(e, dataField, formRef);
      
    }, []);

    const openNewForm = () => {
      appFormContext.newFormContext();
    }

    const onNew = () => {
      if (formData !== null && formRef.current) {
        const confirmResult = window.confirm(unsavedChangesMessage);
        if (!confirmResult) {
          return;
        } else {
          openNewForm();
        }
      } else {
        openNewForm();
      }
    }

    const onSave = () => {
      const validate = formRef.current?.instance().validate() || { isValid: true };
      if (validate.isValid) {
        formDatasource.save(appFormContext.key!, formData);
      }
    }

    const onDelete = () => {
      const confirmResult = window.confirm(deleteConfirmMessage);
      if (confirmResult) {
        formDatasource.remove(appFormContext.key!);
      }
    }

    const toolbarItems = createFormToolbarItems(onSave, onNew, onDelete, formOptions.toolbarsItems, formRef, formOptions.formAllowOptions || undefined);

    const finalFormOptions = React.useMemo(() => {
      const items = (formOptions.items || []).map((item: any) => {
        if (item.editorOptions?.dsUrl) {
          const ds = createLookupDs(item.editorOptions.dsUrl, item.editorOptions.dsCascadeParents, formRef);
          return {
            ...item,
            editorOptions: { ...item.editorOptions, dataSource: ds }
          };
        }
        return item;
      });
      return { ...formOptions, items };
    }, []);


    return <React.Fragment>
      <div className={`${formDatasource.isLoading ? 'is-loading' : ''} dx-form-loader-container`} >
        <Toolbar className='main-toolbar-content action-button-toolbar' multiline={false} items={toolbarItems} />
        <div className="main-form-content">
          <Form ref={formRef} labelMode='static' {...finalFormOptions} formData={formDatasource.data}
            onFieldDataChanged={handleFieldDataChanged} colCountByScreen={colCountByScreen} />
        </div>
      </div>
    </React.Fragment>
  });



