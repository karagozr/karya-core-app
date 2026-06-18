import { CustomStore, ODataStore } from "devextreme/common/data";
import DataSource from "devextreme/data/data_source";
import { ApiRequest } from "../services";
import { useMemo } from "react";



export const useAppDatagridDatasouce = (url: string, keyName: string) => {
    
    const dataSource = new DataSource({
        store: new CustomStore({
            key: keyName,
            load: async (options: any) =>{
                console.log('DataSource Load Options:', options);
                var res = await ApiRequest.Get(url , options)

                console.log('DataSource Load Result:', res?.data.data);
                return res?.data.data;
            },
            update: async (key, values) => {
                await ApiRequest.Put(url , key, values);
            },
            insert: async (values) => {
                await ApiRequest.Post(url, values);
            },
            remove: async (key) => {
                await ApiRequest.Delete(url, key);
            },
            
        })
    })

    return useMemo(() => ({ dataSource }), [url, keyName]);

}
