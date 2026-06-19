import { CustomStore } from "devextreme/common/data";
import DataSource from "devextreme/data/data_source";
import { ApiRequest } from "../services";
import { useMemo } from "react";
import { prepareLoadOptionsForBackend } from "../utils";


export const useAppDatagridDatasouce = (url: string, keyName: string) => {
    
    const dataSource = new DataSource({
        store: new CustomStore({
            key: keyName,
            load: async (options: any) =>{
                var res = await ApiRequest.Get(url , prepareLoadOptionsForBackend(options));
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
