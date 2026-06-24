import type { DataGridRef, IDataGridOptions, IToolbarItemProps } from "devextreme-react/cjs/data-grid";

export interface IFormDetailProps { 
  toolbarsItems?:Array<IToolbarItemProps>;
  isEditable?:boolean;
  columns?: IDataGridOptions['columns'];
  gridRef?: React.Ref<DataGridRef>
  parentFields: string[];
  operationUrl: string;
}