import { CustomStore } from "devextreme/common/data";
import DataSource from "devextreme/data/data_source";
import { ApiRequest } from "../services";
import { useMemo } from "react";
import { prepareLoadOptionsForBackend, normalizeApiDataForArray } from "../utils";


export const useAppDatagridDatasouce = (url: string, keyName: string) => {
    const dataSource = useMemo(() => {
        return new DataSource({
            store: new CustomStore({
                key: keyName,
                load: async (options: any) =>{
                    var res = await ApiRequest.Get(url , prepareLoadOptionsForBackend(options));
                    return normalizeApiDataForArray(res);
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
    }, [url, keyName]);

    return { dataSource };

}
