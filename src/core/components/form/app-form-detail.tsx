import { DataGrid } from "devextreme-react";
import type { IFormMetaItem } from "../../interfaces";
import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";

export function AppFormDetail({caption,operationUrl,metaFormDetailOptions} : React.PropsWithChildren<IFormMetaItem>) {

    const {key:parentKey} = useAppFormContext();
    console.log('AppFormDetail render with parentKey:', parentKey);

    const editable = metaFormDetailOptions?.isEditable && parentKey!==null || false;
    const parentKeyField = metaFormDetailOptions?.parentKeyField || null;
    
    if(parentKeyField===null){
      return <div>Error: parentKeyField is not defined.</div>;
    }else if(parentKey===null){
      return <div>Please save the main form before adding details.</div>;
    }

    const {dataSource} = useAppFormDetailDatasource(operationUrl, 'id', {
      key: parentKeyField ,
      value: parentKey||''
    });

    return (
    <DataGrid
        ref={metaFormDetailOptions?.gridRef}
        columns={metaFormDetailOptions?.columns} 
        dataSource={dataSource} 
        showBorders={true}
        columnAutoWidth={true}

        editing={editable ?{
          mode:  'batch',
          allowAdding: editable,
          allowUpdating: editable,
          allowDeleting: editable,
          useIcons: editable,
          confirmDelete: editable,
          texts: editable ? {
            confirmDeleteMessage: 'Are you sure you want to delete this note?',
          } : undefined
        } : undefined}
        toolbar={editable ? { items: ['addRowButton', 'saveButton', 'revertButton', ...(metaFormDetailOptions?.actionButtons || [])] } : undefined}
      />
  )
}
