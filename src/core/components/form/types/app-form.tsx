import type { IFormOptions } from "devextreme-react/cjs/form";
import type { Item as IToolbarItem } from "devextreme/ui/toolbar";

export interface AppFormRef {
  getFormData: () => any | null;
  getChangedData: () => any | null;
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

export interface FormToolBarItem extends IToolbarItem {
  visibleExp?: (data: any) => boolean;
}

export interface IAppFormProps extends IFormOptions{ 
  keyField?: string;
  formAllowOptions?: AppFormAllowOptions  | false;
  ref?: React.RefObject<any>;
  operationUrl?: string;
  toolbarItems?: Array<FormToolBarItem>;
  onCustomSave?: (formData: any) => Promise<boolean> | boolean;
}

