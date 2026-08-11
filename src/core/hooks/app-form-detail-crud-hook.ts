import { CustomStore } from "devextreme/common/data";
import DataSource from "devextreme/data/data_source";
import { ApiRequest } from "../services";
import { useMemo } from "react";
import { normalizeApiDataForArray, prepareLoadOptionsForBackend } from "../utils";
import { coreI18n } from "../i18n";

const defaultMessageBoxStatus = {
  isActiveError: false,
  isActiveSuccess: false,
  isActiveWarning: false,
  isActiveInfo: false,
}

const parentObj = (parentFields: string[], fieldValues: any[]) => {
  
  if (parentFields.length !== fieldValues.length) {
    throw new Error(coreI18n.formDetail.parentFieldsLengthMismatch);
  }else {
    const obj: any = {};
    parentFields.forEach((field, index) => {
      obj[field] = fieldValues[index];
    });
    return obj;
  }
};

export const useAppFormDetailDatasource = (url: any, key: any, parentFields: string[], parentValues: any[]) => {

  if (parentValues === null || parentValues === undefined) {
    throw new Error(coreI18n.formDetail.parentKeyRequiredDatasource);
  }

  const parentFieldsSignature = JSON.stringify(parentFields ?? []);
  const parentValuesSignature = JSON.stringify(parentValues ?? []);

  const dataSource = useMemo(() => {
    const hasAllParentValues = (parentValues ?? []).every((value: any) => value !== null && value !== undefined && value !== '');
    const opUrl = hasAllParentValues
      ? url + `(${JSON.stringify(parentObj(parentFields, parentValues))})`
      : null;

    return new DataSource({
      store: new CustomStore({
        key,
        load: async (options: any) => {
          console.log("parentValues[0]:", parentValues[0]);
          if(parentValues[0]===null || parentValues[0]===undefined || parentValues[0]===''){
            return normalizeApiDataForArray({ data: { data: [], totalCount: 0 } });
          }

          if (!opUrl) {
            return normalizeApiDataForArray({ data: [], totalCount: 0 });
          }
          var result = await ApiRequest.Get(opUrl, prepareLoadOptionsForBackend(options), defaultMessageBoxStatus);
          return normalizeApiDataForArray(result);
        },
        update: async (rowKey, values) => {
          if (!opUrl) {
            throw new Error(coreI18n.formDetail.parentKeyRequiredUpdate);
          }

          var result = await ApiRequest.Put(opUrl, rowKey, values, defaultMessageBoxStatus);
          return result.data;
        },
        insert: async (values) => {
          if (!opUrl) {
            throw new Error(coreI18n.formDetail.parentKeyRequiredInsert);
          }

          var result = await ApiRequest.Post(opUrl, values, defaultMessageBoxStatus);
          return result.data;
        },
        remove: async (rowKey) => {
          if (!opUrl) {
            throw new Error(coreI18n.formDetail.parentKeyRequiredDelete);
          }

          var result = await ApiRequest.Delete(opUrl, rowKey, defaultMessageBoxStatus);
          return result.data;
        }
      }),
    });
  }, [url, key, parentFieldsSignature, parentValuesSignature]);

  return { dataSource };
}