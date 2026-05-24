import React from "react";
import { DataGrid } from "devextreme-react";
import { useNavigate } from "react-router-dom";
import { useAppDatagridDatasouce } from "../../hooks";
import type { IListMetaItem } from "../../interfaces";
import type { ToolbarItem } from "devextreme/ui/data_grid_types";
import type { DataGridRef } from "devextreme-react/cjs/data-grid";

const addNewText = "Yeni Ekle";
const detailText = "Detay";


export function AppDatagrid({ operationUrl, metaListOptions }: React.PropsWithChildren<IListMetaItem>) {

  const navigate = useNavigate();
  const gridRef = React.useRef<DataGridRef>(null);
  const key = metaListOptions.keyId ? metaListOptions.keyId : 'id';
  const dataSource = useAppDatagridDatasouce(operationUrl, key);

  const goDetail = async ()=>{
    if(metaListOptions.detailPath){      
      var dataGridInstance = gridRef.current?.instance();
      var selectedData = await dataGridInstance?.getSelectedRowsData();
      navigate(metaListOptions.detailPath+'?key=' + selectedData?.[0]?.[key]);
    }
  }

  const handleRowDblClick = async (e: any) => {
    if(metaListOptions.detailPath){
      console.log('Row double clicked, navigating to detail view', e);
      if(e.rowType === 'data'){
        navigate(metaListOptions.detailPath+'?key=' + e.data[key]);
      }
    }
  } 

  const editable = metaListOptions.editable || false;

  const toolbar = createToolbar(goDetail,
    editable, 
    metaListOptions.toolbarsItems || [], 
    metaListOptions.detailPath || null );

  return (
    <DataGrid
      ref={gridRef}
      columns={metaListOptions?.columns}
      toolbar={toolbar}
      dataSource={dataSource}
      id={key}
      onRowDblClick={handleRowDblClick}
      filterRow={{
        visible: true,
      }}
      
      selection={{
        mode:'single', 
        showCheckBoxesMode: 'always', 
        allowSelectAll: false,
        deferred: true,
      }}
      editing={editable ? {
        mode: 'row',
        allowAdding: true,
        allowUpdating: true,
        allowDeleting: true,
        useIcons: true,
        confirmDelete: true,
      } : {}}
      showBorders={true}
      columnAutoWidth={true}
      columnHidingEnabled={true}
      focusedRowEnabled={true}
      pager={{
        showPageSizeSelector: true,
        showInfo: true,
        allowedPageSizes: [20, 50, 100],
        displayMode: 'full',
        visible:true
      }}>

    </DataGrid>
  )

}


const createToolbar = (goDetail: () => void, editable: boolean, toolbarsItems: Array<ToolbarItem>, detailPath: string | null) => {

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

  return toolbarsItems !== undefined ?
    {
      items:
        [
          ...(toolbarsItems || []),
          ...(addButton ? [addButton] : []),
          ...(detailButton ? [detailButton] : [])
        ]
    } : undefined;
}
