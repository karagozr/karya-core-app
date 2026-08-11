import React from "react";
import { ApiRequest } from "../services";
import { useAppFormContext } from "../contexts";
import { normalizeApiDataForObject } from "../utils";

export const useAppFormDatasource = (url: any, keyName: string) => {
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
        setDataValue(normalizeApiDataForObject(res));
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

  const update = React.useCallback(async (key: string, updateData: any) => {
    setIsLoading(true);
    const res = await ApiRequest.Put(url, key, updateData);
    setIsLoading(false);

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

  //   React.useEffect( () => {
  //     if (url) {
  //       byKey();
  //     }
  //   }, [url]);

  return { data, isLoading, byKey, insert, update, remove, createNew, save };

}
