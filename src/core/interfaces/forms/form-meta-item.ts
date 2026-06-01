import type { DataGridRef, IDataGridOptions, IToolbarItemProps } from "devextreme-react/cjs/data-grid";
import type { IFormOptions as IDevFormOptions } from "devextreme-react/cjs/form";

export interface IFormOptions extends IDevFormOptions{ 

}


export interface IFormDetailOptions { 
  caption?: string;
  // operationUrl?: string|undefined;
  actionButtons?:Array<IToolbarItemProps>;
  isEditable?:boolean;
  columns?: IDataGridOptions['columns'];
  gridRef?: React.Ref<DataGridRef>
  masterId?: string|number|null;
  parentKeyField?: string;
}

export interface IFormMetaItem {
  type: 'form' | 'detail';
  inTab?: boolean;
  title?: string;
  metaFormOptions?:  IFormOptions; 
  metaFormDetailOptions?: IFormDetailOptions;
  operationUrl?: string;
}

export interface IFormMetaItemList  {
  breadcrumbPath?: string;
  caption?: string;
  items?: Array<IFormMetaItem>;
}
