import { DataGrid } from "devextreme-react";
import type { IFormDetailOptions } from "../../interfaces";
import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";

export function AppFormDetail({operationUrl,actionButtons,columns,gridRef,isEditable,parentKeyField} : React.PropsWithChildren<IFormDetailOptions>) {
    const {key:parentKey} = useAppFormContext();

    const editable = isEditable && parentKey!==null || false;
    
    const {dataSource} = useAppFormDetailDatasource(operationUrl, 'id', {
      key: parentKeyField ,
      value: parentKey||''
    });

    const handleInitNewRow = (e: any) => {
      e.data[parentKeyField] = parentKey;
    }
  
    return (
    <DataGrid
        ref={gridRef}
        columns={columns} 
        dataSource={parentKeyField===null || parentKey===null ? [] : dataSource} 
        showBorders={false}
        columnAutoWidth={true}
        onInitNewRow={handleInitNewRow}
        editing={editable ?{
          mode:  'batch',
          allowAdding: true,
          allowUpdating: true,
          allowDeleting: true,
          useIcons: true,
          confirmDelete: true,
          texts: true ? {
            confirmDeleteMessage: 'Are you sure you want to delete this note?',
          } : undefined
        } : {
          mode:  'batch',
          allowAdding: false,
          allowUpdating: false,
          allowDeleting: false,
          useIcons: false,
        }}
        toolbar={editable ? { items: ['addRowButton', 'saveButton', 'revertButton', ...(actionButtons || [])] } : undefined}
      />
  )
}
