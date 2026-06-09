import type { dxToolbarItem } from "devextreme/ui/toolbar";
import type { AppFormAllowOptions } from "../components";


export const createFormToolbarItems = (onSave: () => void, onNew: () => void,onDelete: () => void,toolbarsItems: Array<dxToolbarItem> | undefined, formRef: any, formAllowOptions: AppFormAllowOptions ={
  allowDelete: true,
  allowNew: true,
  allowSave: true,
  allowEdit: true
}) => {

  const defaultItems = [
    formAllowOptions.allowSave == false ? {} : {
      location: 'after',
      widget: 'dxButton',
      options: {
        text: 'Save',
        type: 'success',
        icon: 'save',
        onClick: onSave
      }
    },
    formAllowOptions.allowDelete == false ? {} : {
      location: 'after',
      widget: 'dxButton',
      options: {
        text: 'Delete',
        type: 'danger',
        icon: 'trash',
        onClick: onDelete
      }
    },
    formAllowOptions.allowNew == false ? {} : {
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