import { CustomStore, DataSource } from "devextreme/common/data";
import { ApiRequest, type IMessageBoxStatus } from "../services";
import { showMessage } from "./message-box";
import { normalizeApiDataForArray, normalizeApiDataForObject } from "./api-result-normalizer";
import { prepareLoadOptionsForBackend } from "./datagrid-datasource-helper";
import { coreI18n } from "../i18n";


const MessageBoxStatus: IMessageBoxStatus = {
  isActiveSuccess: false,
  isActiveError: false,
  isActiveWarning: false,
  isActiveInfo: false,
};

const createCascadeFilter = (cascadeParams: Record<string, any>) => {
  const entries = Object.entries(cascadeParams).filter(([, value]) => {
    return value !== undefined && value !== null && value !== '';
  });

  if (entries.length === 0) {
    return null;
  }

  return entries
    .map(([field, value]) => [field, '=', value])
    .reduce((acc: any, current: any) => {
      if (!acc) {
        return current;
      }

      return [acc, 'and', current];
    }, null);
};

export const createLookupDs = (url: string, parentFields: string[] | undefined, searchFields = ['id', 'name'], formRef: React.RefObject<any>) =>
  new DataSource({
    paginate: true,
    pageSize: 10,
    store: new CustomStore({

      byKey: async (key) => {
        const res = await ApiRequest.Get(`${url}/${key}`, null, MessageBoxStatus);
        if (res.status === 404) {
          showMessage({
            type: 'error',
            message: coreI18n.lookup.keyNotFound(key),
            title: coreI18n.lookup.keyNotFoundTitle,
            displayTime: 4000,
          });
        }
        return normalizeApiDataForObject(res);
      },
      load: async (loadOptions: any) => {
        

        const cascadeParams: Record<string, any> = {};

        if (parentFields && parentFields.length > 0) {
          const currentFormData = formRef.current?.instance().option('formData') ?? {};
          parentFields.forEach((parentField) => {
            const parentValue = currentFormData[parentField];
            if (parentValue != null) {
              cascadeParams[parentField] = parentValue;
            }
          });
        }

        

        loadOptions.select = searchFields;
        loadOptions.searchExpr = searchFields;

        if (loadOptions.searchValue === undefined || loadOptions.searchValue === null
          || loadOptions.searchValue === '' || loadOptions.searchValue.length < 3) {
          loadOptions.skip = 0;
          loadOptions.take = 10;
        } else if (searchFields && searchFields.length > 1) {
          loadOptions.filter = [
            [searchFields[0], "contains", loadOptions.searchValue],
            "or",
            [searchFields[1], "contains", loadOptions.searchValue]
          ];
        }

        if (parentFields && parentFields.length > 0) {
          const cascadeFilter = createCascadeFilter(cascadeParams);

          loadOptions.filter = loadOptions.filter
            ? [loadOptions.filter, 'and', cascadeFilter]
            : cascadeFilter;
        }

        const params = {
          ...prepareLoadOptionsForBackend(loadOptions),
        };
      
        const res = await ApiRequest.Get(url, params, MessageBoxStatus);
        return normalizeApiDataForArray(res);
      }
    }),
  });
