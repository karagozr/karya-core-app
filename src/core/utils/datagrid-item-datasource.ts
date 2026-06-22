import { CustomStore } from "devextreme/common/data";
import { ApiRequest, type IMessageBoxStatus } from "../services";
import { showMessage } from "./message-box";
import { prepareLoadOptionsForBackend } from "./datagrid-datasource-helper";


const MessageBoxStatus: IMessageBoxStatus = {
  isActiveSuccess: false,
  isActiveError: false,
  isActiveWarning: false,
  isActiveInfo: false,
};

const normalizeLookupData = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
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

export const createLookupDsForDt = (
  url: string,
  _parentFields?: string[],
  _searchFields?: string[],
  _getCascadeParams?: () => Record<string, any>
) => {

  return new CustomStore({
    key: 'id',
    byKey: async (key) => {
      const res = await ApiRequest.Get(`${url}/${key}`, null, MessageBoxStatus);
      if (res.status === 404) {
        showMessage({
          type: 'error',
          message: `${key} is not found`,
          title: '404 Key Error',
          displayTime: 4000,
        });
      }

      return res.data?.data ?? res.data;
    },

    load: async (loadOptions: any) => {
      const cascadeParams = _getCascadeParams?.() ?? {};
      const cascadeFilter = createCascadeFilter(cascadeParams);

      if (_parentFields && _parentFields.length > 0) {
        const hasAllParents = _parentFields.every((field) => {
          const value = cascadeParams[field];
          return value !== undefined && value !== null && value !== '';
        });

        if (!hasAllParents) {
          return [];
        }
      }

      loadOptions.select = _searchFields;
      loadOptions.searchExpr = _searchFields;

      if (loadOptions.searchValue === undefined || loadOptions.searchValue === null
        || loadOptions.searchValue === '' || loadOptions.searchValue.length < 3) {
        loadOptions.skip = 0;
        loadOptions.take = 10;
      }else if (_searchFields && _searchFields.length > 1) {
        loadOptions.filter = [
          [_searchFields[0], "contains", loadOptions.searchValue],
          "or",
          [_searchFields[1], "contains", loadOptions.searchValue]
        ];
      }

      if (cascadeFilter) {
        loadOptions.filter = loadOptions.filter
          ? [loadOptions.filter, 'and', cascadeFilter]
          : cascadeFilter;
      }

      const params = {
        ...prepareLoadOptionsForBackend(loadOptions),
      };

      const res = await ApiRequest.Get(url, params, MessageBoxStatus);
      return normalizeLookupData(res.data?.data ?? res.data);
    }
  });
}

