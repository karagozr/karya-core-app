import React from "react";
import { DataGrid } from "devextreme-react";
import { useNavigate } from "react-router-dom";
import { useAppDatagridDatasouce } from "../../hooks";
import type { DataGridRef } from "devextreme-react/cjs/data-grid";
import './app-datagrid.scss';
import type { IAppListProps } from "./types";
import { createDatagridToolbar } from "../../utils";




export function AppDatagrid({ operationUrl, metaListOptions }: React.PropsWithChildren<IAppListProps>) {

  const navigate = useNavigate();
  const gridRef = React.useRef<DataGridRef>(null);
  const key = metaListOptions.keyId ? metaListOptions.keyId : 'id';
  const {dataSource} = useAppDatagridDatasouce(operationUrl, key);

  const goDetail = async ()=>{
    if(metaListOptions.detailPath){      
      var dataGridInstance = gridRef.current?.instance();
      var selectedData = await dataGridInstance?.getSelectedRowsData();
      navigate(metaListOptions.detailPath+'?key=' + selectedData?.[0]?.[key]);
    }
  }

  const handleRowDblClick = async (e: any) => {
    if(metaListOptions.detailPath){
      if(e.rowType === 'data'){
        navigate(metaListOptions.detailPath+'?key=' + e.data[key]);
      }
    }
  } 

  const editable = metaListOptions.editable || false;

  const toolbar = createDatagridToolbar(goDetail,
    editable, 
    metaListOptions.toolbarsItems || [], 
    metaListOptions.detailPath || null ,gridRef);

  return (
    <DataGrid
      ref={gridRef}
      columns={metaListOptions?.columns}
      toolbar={toolbar}
      dataSource={dataSource}
      showBorders={false}
      id={key}
      className={'app-list-page-datagrid'}
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


