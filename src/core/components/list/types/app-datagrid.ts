import type { Column, ToolbarItem } from "devextreme/ui/data_grid_types";

export interface IAppDatagridProps{ 
  toolbarsItems?: Array<ToolbarItem>;
  keyId?: string;
  columns?: Array<Column | string>;
  editable?: boolean| false;
  detailPath?: string| null;
}

export interface IAppListProps {
  type: 'grid' | 'list';
  caption?: string;
  metaListOptions:  IAppDatagridProps; 
  operationUrl: string;
}