import type { DataGridRef, IDataGridOptions, IToolbarItemProps } from "devextreme-react/cjs/data-grid";
import type { IFormOptions as IDevFormOptions } from "devextreme-react/cjs/form";

export interface IFormOptions extends IDevFormOptions{ 
  operationUrl: string;
}


export interface IFormDetailOptions { 
  actionButtons?:Array<IToolbarItemProps>;
  isEditable?:boolean;
  columns?: IDataGridOptions['columns'];
  gridRef?: React.Ref<DataGridRef>
  parentKeyField: string;
  operationUrl: string;
}

export interface IFormPageDetailMetaItem {
  type: 'form' | 'detail';
  inTab?: boolean;
  title?: string;
  formOptions?:  IFormOptions; 
  formDetailOptions?: IFormDetailOptions;
}

export interface IFormPageMetaItem  {
  breadcrumbPath?: string;
  caption?: string;
  actionButtons?:Array<any>;
  formOptions?:  IFormOptions;
  detailItems?: Array<IFormPageDetailMetaItem>;
}
