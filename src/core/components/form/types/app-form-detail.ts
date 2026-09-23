import type { DataGridRef, IToolbarItemProps } from "devextreme-react/cjs/data-grid";
import type { Column, Selection as RowSelection } from "devextreme/ui/data_grid";

interface IAppColumn extends Column {
  dsUrl?: string;
  dsCascadeChildrens?: string[];
  dsCascadeParents?: string[];
  dsSearchFields?: string[];
  dsDisplayDataField?: string;
}



export interface IFormDetailChildItem {
  caption?: string;
  toolbarsItems?: Array<IToolbarItemProps>;
  isEditable?: boolean;
  keyField?: string;
  columns?: Array<IAppColumn | string>;
  gridRef?: React.Ref<DataGridRef>;
  parentFields: string[];
  operationUrl: string;
  rowData?: any;
}

export interface IFormDetailChildProps {
  detailItems: IFormDetailChildItem[];
  rowData?: any;
}

export interface IFormDetailProps {
  toolbarsItems?: Array<IToolbarItemProps>;
  isEditable?: boolean;
  selection?: RowSelection;
  columns?: Array<IAppColumn | string>;
  gridRef?: React.Ref<DataGridRef>;
  keyField?:string;
  parentFields: string[];
  operationUrl: string;
  masterDetailEnabled: boolean|false;
  masterDetailProps?: IFormDetailChildProps;
  initialNewRowData?:() => any;
}