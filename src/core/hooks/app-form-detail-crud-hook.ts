import { CustomStore, DataSource, ODataStore } from "devextreme/common/data";
import { ApiRequest } from "../services";

export const useAppFormDetailDatasource = (url: any, key: any) => {
  var datasource = new DataSource({
    store: new CustomStore({
        key: key,
        load: async (options: any) => {
           console.log('options', key,options);
           var result = await ApiRequest.Get(url, null);
          return result.data;
        },
            // new ODataStore({
            //     version: 2,
            //     key: key,
            //     url: url
            // }).load(options),
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

  return datasource;
}