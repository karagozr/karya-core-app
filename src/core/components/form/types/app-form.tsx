import type { IFormOptions } from "devextreme-react/cjs/form";
import type { Item as IToolbarItem } from "devextreme/ui/toolbar";

export interface AppFormRef {
  getFormData: () => any | null;
  openModal: (key: string) => void;
  closeModal: (key:string) => void;
  changedFormData: () => any | null;
  currentFormData: any | null;
  updateData: (field: string, value: any) => void;
  formDatasource: any;
  formRef: React.RefObject<any>;
  reloadFormData: () => void;
  validate: () => boolean;
}

export type AppFormAllowOptions = {
  allowDelete: boolean;
  allowNew: boolean;
  allowSave: boolean;
  allowEdit: boolean;
}

export interface AppCustomApiRequestOptions{
  actionType: "post" | "put" | "get";
  actionName: string;
  data?: any;
} 

export interface FormToolBarItem extends IToolbarItem {
  visibleExp?: (data: any) => boolean;
}

export interface IFormDatasourceOptions{
  disableByKey?: boolean | true;
  disableCreateNew?: boolean | true;
  disableUpdate?: boolean | true;
  disableDelete?: boolean | true;
  customFormData?: any;
}


export interface IAppFormProps extends IFormOptions{ 
  keyField?: string|'user';
  datasourceOptions?: IFormDatasourceOptions;
  modalKey?: string| null;
  formAllowOptions?: AppFormAllowOptions  | false;
  formAllowOptionsExp?: (data: any) => AppFormAllowOptions;
  ref?: React.RefObject<any>;
  operationUrl?: string;
  toolbarItems?: Array<FormToolBarItem>;
  onCustomSave?: (formData: any) => Promise<boolean> | boolean;
  onSaved?: (formData: any) => void;
}

