import type { dxToolbarItem } from "devextreme/ui/toolbar";
import type { AppFormAllowOptions, FormToolBarItem } from "../components";
import { coreI18n } from "../i18n";


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
      const toolbarItem: dxToolbarItem = {
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