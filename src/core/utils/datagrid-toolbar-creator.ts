import type { ToolbarItem } from "devextreme/ui/data_grid_types";

const addNewText = "Yeni Ekle";
const detailText = "Detay";

export const createDatagridToolbar = (goDetail: () => void, editable: boolean, toolbarsItems: Array<ToolbarItem>, detailPath: string | null,gridRef? :any ) => {

  const addButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'addRowButton',
    visible: true,
    showText: 'always',
    options: {
      text: addNewText,
    }
  } : null;

  const detailButton: any = detailPath ? {
    location: 'before',
    widget: 'dxButton',
    name: 'detailButton',
    visible: true,
    showText: 'always',
    options: {
      text: detailText,
      icon: 'dropzone',
      onClick: () => {
        if (detailPath) {
          goDetail();
        }
      }
    }
  } : null;

  const externalToolbarItems = toolbarsItems.map(item => {
    if (item.widget === 'dxButton' && item.options && item.options.onClick) 
    {
      const originalOnClick = item.options.onClick;
      item.options.onClick = () => 
      {
        originalOnClick(gridRef?.current?.instance());
      }    
    }
    return item;
  });

  return toolbarsItems !== undefined ?
    {
      items:
        [
          ...(externalToolbarItems || []),
          ...(addButton ? [addButton] : []),
          ...(detailButton ? [detailButton] : [])
        ]
    } : undefined;
}
