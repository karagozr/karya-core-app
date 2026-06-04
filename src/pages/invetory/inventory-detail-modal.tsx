import { AppForm, useAppModalContext } from "../../core";


export const AppFormOperations =()=>{

  const modalContext = useAppModalContext();

   const formOptions: any = {
      id: 'form',
      colCount: 4,
      items: [
        { dataField: 'id', colSpan: 1, editorOptions: { readOnly: true } },
        { dataField: 'name', colSpan: 3, isRequired: true, validationRules: [{ type: 'required', message: 'Name is required' }] },
        { dataField: 'categoryId', colSpan: 1 },
        { dataField: 'brand', colSpan: 1 }
      ],
      operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory",
      toolbarsItems: [
        {
          location: 'after',  
          widget: 'dxButton',
          locateInMenu: "auto",
          options: {
            icon: 'bell',
            text: 'ÇAL',
            onClick: (e: any) => console.log('Modal context data:', modalContext?.data)
          }
        }
      ]
    }

  return (
    <div>
      <AppForm {...formOptions} />
    </div>
  );
}