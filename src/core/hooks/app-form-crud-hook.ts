import React from "react";
import { ApiRequest } from "../services";
import { useAppFormContext } from "../contexts";

export const useAppFormDatasource = (url: any,keyName: string) => {
  const [data, setData] = React.useState<any|null>(null); 
  const [isLoading, setIsLoading] = React.useState<boolean>(false); 
  const appFormContext = useAppFormContext();

  const setDataValue = React.useCallback((dataValue:any) => {
    setData(dataValue);
  },[]);

  const byKey = async (key:string) => {
    setIsLoading(true);
    setTimeout(async ()=>{
    var res = await ApiRequest.Get(url+'/'+key, null);
    
    console.log('byKey res', res);

    if (res.data) {
        setDataValue(res.data);
        setIsLoading(false); 
    }
    },1000)
  }

  const createNew = React.useCallback(() => {
    setDataValue(null);
  },[]);

  const insert =  React.useCallback(async (data: any) => {
    setIsLoading(true);
    setTimeout(async ()=>{
    var res = await ApiRequest.Post(url, data);
    setIsLoading(false); 
    if (res.success) {
        appFormContext.updateFormContext(res.data[keyName]);
        setData(res.data);
    }
    },1000)
  },[]);

  const update = React.useCallback( async (key: string, data: any) => {
    setIsLoading(true);
    
    var res = await ApiRequest.Put(url, key, data);
    if (res.success) {
        setData(res.data);
    }
    setIsLoading(false);
     
    
  },[appFormContext.key]);

  const save = React.useCallback( async (key: string, data: any) => {
    if(appFormContext.isNew) 
      insert(data);
    else 
      update(key!, data);
    
  },[appFormContext.key, appFormContext.isNew]);

  const remove = async () => {
    setIsLoading(true);
    setTimeout(async ()=>{
    var res = await ApiRequest.Delete(url, null);

    if (res.data) {

        setData(res.data.value[0]);
        setIsLoading(false);
    }
    },5000)
  }

//   React.useEffect( () => {
//     if (url) {
//       byKey();
//     }
//   }, [url]);

  return {data,isLoading,byKey,insert,update,remove,createNew,save };
    
}
