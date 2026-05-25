import { CustomStore, ODataStore } from "devextreme/common/data";
import DataSource from "devextreme/data/data_source";
import { ApiRequest } from "../services";
import { useMemo } from "react";



export const useAppDatagridDatasouce = (url: string, keyName: string) => {
    
    const dataSource = new DataSource({
        store: new CustomStore({
            key: keyName,
            load: (options: any) =>
                new ODataStore({
                    version: 2,
                    key: keyName,
                    url: url
                }).load(options),
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
