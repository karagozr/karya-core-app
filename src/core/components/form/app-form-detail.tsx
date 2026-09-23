import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";
import React from "react";
import DataGrid, { MasterDetail, Pager, Paging, type DataGridRef } from "devextreme-react/data-grid";
import type { IFormDetailProps } from "./types";
import { createLookupDsForDt } from "../../utils";
import { coreI18n } from "../../i18n";
import { AppFormDetailChild } from "./app-form-detail-child";
import { createDetailDatagridToolbar } from "../../utils/master-detail-datagrid-toolbar-creator";


function AppFormDetailComp({ operationUrl, keyField, toolbarsItems, columns, isEditable, selection,parentFields, masterDetailProps, masterDetailEnabled,initialNewRowData }
  : React.PropsWithChildren<IFormDetailProps>) {

  const gridRef = React.useRef<DataGridRef>(null);

  const { key: parentKey, formData } = useAppFormContext();

  const editable = isEditable && parentKey !== null || false;

  const parentValues = React.useMemo(() => [parentKey], [parentKey]);

  const { dataSource } = useAppFormDetailDatasource(operationUrl, keyField || 'id', parentFields, parentValues);

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
      const cascadeParentFields: string[] = lookupConfig.dsCascadeParents || [];

      cascadeParentFields.forEach((parentField) => {
        if (parentField.startsWith('formData.')) {
          const formDataField = parentField.replace('formData.', '');
          const value = formData?.[formDataField];
          if (value !== undefined && value !== null && value !== '') {
            params[formDataField] = value;
          }
        } else {
          const currentValue = rowIndex !== undefined
            ? e.component?.cellValue(rowIndex, parentField)
            : undefined;
          const fallbackValue = e.row?.data?.[parentField];
          const value = currentValue ?? fallbackValue;

          if (value !== undefined && value !== null && value !== '') {
            params[parentField] = value;
          }
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

  const normalizedColumns = React.useMemo(() => {
    const lookupEditors: Record<string, any> = {};

    const mappedColumns = columns?.map((col: any) => {
      if (col.dsUrl && col.lookup && col.dataField) {
        col.calculateDisplayValue = (item: any) => item?.[col.dsDisplayDataField] ?? item?.[col.dataField];

        lookupEditors[col.dataField] = {
          dsUrl: col.dsUrl,
          dsCascadeChildrens: col.dsCascadeChildrens,
          dsCascadeParents: col.dsCascadeParents,
          dsSearchFields: col.dsSearchFields,
          lookup: col.lookup,
        };

        const { dsUrl, dsCascadeChildrens, dsCascadeParents, dsSearchFields, lookup, ...restCol } = col;
        return restCol;
      }

      return col;
    });

    lookupEditorsRef.current = lookupEditors;
    return mappedColumns;
  }, [columns]);

  const editing = React.useMemo(() => {
    return editable ? {
      mode: 'batch' as const,
      allowAdding: true,
      allowUpdating: true,
      allowDeleting: true,
      useIcons: true,
      confirmDelete: true,
      texts: {
        confirmDeleteMessage: coreI18n.formDetail.deleteNoteConfirm,
      },
    } : {
      mode: 'batch' as const,
      allowAdding: false,
      allowUpdating: false,
      allowDeleting: false,
      useIcons: false,
    };
  }, [editable]);

  const toolbar = React.useMemo(
    () => createDetailDatagridToolbar(editable, toolbarsItems || [], gridRef),
    [editable, toolbarsItems]
  );



  return (
    <DataGrid
      ref={gridRef}
      columns={normalizedColumns}
      dataSource={dataSource}
      showBorders={false}
      columnAutoWidth={true}
      filterRow={{visible: true}}
      selection={selection}
      remoteOperations={true}
      columnHidingEnabled={true}
      onEditorPreparing={handleEditorPreparing}
      onInitNewRow={initialNewRowData}
      editing={editing}
      toolbar={toolbar}
    >
      <MasterDetail enabled={masterDetailEnabled}
        component={
          (e: any) => <AppFormDetailChild
            detailItems={masterDetailProps?.detailItems ?? []}
            rowData={e.data.data} />}
      />
      <Paging enabled={true} defaultPageSize={10} />
      <Pager
        allowedPageSizes={[10, 20, 50]}
        displayMode='adaptive'
        showInfo={true}
        infoText={coreI18n.formDetail.pagerInfo}
        showPageSizeSelector={true}
        showNavigationButtons={true}
      />
    </DataGrid>

  );
}

export const AppFormDetail = React.memo(AppFormDetailComp);


