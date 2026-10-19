import type { IPopupOptions } from "devextreme-react/cjs/popup";
import type { IAppFormProps, IFormDetailProps } from "../../components";
import type { IBasePageProps } from "./base-page";

export interface IModalOptions extends IPopupOptions {
  modalKey: string;
}

export interface IModalProps extends IModalOptions {
  children?: React.ReactNode;
}

export interface IFormPageSubItemProps {
  type: 'form' | 'detail';
  inTab?: boolean;
  title?: string;
  modal?: IModalOptions|undefined;
  formOptions?:  IAppFormProps; 
  formDetailOptions?: IFormDetailProps;
}


export interface IBaseFormPageProps extends IBasePageProps { 
  formOptions?:  IAppFormProps;
  detailItems?: Array<IFormPageSubItemProps>;
  detailCaption?: string;
}