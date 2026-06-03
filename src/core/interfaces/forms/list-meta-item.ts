import type { Column, ToolbarItem } from "devextreme/ui/data_grid_types";
import type { PageBreadcrumbProps } from "../../components";


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
  breadcrumb?: PageBreadcrumbProps;
  items?: Array<IListMetaItem>;
}
