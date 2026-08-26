import type { Column, Summary, ToolbarItem } from "devextreme/ui/data_grid_types";
import type { IFormDetailChildItem, IFormDetailChildProps } from "../..";

export interface IAppColumn extends Column {
  dsUrl?: string;
  dsCascadeChildrens?: string[];
  dsCascadeParents?: string[];
  dsSearchFields?: string[];
  dsDisplayDataField?: string;
}



export interface IAppDatagridProps{ 
  toolbarsItems?: Array<ToolbarItem>;
  keyId?: string;
  columns?: Array<IAppColumn | string>;
  summary?: Summary;
  editable?: boolean| false;
  detailPath?: string| null;
  masterDetailEnabled?: boolean| false;
  masterDetailProps?: IFormDetailChildProps;
}

export interface IAppListProps {
  type: 'grid' | 'list';
  caption?: string;
  metaListOptions:  IAppDatagridProps; 
  operationUrl: string;
}