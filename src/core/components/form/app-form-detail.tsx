import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";
import React from "react";
import DataGrid, { Pager, Paging, type DataGridRef } from "devextreme-react/data-grid";
import type { IFormDetailProps } from "./types";
import { createLookupDsForDt } from "../../utils";



export function AppFormDetail({ operationUrl, toolbarsItems, columns, isEditable, parentFields }
  : React.PropsWithChildren<IFormDetailProps>) {

  const gridRef = React.useRef<DataGridRef>(null);

  const { key: parentKey } = useAppFormContext();

  const editable = isEditable && parentKey !== null || false;

  const { dataSource } = useAppFormDetailDatasource(operationUrl, 'id', parentFields, [parentKey]);

  const lookupEditorsRef = React.useRef<Record<string, any>>({});

  const handleEditorPreparing = React.useCallback((e: any) => {
    if (e.parentType !== 'dataRow' || !e.dataField) {
      return;
    }
    


    const lookupConfig = lookupEditorsRef.current[e.dataField];

    if (!lookupConfig) {
      return;
    }


    const rowIndex = e.row?.rowIndex;
    const getCascadeParams = () => {
      const params: Record<string, any> = {};
      const parentFields: string[] = lookupConfig.dsCascadeParents || [];

      parentFields.forEach((parentField) => {
        const currentValue = rowIndex !== undefined
          ? e.component?.cellValue(rowIndex, parentField)
          : undefined;
        const fallbackValue = e.row?.data?.[parentField];
        const value = currentValue ?? fallbackValue;

        if (value !== undefined && value !== null && value !== '') {
          params[parentField] = value;
        }
      });

      return params;
    };

    const originalOnValueChanged = e.editorOptions?.onValueChanged;

    e.editorName = 'dxSelectBox';
    e.editorOptions = {
      ...e.editorOptions,
      valueExpr: lookupConfig.lookup?.valueExpr ?? 'id',
      displayExpr: lookupConfig.lookup?.displayExpr ?? 'name',
      dataSource: createLookupDsForDt(
        lookupConfig.dsUrl,
        lookupConfig.dsCascadeParents,
        lookupConfig.dsSearchFields,
        getCascadeParams
      ),
      searchEnabled: true,
      showClearButton: true,
      onValueChanged: (args: any) => {
        e.setValue?.(args.value);

        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }

        if (!lookupConfig.dsCascadeChildrens || lookupConfig.dsCascadeChildrens.length === 0) {
          return;
        }

        if (args.previousValue === args.value || rowIndex === undefined) {
          return;
        }

        lookupConfig.dsCascadeChildrens.forEach((childField: string) => {
          e.component?.cellValue(rowIndex, childField, null);
        });
      },
    };
  }, []);


  const _columns = React.useMemo(() => {
    const lookupEditors: Record<string, any> = {};

    const mappedColumns = columns?.map((col: any) => {
      if (col.dsUrl && col.lookup && col.dataField) {
        lookupEditors[col.dataField] = {
          dsUrl: col.dsUrl,
          dsCascadeChildrens: col.dsCascadeChildrens,
          dsCascadeParents: col.dsCascadeParents,
          dsSearchFields: col.dsSearchFields,
          lookup: col.lookup,
        };

        const { dsUrl, dsCascadeChildrens, dsCascadeParents, dsSearchFields, lookup, calculateDisplayValue, ...restCol } = col;
        return {
          ...restCol,
          lookup: {
            ...lookup,
            dataSource: createLookupDsForDt(dsUrl, undefined, dsSearchFields),
          },
        };
      }

      return col;
    });

    lookupEditorsRef.current = lookupEditors;
    return mappedColumns;
  }, [columns]);


  return (
    <DataGrid
      ref={gridRef}
      columns={_columns}
      dataSource={dataSource}
      showBorders={false}
      columnAutoWidth={true}
      remoteOperations={true}
      columnHidingEnabled={true}
      onEditorPreparing={handleEditorPreparing}
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
      toolbar={{ items: createToolbar(editable, toolbarsItems || [], gridRef) }}
    >
      <Paging enabled={true} defaultPageSize={4} />
      <Pager
        allowedPageSizes={[4, 8, 12]}
        displayMode="adaptive"
        showInfo={true}
        infoText="Page {0} of {1} ({2} Total Items)"
        showPageSizeSelector={true}
        showNavigationButtons={true}
      />
    </DataGrid>
  )
}

const createToolbar = (editable: boolean, toolbarsItems: any[], gridRef: React.RefObject<DataGridRef | any>) =>
  editable ? ['addRowButton', 'saveButton', 'revertButton', ...(toolbarsItems?.map(item => {
    if (item.widget === 'dxButton' && item.options && item.options.onClick) {
      const originalOnClick = item.options.onClick;
      item.options.onClick = () => {
        originalOnClick(gridRef?.current?.instance());
      }
    }
    return item;
  }) || [])] : undefined;