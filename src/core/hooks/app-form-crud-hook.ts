import React from "react";
import { ApiRequest } from "../services";

export const useAppFormDatasource = (url: any) => {
  const [data, setData] = React.useState<any|null>(null); 
  const [isLoading, setIsLoading] = React.useState<boolean>(false); 
  
  const byKey = async (key:string) => {
    setIsLoading(true);
    setTimeout(async ()=>{
    var res = await ApiRequest.Get(url+'/'+key, null);
    
    console.log('byKey res', res);

    if (res.data) {
        setData(res.data);
        setIsLoading(false); 
    }
    },1000)
  }

  const insert = async (data: any) => {
    setIsLoading(true);
    setTimeout(async ()=>{
    var res = await ApiRequest.Post(url, data);
    
    if (res.data) {
      
        setData(res.data.value[0]);
        setIsLoading(false); 
    }
    },1000)
  }

  const update = React.useCallback( async (key: string, data: any) => {
    setIsLoading(true);
    
    var res = await ApiRequest.Put(url, key, data);
    
    console.log('update res', res);

    setIsLoading(false); 
    
  },[ ]);

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

  return {data,isLoading,byKey,insert,update,remove};
    
}
