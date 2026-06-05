import React from "react";
import { AppForm, BaseModal, useAppModalContext } from "../../core";


export const InventoryDetailModal = ({ modalRef,id }: { id: string, modalRef: React.RefObject<any> }) => {
  
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
          onClick: () => console.log('Modal context data:', modalContext?.getModalData(id))
        }
      }
    ]
  };

  return (
    <BaseModal id={id} ref={modalRef} title="Inventory Detail" showCloseButton={true}>
      <AppForm {...formOptions} />
    </BaseModal>
  );
}