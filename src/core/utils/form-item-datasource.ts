import { CustomStore, DataSource } from "devextreme/common/data";
import { ApiRequest, type IMessageBoxStatus } from "../services";
import { showMessage } from "./message-box";
import { normalizeApiDataForArray, normalizeApiDataForObject } from "./api-result-normalizer";
import { prepareLoadOptionsForBackend } from "./datagrid-datasource-helper";
import { coreI18n } from "../i18n";


const FORM_DATA_TOKEN_REGEX = /@FormData\.([a-zA-Z0-9_.]+)/g;
// Parantez içinde @FormData token'ı barındıran her bloğu yakalar: "(@FormData.contract)"
const FORM_DATA_PAREN_REGEX = /\([^)]*@FormData\.[a-zA-Z0-9_.]+[^)]*\)/g;

const getFormDataValue = (formData: Record<string, any>, path: string) =>
  path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), formData);

// byKey için: InternalDestination(@FormData.contract) -> InternalDestination(contract='ABC-123')
const resolveUrlForByKey = (
  url: string,
  formRef: React.RefObject<any>
): { url: string; isReady: boolean } => {
  if (!url.includes('@FormData.')) {
    return { url, isReady: true };
  }

  const formData = formRef?.current?.instance().option('formData') ?? {};
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

// byKey dışındaki her yer için: (...@FormData...) bloğu tamamen kaldırılır
// InternalDestination(@FormData.contract) -> InternalDestination
const stripFormDataTemplate = (url: string): string =>
  url.replace(FORM_DATA_PAREN_REGEX, '');

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

export const createLookupDs = (url: string, parentFields: string[] | undefined, searchFields = ['id', 'name'], formRef: React.RefObject<any>) =>{
  const baseUrl = stripFormDataTemplate(url);
  return new DataSource({
    paginate: true,
    pageSize: 20,
    store: new CustomStore({
      byKey: async (key) => {
        const { url: resolvedUrl, isReady } = resolveUrlForByKey(url, formRef);

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
            loadOptions.skip = loadOptions.skip ?? 0;
            loadOptions.take = loadOptions.take ?? 10;
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
      
        const res = await ApiRequest.Get(baseUrl, params, MessageBoxStatus);
        return normalizeApiDataForArray(res);
      }
    }),
  });
}
