import React from "react";
import DataGrid, { Pager, Paging, type DataGridRef } from "devextreme-react/data-grid";
import { useNavigate } from "react-router-dom";
import { useAppDatagridDatasouce } from "../../hooks";
import './app-datagrid.scss';
import type { IAppListProps } from "./types";
import { createDatagridToolbar, createLookupDsForDt } from "../../utils";




function AppDatagridComp({ operationUrl, metaListOptions }: React.PropsWithChildren<IAppListProps>) {

  const navigate = useNavigate();
  const gridRef = React.useRef<DataGridRef>(null);
  const key = metaListOptions.keyId ? metaListOptions.keyId : 'id';
  const { dataSource } = useAppDatagridDatasouce(operationUrl, key);


  const goDetail = React.useCallback(async () => {
    if (metaListOptions.detailPath) {
      var dataGridInstance = gridRef.current?.instance();
      var selectedData = await dataGridInstance?.getSelectedRowsData();
      navigate(metaListOptions.detailPath + '?key=' + selectedData?.[0]?.[key]);
    }
  }, [key, metaListOptions.detailPath, navigate]);

  const handleRowDblClick = React.useCallback(async (e: any) => {
    if (metaListOptions.detailPath) {
      if (e.rowType === 'data') {
        navigate(metaListOptions.detailPath + '?key=' + e.data[key]);
      }
    }
  }, [key, metaListOptions.detailPath, navigate]);

  const editable = metaListOptions.editable || false;

  const toolbar = React.useMemo(() => {
    return createDatagridToolbar(
      goDetail,
      editable,
      metaListOptions.toolbarsItems || [],
      metaListOptions.detailPath || null,
      gridRef
    );
  }, [goDetail, editable, metaListOptions.toolbarsItems, metaListOptions.detailPath]);

  const lookupEditorsRef = React.useRef<Record<string, any>>({});

  const columns = React.useMemo(() => {
    const lookupEditors: Record<string, any> = {};

    const mappedColumns = metaListOptions.columns?.map((col: any) => {
      if (col.dsUrl && col.lookup && col.dataField) {
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
  }, [metaListOptions.columns]);

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

  const editing = React.useMemo(() => {
    return editable ? {
      mode: 'row' as const,
      allowAdding: true,
      allowUpdating: true,
      allowDeleting: true,
      useIcons: true,
      confirmDelete: true,
    } : {};
  }, [editable]);

  const filterRow = React.useMemo(() => ({ visible: true }), []);

  const selection = React.useMemo(() => ({
    mode: 'single' as const,
    showCheckBoxesMode: 'always' as const,
    allowSelectAll: false,
    deferred: true,
  }), []);

  const summary = React.useMemo(() => metaListOptions?.summary, []);



  return (
    <DataGrid
      ref={gridRef}
      columns={columns}
      toolbar={toolbar}
      dataSource={dataSource}
      showBorders={false}
      remoteOperations={true}
      summary={summary}
      id={key}
      className={'app-list-page-datagrid'}
      onRowDblClick={handleRowDblClick}
      filterRow={filterRow}
      selection={selection}
      editing={editing}
      columnAutoWidth={true}
      columnHidingEnabled={true}
      focusedRowEnabled={true}
      onEditorPreparing={handleEditorPreparing}
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

export const AppDatagrid = React.memo(AppDatagridComp);

