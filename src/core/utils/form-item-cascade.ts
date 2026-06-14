export const cascadeHandlingOperation = (e: any, dataField: string, formRef: React.RefObject<any>) => {
  var editorOptions = e?.component?.option('items')?.find((item: any) => item.dataField === dataField)?.editorOptions;
  if (editorOptions.dsCascadeChildrens && editorOptions.dsCascadeChildrens.length > 0) {
    editorOptions.dsCascadeChildrens.forEach((childField: string) => {
      formRef.current?.instance().updateData(childField, null);
      const childDataSource = formRef.current?.instance().getEditor(childField)?.option('dataSource') as any;
      childDataSource?.reload();
    });
  }
}