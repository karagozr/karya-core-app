import type { IAppFormProps, IFormDetailProps } from "../../components";
import type { IBasePageProps } from "./base-page";

export interface IFormPageSubItemProps {
  type: 'form' | 'detail';
  inTab?: boolean;
  title?: string;
  formOptions?:  IAppFormProps; 
  formDetailOptions?: IFormDetailProps;
}


export interface IBaseFormPageProps extends IBasePageProps { 
  formOptions?:  IAppFormProps;
  detailItems?: Array<IFormPageSubItemProps>;
  detailCaption?: string;
}