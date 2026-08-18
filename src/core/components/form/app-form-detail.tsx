import { useAppFormDetailDatasource } from "../../hooks/app-form-detail-crud-hook";
import { useAppFormContext } from "../../contexts";
import React from "react";
import DataGrid, { Pager, Paging, type DataGridRef } from "devextreme-react/data-grid";
import type { IFormDetailProps } from "./types";
import { createLookupDsForDt } from "../../utils";
import { coreI18n } from "../../i18n";

const addNewText = coreI18n.formDetail.toolbar.addNewRow;
const saveText = coreI18n.formDetail.toolbar.save;
const revertText = coreI18n.formDetail.toolbar.revert;

function AppFormDetailComp({ operationUrl, toolbarsItems, columns, isEditable, parentFields }
  : React.PropsWithChildren<IFormDetailProps>) {

  const gridRef = React.useRef<DataGridRef>(null);

  const { key: parentKey } = useAppFormContext();
  const editable = isEditable && parentKey !== null || false;

  const parentValues = React.useMemo(() => [parentKey], [parentKey]);
  const { dataSource } = useAppFormDetailDatasource(operationUrl, 'id', parentFields, parentValues);

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

  const normalizedColumns = React.useMemo(() => {
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
    () => createToolbar(editable, toolbarsItems || [], gridRef),
    [editable, toolbarsItems]
  );

  return (
    <DataGrid
      ref={gridRef}
      columns={normalizedColumns}
      dataSource={dataSource}
      showBorders={false}
      columnAutoWidth={true}
      remoteOperations={true}
      columnHidingEnabled={true}
      onEditorPreparing={handleEditorPreparing}
      editing={editing}
      toolbar={toolbar}
    >
      <Paging enabled={true} defaultPageSize={4} />
      <Pager
        allowedPageSizes={[4, 8, 12]}
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

const createToolbar = (editable: boolean, toolbarsItems: any[], gridRef: React.RefObject<DataGridRef | any>) => {
  const addButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'addRowButton',
    visible: true,
    showText: 'always',
    options: {
      type: 'default',
      text: addNewText,
    }
  } : null;

  const saveButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'saveButton',
    visible: true,
    showText: 'always',
    options: {
      type: 'success',
      text: saveText,
    }
  } : null;

  const revertButton: any = editable ? {
    location: 'before',
    widget: 'dxButton',
    name: 'revertButton',
    visible: true,
    showText: 'always',
    options: {
      type: 'normal',
      text: revertText,
    }
  } : null;

  const externalToolbarItems = toolbarsItems.map((item) => {
    if (item.widget === 'dxButton' && item.options && item.options.onClick) {
      const originalOnClick = item.options.onClick;
      return {
        ...item,
        options: {
          ...item.options,
          onClick: () => {
            originalOnClick(gridRef?.current?.instance());
          }
        }
      };
    }
    return item;
  });

  return toolbarsItems !== undefined
    ? {
      items: [
        ...(externalToolbarItems || []),
        ...(addButton ? [addButton] : []),
        ...(saveButton ? [saveButton] : []),
        ...(revertButton ? [revertButton] : [])
      ]
    }
    : undefined;
};


  