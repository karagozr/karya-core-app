import { DataGrid } from "devextreme-react";
import type { IFormMetaItem } from "../../interfaces";
import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";

export function AppFormDetail({caption,operationUrl,metaFormDetailOptions} : React.PropsWithChildren<IFormMetaItem>) {

    const {key:parentKey} = useAppFormContext();
    
    const editable = metaFormDetailOptions?.isEditable && parentKey!==null || false;

    const datasource = useAppFormDetailDatasource(operationUrl, 'id');

    return (
    <div className="notes" style={{marginBottom:'20px'}}>
      <div style={caption ? {borderBottomStyle: 'solid', borderBottomWidth: '1px', borderBottomColor: '#e0e0e0'} : undefined}>
        <span className="dx-form-group-caption" >{caption}</span>
      </div>
      <DataGrid
        ref={metaFormDetailOptions?.gridRef}
        columns={metaFormDetailOptions?.columns} 
        dataSource={datasource} 
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
    </div>
  )
}
