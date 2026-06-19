import { CustomStore } from "devextreme/common/data";
import { ApiRequest, type IMessageBoxStatus } from "../services";
import { showMessage } from "./message-box";
import { prepareLoadOptionsForBackend } from "./datagrid-datasource-helper";


const MessageBoxStatus: IMessageBoxStatus = {
  isActiveSuccess: false,
  isActiveError: false,
  isActiveWarning: false,
  isActiveInfo: false,
}; 

const normalizeLookupData = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export const createLookupDsForDt = (url: string, _parentFields?: string[]) =>
  new CustomStore({
    key: 'id',
    loadMode: 'raw',
    cacheRawData: true,
    byKey: async (key) => {
      const res = await ApiRequest.Get(`${url}/${key}`, null, MessageBoxStatus);
      if (res.status === 404) {
        showMessage({
          type: 'error',
          message: `${key} is not found`,
          title: '404 Key Error',
          displayTime: 4000,
        });
      }

      return res.data?.data ?? res.data;
    },

    load: async (loadOptions: any) => {
      const res = await ApiRequest.Get(url, prepareLoadOptionsForBackend(loadOptions), MessageBoxStatus);
      return normalizeLookupData(res.data?.data ?? res.data);
    }
  });
