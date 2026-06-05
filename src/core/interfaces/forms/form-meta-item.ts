import type { DataGridRef, IDataGridOptions, IToolbarItemProps } from "devextreme-react/cjs/data-grid";
import type { IFormOptions as IDevFormOptions } from "devextreme-react/cjs/form";
import type { dxToolbarItem } from "devextreme/ui/toolbar";
import type { PageBreadcrumbProps } from "../../components";

export interface IFormOptions extends IDevFormOptions{ 
  ref?: React.RefObject<any>;
  operationUrl: string;
  toolbarsItems?: Array<dxToolbarItem>;
}

export interface IFormDetailOptions { 
  toolbarsItems?:Array<IToolbarItemProps>;
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

export interface IBasePageMetaItem  {
  breadcrumb?: PageBreadcrumbProps;
  caption?: string;
}

export interface IFormPageMetaItem extends IBasePageMetaItem { 
  formOptions?:  IFormOptions;
  detailItems?: Array<IFormPageDetailMetaItem>;
  detailCaption?: string;
}