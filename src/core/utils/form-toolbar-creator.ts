import type { dxToolbarItem } from "devextreme/ui/toolbar";
import type { AppFormAllowOptions } from "../components";
import { coreI18n } from "../i18n";


export const createFormToolbarItems = (onSave: () => void, onNew: () => void,onDelete: () => void,toolbarsItems: Array<dxToolbarItem> | undefined, formRef: any, formAllowOptions: AppFormAllowOptions ={
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
      if (item.widget === 'dxButton' && item.options && item.options.onClick) {
        const originalOnClick = item.options.onClick;
        item.options.onClick = () => {
          originalOnClick(formRef?.current?.instance().option('formData'));
        }
      }
      return item;
    });
    return [...defaultItems, ...externalToolbarItems];
  }
  return defaultItems;
}