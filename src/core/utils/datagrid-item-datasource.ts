import type { RefObject } from "react";
import { CustomStore, DataSource } from "devextreme/common/data";
import { ApiRequest, type IMessageBoxStatus } from "../services";
import { showMessage } from "./message-box";
import { prepareLoadOptionsForBackend } from "./datagrid-datasource-helper";
import { coreI18n } from "../i18n";

const FORM_DATA_TOKEN_REGEX = /@FormData\.([a-zA-Z0-9_.]+)/g;
// Parantez içinde @FormData token'ı barındıran her bloğu yakalar: "(@FormData.contract)"
const FORM_DATA_PAREN_REGEX = /\([^)]*@FormData\.[a-zA-Z0-9_.]+[^)]*\)/g;

// Form ref'i (eski kullanım) ya da doğrudan veri döndüren getter fonksiyon (detail grid -> () => rowData)
export type FormDataSource = RefObject<any> | (() => Record<string, any>);

const readFormData = (source?: FormDataSource): Record<string, any> => {
  if (!source) return {};
  if (typeof source === 'function') return source() ?? {};
  return source.current?.instance().option('formData') ?? {};
};

const getFormDataValue = (formData: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), formData);

// byKey için: InternalDestination(@FormData.contract) -> InternalDestination(contract='ABC-123')
const resolveUrlForByKey = (
  url: string,
  formDataSource?: FormDataSource
): { url: string; isReady: boolean } => {
  if (!url.includes('@FormData.')) {
    return { url, isReady: true };
  }

  const formData = readFormData(formDataSource);
  let isReady = true;

  const resolvedUrl = url.replace(FORM_DATA_TOKEN_REGEX, (_match, path) => {
    const value = getFormDataValue(formData, path);

    if (value === undefined || value === null || (value as unknown) === '') {
      isReady = false;
      return '';
    }

    const fieldName = path.split('.').pop();
    return `${fieldName}='${encodeURIComponent(String(value))}'`;
  });

  return { url: resolvedUrl, isReady };
};

const stripFormDataTemplate = (url: string): string =>
  url.replace(FORM_DATA_PAREN_REGEX, '');

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
  _getCascadeParams?: () => Record<string, any>,
  formDataSource?: FormDataSource
) => {
  const baseUrl = stripFormDataTemplate(url);
return new DataSource({
    paginate: true,
    pageSize: 20,
    store: new CustomStore({
    key: 'id',

    byKey: async (key) => {
      if (key === undefined || key === null || (key as unknown) === '') {
        return;
      }

      const { url: resolvedUrl, isReady } = resolveUrlForByKey(url, formDataSource);
      if (!isReady) {
        return undefined;
      }

      const res = await ApiRequest.Get(`${resolvedUrl}/${key}`, null, MessageBoxStatus);
      if (res.status === 404) {
        showMessage({
          type: 'error',
          message: coreI18n.lookup.keyNotFound(key),
          title: coreI18n.lookup.keyNotFoundTitle,
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
          const normalizedField = field.startsWith('parentRow.')
            ? field.replace('parentRow.', '')
            : field;

          const value = cascadeParams[normalizedField];
          return value !== undefined && value !== null && value !== '';
        });

        if (!hasAllParents) {
          return loadOptions.requireTotalCount
            ? { data: [], totalCount: 0 }
            : [];
        }
      }

      loadOptions.select = _searchFields;
      loadOptions.searchExpr = _searchFields;

      if (
        loadOptions.searchValue === undefined ||
        loadOptions.searchValue === null ||
        loadOptions.searchValue === '' ||
        loadOptions.searchValue.length < 3
      ) {
        loadOptions.skip = loadOptions.skip ?? 0;
        loadOptions.take = loadOptions.take ?? 10;
      } else if (_searchFields && _searchFields.length > 1) {
        loadOptions.filter = [
          [_searchFields[0], 'contains', loadOptions.searchValue],
          'or',
          [_searchFields[1], 'contains', loadOptions.searchValue],
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

      const res = await ApiRequest.Get(baseUrl, params, MessageBoxStatus);
      return normalizeLookupData(res.data?.data ?? res.data);
      }
    }),
  });
}