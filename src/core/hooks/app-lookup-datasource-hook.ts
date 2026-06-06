import React from 'react';
import { CustomStore, DataSource } from 'devextreme/common/data';

interface AppLookupCascadeConfig {
  resetField: string;
}

interface AppLookupConfig {
  displayExpr?: string;
  valueExpr?: string;
  getCascadeParams?: (formData: any) => Record<string, any> | null;
  cascade?: AppLookupCascadeConfig;
}

export const useAppLookupDataSource = (
  url: string,
  formRef: React.RefObject<any>,
  config: AppLookupConfig = {}
) => {
  const { displayExpr, valueExpr, getCascadeParams, cascade } = config;

  const needsReload = React.useRef(false);
  const cacheRef = React.useRef<{ data: any[] | null; pending: Promise<any> | null }>({ data: null, pending: null });
  const dsRef = React.useRef<DataSource | null>(null);
  const getCascadeParamsRef = React.useRef(getCascadeParams);
  const cascadeRef = React.useRef(cascade);
  getCascadeParamsRef.current = getCascadeParams;
  cascadeRef.current = cascade;

  if (!dsRef.current) {
    dsRef.current = new DataSource({
      paginate: false,
      store: new CustomStore({
        byKey: (key) => fetch(`${url}/${key}`).then((r) => r.json()),
        load: () => {
          const cache = cacheRef.current;
          if (cache.data) return Promise.resolve(cache.data);
          if (cache.pending) return cache.pending;

          const formData = formRef.current?.getFormData?.();
          const params = getCascadeParamsRef.current?.(formData);
          const queryString = params
            ? '?' + new URLSearchParams(
                Object.entries(params)
                  .filter(([, v]) => v != null)
                  .map(([k, v]) => [k, String(v)])
              ).toString()
            : '';

          cache.pending = fetch(`${url}${queryString}`)
            .then((r) => r.json())
            .then((data) => { cache.data = data; return data; })
            .finally(() => { cache.pending = null; });

          return cache.pending;
        },
      }),
    });
  }

  const invalidate = React.useCallback(() => {
    cacheRef.current.data = null;
    needsReload.current = true;
  }, []);

  const onOpened = React.useCallback(() => {
    if (needsReload.current) {
      needsReload.current = false;
      dsRef.current!.reload();
    }
  }, []);

  const editorOptions = React.useMemo(() => ({
    dataSource: dsRef.current as DataSource,
    ...(displayExpr && { displayExpr }),
    ...(valueExpr && { valueExpr }),
    ...(cascade && { onOpened }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [displayExpr, valueExpr, !!cascade, onOpened]);

  const wrapWithCascade = React.useCallback(<T extends object>(baseOptions: T) => ({
    ...baseOptions,
    onValueChanged: () => {
      formRef.current?.updateData?.(cascadeRef.current!.resetField, null);
      invalidate();
    },
  }), [invalidate]);

  return { editorOptions, wrapWithCascade };
};

