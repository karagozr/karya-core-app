import type { DataGridRef, IDataGridOptions, IToolbarItemProps } from "devextreme-react/cjs/data-grid";
import type { Column, ToolbarItem } from "devextreme/ui/data_grid_types";


export interface IListOptions{ 
  toolbarsItems?: Array<ToolbarItem>;
  keyId?: string;
  columns?: Array<Column | string>;
  editable?: boolean| false;
  detailPath?: string| null;
}


export interface IListMetaItem {
  type: 'grid' | 'list';
  caption?: string;
  metaListOptions:  IListOptions; 
  operationUrl: string;
}

export interface IMetaItemList  {
  caption?: string;
  isTabList?: boolean | false;
  breadcrumbPath?: string;
  items?: Array<IListMetaItem>;
}
