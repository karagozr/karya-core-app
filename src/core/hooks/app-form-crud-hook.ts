import React from "react";
import { ApiRequest } from "../services";
import { useAppFormContext } from "../contexts";
import { normalizeApiDataForObject } from "../utils";

export interface IAppFormDatasource {
  data: any | null;
  isLoading: boolean;
  byKey: (key: string) => Promise<void>;
  insert: (data: any) => Promise<boolean>;
  update: (key: string, updateData: Partial<any>) => Promise<boolean>;
  remove: (key: string) => Promise<void>;
  createNew: () => void;
  save: (key: string, data: any) => Promise<boolean>;
  customPost: (metodName: string, data: any) => Promise<CustomApiResult>;
  customGet: (metodName: string, params: any) => Promise<CustomApiResult>;
  customPut: (key: string, metodName: string, params: any) => Promise<CustomApiResult>;
}

export interface CustomApiResult {
  success: boolean;
  data: any | null;
}

export const useAppFormDatasource = (url: any, keyName: string) : IAppFormDatasource => {
  const [data, setData] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const appFormContext = useAppFormContext();

  const setDataValue = React.useCallback((dataValue: any) => {
    setData(dataValue);
  }, []);

  const byKey = async (key: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      var res = await ApiRequest.Get(url + '/' + key, null);
      setIsLoading(false);
      if (res.success) {
        var resData = normalizeApiDataForObject(res)
        appFormContext.setFormDataValue(JSON.stringify(resData));
        setDataValue(resData);
      }
    }, 1000)
  }

  const createNew = React.useCallback(() => {
    setDataValue(null);
  }, []);

  const insert = React.useCallback(async (data: any) => {
    setIsLoading(true);
    var res = await ApiRequest.Post(url, data);
    setIsLoading(false);
    if (res.success) {
      const createdKey = res.data?.[keyName] ?? data?.[keyName];
      if (createdKey !== undefined && createdKey !== null && createdKey !== '') {
        appFormContext.updateFormContext(String(createdKey));
      }
      return true;
    }

    return false;
  }, []);

  const customPost = React.useCallback(async (metodName: string, data: any): Promise<CustomApiResult> => {
    setIsLoading(true);
    var res = await ApiRequest.Post(url+'/'+metodName, data);
    setIsLoading(false);
    if (res.success) {
      return {
        success: true,
        data: res.data
      };
    }

    return {
      success: false,
      data: null
    };
  }, []);

  const customGet = React.useCallback(async (metodName: string, params: any): Promise<CustomApiResult> => {
    setIsLoading(true);
    var res = await ApiRequest.Get(url+'/'+metodName, params);
    setIsLoading(false);
    if (res.success) {
      return {
        success: true,
        data: res.data
      };
    }

    return {
      success: false,
      data: null
    };
  }, []);

  const customPut = React.useCallback(async (key: string, metodName: string, params: any): Promise<CustomApiResult> => {
    setIsLoading(true);
    var res = await ApiRequest.Put(url+'/'+metodName, key, params);
    setIsLoading(false);
    if (res.success) {
      return {
        success: true,
        data: res.data
      };
    }

    return {
      success: false,
      data: null
    };
  }, []);

  const update = React.useCallback(async (key: string, updateData: any) => {
    setIsLoading(true);
    const res = await ApiRequest.Put(url, key, updateData);
    setIsLoading(false);
    if (res.success) {
      appFormContext.updateFormDataValue(updateData);
    }
    return !!res?.success;
  }, [appFormContext.key]);

  const save = React.useCallback(async (key: string, data: any) => {
    if (appFormContext.isNew)
      return await insert(data);
    else
      return await update(key!, data);

  }, [appFormContext.key, appFormContext.isNew]);

  const remove = React.useCallback(async (key: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      var res = await ApiRequest.Delete(url, key);
      setIsLoading(false);
      if (res.data) {
        appFormContext.newFormContext();
      }
    }, 1000)
  }, [appFormContext.key, appFormContext.isNew]);

  return { data, isLoading, byKey, insert, update, remove, createNew, save, customPost, customGet, customPut };

}
