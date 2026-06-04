import React from "react";
import { AppForm, BaseModal, useAppModalContext } from "../../core";

const InventoryDetailModalContent = () => {
  const modalContext = useAppModalContext();
  const modalContextRef = React.useRef(modalContext);
  modalContextRef.current = modalContext;

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
          onClick: () => console.log('Modal context data:', modalContextRef.current.data)
        }
      }
    ]
  };

  return <AppForm {...formOptions} />;
};

export const InventoryDetailModal = ({ modalRef }: { modalRef: React.RefObject<any> }) => {
  return (
    <BaseModal ref={modalRef} title="Inventory Detail" showCloseButton={true}>
      <InventoryDetailModalContent />
    </BaseModal>
  );
}