import { CustomStore, DataSource, ODataStore } from "devextreme/common/data";
import { ApiRequest } from "../services";
import { useMemo } from "react";

interface IAppFormDetailParentValueOptions {
  key: string;
  value: string|number|null;
}

export const useAppFormDetailDatasource = (url: any, key: any, parent: IAppFormDetailParentValueOptions) => {
  var dataSource = new DataSource({
    store: new CustomStore({
        key: key,
        load: async (options: any) => {
          var result = await ApiRequest.Get(url+`?${parent.key}=${parent.value}`, null);
          return result.data;
        },
        update: async (key, values) => {
          var result = await ApiRequest.Put(url, key,values);
          return result.data;
        },
        insert: async (values) => {
          var result = await ApiRequest.Post(url, values);
          return result.data
        },
        remove: async (key) => {
          var result = await ApiRequest.Delete(url, key);
          return result.data
        }
    })
  })

  return useMemo(() => ({ dataSource }), [url, key, parent.value]);
}