import { CustomStore, DataSource, ODataStore } from "devextreme/common/data";
import { ApiRequest } from "../services";
import { useMemo } from "react";

interface IAppFormDetailParentValueOptions {
  key: string|null;
  value: string|number|null;
}

const defaultMessageBoxStatus = {
  isActiveError: false,
  isActiveSuccess: false,
  isActiveWarning: false,
  isActiveInfo: false,
}

export const useAppFormDetailDatasource = (url: any, key: any, parent: IAppFormDetailParentValueOptions) => {
  
  if(!parent.key){
    throw new Error("Parent key is required for AppFormDetail datasource.");
  }

  var dataSource = new DataSource({
    store: new CustomStore({
        key: key,
        load: async (options: any) => {
          var result = await ApiRequest.Get(url+`?${parent.key}=${parent.value}`, null,defaultMessageBoxStatus);
          return result.data;
        },
        update: async (key, values) => {
          var result = await ApiRequest.Put(url, key,values,defaultMessageBoxStatus);
          return result.data;
        },
        insert: async (values) => {
          var result = await ApiRequest.Post(url, values,defaultMessageBoxStatus);
          return result.data
        },
        remove: async (key) => {
          var result = await ApiRequest.Delete(url, key,defaultMessageBoxStatus);
          return result.data
        }
    })
  })

  return useMemo(() => ({ dataSource }), [url, key, parent.value]);
}