import { DataGrid } from "devextreme-react";
import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";
import React from "react";
import type { DataGridRef } from "devextreme-react/cjs/data-grid";
import type { IFormDetailProps } from "./types";

export function AppFormDetail({ operationUrl, toolbarsItems, columns, isEditable, parentKeyField }
  : React.PropsWithChildren<IFormDetailProps>) {

  const gridRef = React.useRef<DataGridRef>(null);

  const { key: parentKey } = useAppFormContext();

  const editable = isEditable && parentKey !== null || false;

  const { dataSource } = useAppFormDetailDatasource(operationUrl, 'id', {
    key: parentKeyField,
    value: parentKey || ''
  });

  const handleInitNewRow = (e: any) => {
    e.data[parentKeyField] = parentKey;
  }

  return (
    <DataGrid
      ref={gridRef}
      columns={columns}
      dataSource={parentKeyField === null || parentKey === null ? [] : dataSource}
      showBorders={false}
      columnAutoWidth={true}
      onInitNewRow={handleInitNewRow}
      editing={editable ? {
        mode: 'batch',
        allowAdding: true,
        allowUpdating: true,
        allowDeleting: true,
        useIcons: true,
        confirmDelete: true,
        texts: true ? {
          confirmDeleteMessage: 'Are you sure you want to delete this note?',
        } : undefined
      } : {
        mode: 'batch',
        allowAdding: false,
        allowUpdating: false,
        allowDeleting: false,
        useIcons: false,
      }}
      toolbar={{items: createToolbar(editable, toolbarsItems || [], gridRef)}}
    />
  )
}

const createToolbar = (editable: boolean, toolbarsItems: any[], gridRef: React.RefObject<DataGridRef|any>) =>
  editable ? ['addRowButton', 'saveButton', 'revertButton', ...(toolbarsItems?.map(item => {
    if (item.widget === 'dxButton' && item.options && item.options.onClick) {
      const originalOnClick = item.options.onClick;
      item.options.onClick = () => {
        originalOnClick(gridRef?.current?.instance());
      }
    }
    return item;
  }) || [])] : undefined;