import { CustomStore, DataSource } from "devextreme/common/data";
import { ApiRequest, type IMessageBoxStatus } from "../services";
import { showMessage } from "./message-box";


const MessageBoxStatus: IMessageBoxStatus = {
  isActiveSuccess: false,
  isActiveError: false,
  isActiveWarning: false,
  isActiveInfo: false,
}; 

export const createLookupDs = (url: string, parentFields: string[] | undefined, formRef: React.RefObject<any>) =>
  new DataSource({
    paginate: true,
    pageSize: 10,
    store: new CustomStore({

      byKey: async (key) => {
        const res = await ApiRequest.Get(`${url}/${key}`, null,MessageBoxStatus);
        if(res.status===404){
          showMessage({
                type: 'error',
                message: `${key} is not found`,
                title: '404 Key Error',
                displayTime: 4000,
              });
        }
        return res.data;
      },
      load: async (loadOptions: any) => {
        const params: Record<string, any> = {};
        if (parentFields && parentFields.length > 0) {
          const currentFormData = formRef.current?.instance().option('formData') ?? {};
          parentFields.forEach((parentField) => {
            const parentValue = currentFormData[parentField];
            if (parentValue != null) {
              params[parentField] = parentValue;
            }
          });
        }
        const res = await ApiRequest.Get(url, params,MessageBoxStatus);
        return res.data;
      }
    }),
  });
