import React from "react";
import { Form, Toolbar } from "devextreme-react";
import { useAppFormContext, useAppModalContext } from "../../contexts";
import { useAppFormDatasource } from "../../hooks";
import { cascadeHandlingOperation, createFormToolbar, createLookupDs } from "../../utils";
import { coreI18n } from "../../i18n";
import type dxForm from "devextreme/ui/form";
import type { AppFormRef, IAppFormProps} from "./types";
import "../../loaders/form-skeleton.scss";
import './app-form.scss';

const unsavedChangesMessage = coreI18n.form.unsavedChanges;
const deleteConfirmMessage = coreI18n.form.deleteConfirm;

export const AppForm = React.forwardRef<AppFormRef, IAppFormProps>(
  function AppForm(formOptions, ref) {

    const formRef = React.useRef<dxForm>(null);
    const changedFormDataRef = React.useRef<any | null>(null);
    const appFormContext = useAppFormContext();
    const appModalContext = useAppModalContext();
    const {datasourceOptions,modalKey} = formOptions;
    const modalIsActive = modalKey ? appModalContext?.isActive(modalKey) : null;
    const formDatasource = useAppFormDatasource(formOptions.operationUrl, formOptions.keyField || "id");

    const setChangedFormDataRef = (data: any) => { changedFormDataRef.current = data; };
    
    React.useImperativeHandle(ref, () => {
      return {
        getFormData: () => datasourceOptions?.disableByKey===true ? datasourceOptions?.customFormData : formDatasource.data,
        changedFormData: () => changedFormDataRef.current,
        openModal: (key: string) => appModalContext?.openModal(key, changedFormDataRef.current),
        currentFormData: formRef.current?.instance().option('formData'),
        updateData: (field: string, value: any) => formRef.current?.instance().updateData(field, value),
        validate: () => formRef.current?.instance().validate().isValid ?? false,
        reloadFormData: () => {
          if(datasourceOptions?.disableByKey===true) return;
          if (appFormContext.key && !appFormContext.isNew) {
            formDatasource.byKey(appFormContext.key);
          }
        },
        formDatasource: formDatasource,
        formRef: formRef
      };
    }, [formDatasource.data, appFormContext.key, appFormContext.isNew, datasourceOptions]);

    React.useEffect(() => {
      if(modalKey && !modalIsActive) return;
      if(modalKey && datasourceOptions?.disableByKey===true) return;

      setChangedFormDataRef(null);
      if (!formOptions.operationUrl) {
        return;
      }
      if (appFormContext.key && !appFormContext.isNew) {
        formDatasource.byKey(appFormContext.key);
      } else {
        formDatasource.createNew();
        setChangedFormDataRef(null);
      }
    }, [appFormContext.key, formOptions.operationUrl,modalIsActive]);

    const handleFieldDataChanged = React.useCallback((e: any) => {
      const { dataField, value } = e;
      setChangedFormDataRef({
        ...changedFormDataRef.current,
        [dataField]: value
      });

      if (formOptions.onFieldDataChanged) formOptions.onFieldDataChanged(e);

      cascadeHandlingOperation(e, dataField, formRef);
      
    }, []);
    
    const openNewForm = () => appFormContext.newFormContext();

    const onNew = () => {
      if (changedFormDataRef.current !== null && formRef.current) {
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

    const onSave = async () => {
      const validate = formRef.current?.instance().validate() || { isValid: true };
      if (validate.isValid) {
        if (!changedFormDataRef.current) {
          return;
        }

        if (formOptions.onCustomSave) {
          const isSaved = await formOptions.onCustomSave(changedFormDataRef.current);
          if (isSaved) {
            setChangedFormDataRef(null);
          }
          return;
        }
          
        const isSaved = await formDatasource.save(appFormContext.key!, changedFormDataRef.current);
        if (isSaved) {
          setChangedFormDataRef(null);
        }
      }
    }

    const onDelete = async () => {
      const confirmResult = window.confirm(deleteConfirmMessage);
      if (confirmResult) {
        await formDatasource.remove(appFormContext.key!);
      }
    }

    const toolbarItems = React.useCallback(() => {
      return createFormToolbar({ 
        onSave, 
        onNew, 
        onDelete, 
        toolbarsItems: formOptions.toolbarItems || [], 
        formRef, 
        formData: appFormContext.formData, 
        formAllowOptions: formOptions.formAllowOptions || undefined, 
        formDatasource: formDatasource,
        changedFormData: changedFormDataRef.current,
      });
    }, [ formOptions.toolbarItems, appFormContext.formData, formOptions.formAllowOptions]);

    const finalFormOptions = React.useMemo(() => {
      const items = (formOptions.items || []).map((item: any) => {
        if (item.editorOptions?.dsUrl) {
          const ds = createLookupDs(item.editorOptions.dsUrl, item.editorOptions.dsCascadeParents, item.editorOptions.searchFields, formRef);
          return {
            ...item,
            editorOptions: { ...item.editorOptions, dataSource: ds }
          };
        }
        if (item.itemType === "button" && item.buttonOptions?.onClick) {
          return {
            ...item,
            buttonOptions: { ...item.buttonOptions,onClick: (e: any) => item.buttonOptions?.onClick({ currentForm: formRef?.current, datasource: formDatasource }) }
          };
        }
        return item;
      });
      return { ...formOptions, items };
    }, []);

    return <React.Fragment>     
      <div className={`${formDatasource.isLoading ? 'is-loading' : ''} dx-form-loader-container`} >
        <Toolbar className='main-toolbar-content action-button-toolbar' multiline={false} items={toolbarItems()}  />
        <div className="main-form-content">
          <Form ref={formRef} labelMode='static' {...finalFormOptions} 
          formData={ datasourceOptions?.disableByKey===true ? datasourceOptions?.customFormData : formDatasource.data} 
          onFieldDataChanged={handleFieldDataChanged}  />
        </div>
      </div>
    </React.Fragment>
});