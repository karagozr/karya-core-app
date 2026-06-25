import { CustomStore, DataSource, ODataStore } from "devextreme/common/data";
import { ApiRequest } from "../services";
import { useMemo } from "react";
import { normalizeApiDataForArray, prepareLoadOptionsForBackend } from "../utils";

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

const parentObj = (parentFields: string[], fieldValues: any[]) => {
  
  if (parentFields.length !== fieldValues.length) {
    throw new Error("Parent fields and field values must have the same length.");
  }else {
    const obj: any = {};
    parentFields.forEach((field, index) => {
      obj[field] = fieldValues[index];
    });
    return obj;
  }
};

export const useAppFormDetailDatasource = (url: any, key: any, parentFields: string[], parentValues: any[]) => {
  
  if(parentValues===null || parentValues===undefined){
    throw new Error("Parent key is required for AppFormDetail datasource.");
  }

  const opUrl=url+`(${JSON.stringify(parentObj(parentFields, parentValues))})`

  var dataSource = new DataSource({
    store: new CustomStore({
        key: key,
        load: async (options: any) => {
          var result = await ApiRequest.Get(opUrl, prepareLoadOptionsForBackend(options),defaultMessageBoxStatus);
          return normalizeApiDataForArray(result);
        },
        update: async (key, values) => {
          var result = await ApiRequest.Put(opUrl, key,values,defaultMessageBoxStatus);
          return result.data;
        },
        insert: async (values) => {
          var result = await ApiRequest.Post(opUrl, values,defaultMessageBoxStatus);
          return result.data
        },
        remove: async (key) => {
          var result = await ApiRequest.Delete(opUrl, key,defaultMessageBoxStatus);
          return result.data
        }
    }),
  })

  return useMemo(() => ({ dataSource }), [url, key, parentFields, parentValues]);
}