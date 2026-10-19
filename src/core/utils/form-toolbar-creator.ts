import type { AppFormAllowOptions, FormToolBarItem } from "../components";
import { coreI18n } from "../i18n";
import type { IAppFormDatasource } from "../hooks";


const resolveToolbarItemVisibility = (item: FormToolBarItem, formData: any) => {
  if (!item.visibleExp) {
    return item.visible;
  }

  try {
    return item.visibleExp(formData);
  } catch {
    return false;
  }
};


export const createFormToolbarItems = (onSave: () => void, onNew: () => void,onDelete: () => void,toolbarsItems: Array<FormToolBarItem> | undefined, formRef: any,formData:any, formAllowOptions: AppFormAllowOptions ={
  allowDelete: true,
  allowNew: true,
  allowSave: true,
  allowEdit: true
}) => {
  

  const defaultItems = [
     formAllowOptions.allowNew == false ? {} : {
      location: 'before',
      locateInMenu: 'auto',
      widget: 'dxButton',
      options: {
        text: coreI18n.form.toolbar.new,
        type: 'default',
        icon: 'plus',
        onClick: onNew
      }
    },
    formAllowOptions.allowSave == false ? {} : {
      location: 'before',
      locateInMenu: 'auto',
      widget: 'dxButton',
      options: {
        text: coreI18n.form.toolbar.save,
        type: 'success',
        icon: 'save',
        onClick: onSave
      }
    },
    formAllowOptions.allowDelete == false ? {} : {
      location: 'before',
      locateInMenu: 'auto',
      widget: 'dxButton',
      options: {
        text: coreI18n.form.toolbar.remove,
        type: 'danger',
        icon: 'trash',
        onClick: onDelete
      }
    }
   
  ];

  if (toolbarsItems && toolbarsItems.length > 0) {
    const externalToolbarItems = toolbarsItems.map(item => {
      const toolbarItem: FormToolBarItem = {
        locateInMenu: 'auto',
        ...item,
        visible: resolveToolbarItemVisibility(item, formData),
        options: item.options ? { ...item.options } : item.options
      };

      if (toolbarItem.widget === 'dxButton' && toolbarItem.options && toolbarItem.options.onClick) {
        const originalOnClick = toolbarItem.options.onClick;
        toolbarItem.options.onClick = () => {
          originalOnClick(formRef?.current?.instance().option('formData'));
        }
      }

      return toolbarItem;
    });
    return [...defaultItems, ...externalToolbarItems];
  }
  return defaultItems;
}

export type FormToolbarCreatorProps = {
  onSave: () => void;
  onNew: () => void;
  onDelete: () => void;
  toolbarsItems: Array<FormToolBarItem> | undefined;
  formRef: any;
  formData: any;
  formAllowOptions: AppFormAllowOptions|undefined;
  formDatasource?: IAppFormDatasource;
  changedFormData: any;
}

const defaultFormAllowOptions: AppFormAllowOptions = {
  allowDelete: true,
  allowNew: true,
  allowSave: true,
  allowEdit: true
}

export const createFormToolbar = (option: FormToolbarCreatorProps) => {
  const { onSave, onNew, onDelete, toolbarsItems, formRef, formData, formAllowOptions, formDatasource } = option;

  const finalFormAllowOptions = { ...defaultFormAllowOptions, ...formAllowOptions };

  const defaultItems = [
     finalFormAllowOptions.allowNew == false ? {} : {
      location: 'before',
      locateInMenu: 'auto',
      widget: 'dxButton',
      options: {
        text: coreI18n.form.toolbar.new,
        type: 'default',
        icon: 'plus',
        onClick: onNew
      }
    },
    finalFormAllowOptions.allowSave == false ? {} : {
      location: 'before',
      locateInMenu: 'auto',
      widget: 'dxButton',
      options: {
        text: coreI18n.form.toolbar.save,
        type: 'success',
        icon: 'save',
        onClick: onSave
      }
    },
    finalFormAllowOptions.allowDelete == false ? {} : {
      location: 'before',
      locateInMenu: 'auto',
      widget: 'dxButton',
      options: {
        text: coreI18n.form.toolbar.remove,
        type: 'danger',
        icon: 'trash',
        onClick: onDelete
      }
    }
   
  ];

  if (toolbarsItems && toolbarsItems.length > 0) {
    const externalToolbarItems = toolbarsItems.map(item => {
      const toolbarItem: FormToolBarItem = {
        locateInMenu: 'auto',
        ...item,
        visible: resolveToolbarItemVisibility(item, formData),
        options: item.options ? { ...item.options } : item.options
      };


      if (toolbarItem.widget === 'dxButton' && toolbarItem.options && toolbarItem.options.onClick) {
        const originalOnClick = toolbarItem.options.onClick;
        toolbarItem.options.onClick = () => {
          originalOnClick({
              currentForm: formRef?.current,
              formData: formRef?.current?.instance().option('formData'),
              datasource: formDatasource,
            });
        }
      }

      return toolbarItem;
    });
    return [...defaultItems, ...externalToolbarItems];
  }
  return defaultItems;
}