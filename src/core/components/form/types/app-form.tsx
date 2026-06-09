import type { IFormOptions } from "devextreme-react/cjs/form";
import type { dxToolbarItem } from "devextreme/ui/toolbar";

export interface AppFormRef {
  getFormData: () => any | null;
  getChangedData: () => any | null;
  formData: any | null;
  updateData: (field: string, value: any) => void;
}

export type AppFormAllowOptions = {
  allowDelete: boolean;
  allowNew: boolean;
  allowSave: boolean;
  allowEdit: boolean;
}

export interface IAppFormProps extends IFormOptions{ 
  formAllowOptions?: AppFormAllowOptions  | false;
  ref?: React.RefObject<any>;
  operationUrl?: string;
  toolbarsItems?: Array<dxToolbarItem>;
}

