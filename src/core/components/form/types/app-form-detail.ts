import type { DataGridRef, IToolbarItemProps } from "devextreme-react/cjs/data-grid";
import type { Column } from "devextreme/ui/data_grid";

interface IAppColumn extends Column {
  dsUrl?: string;
  dsCascadeChildrens?: string[];
  dsCascadeParents?: string[];
  dsSearchFields?: string[];
}

export interface IFormDetailProps { 
  toolbarsItems?:Array<IToolbarItemProps>;
  isEditable?:boolean;
  columns?:  Array<IAppColumn | string>;
  gridRef?: React.Ref<DataGridRef>;
  parentFields: string[];
  operationUrl: string;
}