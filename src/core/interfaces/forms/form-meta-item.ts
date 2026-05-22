export interface IFormMetaItem {
  type: 'form' | 'detail';
  masterData?: any;
  detailData?: any;
  inTab?: boolean;
  caption?: string;
  operationUrl?: string;
}

export interface IFormMetaItemList  {
  key?: string;
  items?: Array<IFormMetaItem>;
}
