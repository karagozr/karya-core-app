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
                load: async (options: any) => {
                    var res = await ApiRequest.Get(url, prepareLoadOptionsForBackend(options));
                    return normalizeApiDataForArray(res);
                },
                update: async (key, values) => {
                    const response = await ApiRequest.Put(url, key, values, 
                            { 
                                isActiveError: false, 
                                isActiveSuccess: false,
                                isActiveWarning: false, 
                                isActiveInfo: false 
                            } );
                    if (response && response.success === false) {
                        throw new Error(response.message || "İşlem başarısız.");
                    }
                    return response;
                },
                insert: async (values) => {
                        const response = await ApiRequest.Post(url, values,
                            { 
                            isActiveError: false, 
                            isActiveSuccess: false,
                            isActiveWarning: false, 
                            isActiveInfo: false 
                        }
                        );
                        if (response && response.success === false) {
                            throw new Error(response.message || "İşlem başarısız.");
                        }
                        return response;
                },
                remove: async (key) => {
                    const response = await ApiRequest.Delete(url, key,
                        { 
                            isActiveError: true, 
                            isActiveSuccess: false,
                            isActiveWarning: false, 
                            isActiveInfo: false 
                        });
                    if (response && response.success === false) {
                        throw new Error(response.message || "İşlem başarısız.");
                    }
                    
                },

            })
        })
    }, [url, keyName]);

    return { dataSource };

}
