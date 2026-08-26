import type { DataGridRef } from "devextreme-react/cjs/data-grid";
import { coreI18n } from "../i18n";

const addNewText = coreI18n.formDetail.toolbar.addNewRow;
const saveText = coreI18n.formDetail.toolbar.save;
const revertText = coreI18n.formDetail.toolbar.revert;


export const createDetailDatagridToolbar = (editable: boolean, toolbarsItems: any[], gridRef: React.RefObject<DataGridRef | any>) => {
  const addButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'addRowButton',
    visible: true,
    showText: 'always',
    options: {
      type: 'default',
      text: addNewText,
    }
  } : null;

  const saveButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'saveButton',
    visible: true,
    showText: 'always',
    options: {
      type: 'success',
      text: saveText,
    }
  } : null;

  const revertButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'revertButton',
    visible: true,
    showText: 'always',
    options: {
      type: 'normal',
      text: revertText,
    }
  } : null;

  const externalToolbarItems = toolbarsItems.map((item) => {
    if (item.widget === 'dxButton' && item.options && item.options.onClick) {
      const originalOnClick = item.options.onClick;
      return {
        ...item,
        options: {
          ...item.options,
          onClick: () => {
            originalOnClick(gridRef?.current?.instance());
          }
        }
      };
    }
    return item;
  });

  return toolbarsItems !== undefined
    ? {
      items: [
        ...(externalToolbarItems || []),
        ...(addButton ? [addButton] : []),
        ...(saveButton ? [saveButton] : []),
        ...(revertButton ? [revertButton] : [])
      ]
    }
    : undefined;
};