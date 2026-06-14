import React from 'react';
import { BaseFormPage, type BaseModalRef } from '../../core';
import { InventoryDetailModal } from './inventory-detail-modal';
import type { IBaseFormPageProps } from '../../core/pages/types/form-page';


export const InventoryFormPage = () => {

  const modalRef = React.useRef<BaseModalRef>(null);
  

  const meta : IBaseFormPageProps = {
    caption: 'Inventory Form',
    breadcrumb: { path: '/inventory/form' },
    formOptions: {
      id: 'form',
      colCount: 8,
      items: [
        { dataField: 'id', colSpan: 1, editorOptions: { readOnly: true } },
        { dataField: 'name', colSpan: 3, isRequired: true, validationRules: [{ type: 'required', message: 'Name is required' }] },
        { dataField: 'categoryId', colSpan: 1, editorType: 'dxLookup', 
          editorOptions: {displayExpr: 'name', valueExpr: 'id', 
          dsUrl: 'https://6a0efaf31736097c360af529.mockapi.io/api/category',
          dsCascadeChildrens: ['brand']
        } },
        { dataField: 'stateId', colSpan: 1, editorType: 'dxLookup', 
          editorOptions: {displayExpr: 'name', valueExpr: 'id', 
          dsUrl: 'https://6a0efaf31736097c360af529.mockapi.io/api/states',
          dsCascadeChildrens: ['brand']
        } },
        { dataField: 'brand', colSpan: 1, editorType: 'dxLookup', editorOptions: {
          displayExpr: 'name',
          valueExpr: 'id',
          dsUrl: 'https://6a0efaf31736097c360af529.mockapi.io/api/brand',
          dsCascadeParents: ['stateId','categoryId']
        } }
      ],
      operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory",
      toolbarsItems: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: "auto",
          options: {
            icon: 'bell',
            text: 'Öttür',
            onClick: (e: any) => console.log(">>>",e) //modalRef.current?.open(e)
          }
        }
      ]
    },
    detailCaption: 'Inventory Details',
    detailItems: [
      {
        type: 'detail',
        title: 'Notes',
        inTab: true,
        formDetailOptions: {
          operationUrl: "https://6a0efaf31736097c360af529.mockapi.io/api/inventory-detail",
          isEditable: true,
          parentKeyField: 'inventoryId',
          columns: [
            { dataField: 'id', editorOptions: { readOnly: true } },
            { dataField: 'inventoryId' },
            { dataField: 'note', validationRules: [{ type: 'required', message: 'Note is required' }] },
            { dataField: 'noteDate' }
          ],
          toolbarsItems: [
            {
              widget: 'dxButton',
              options: {
                icon: 'bell',
                text: 'Zil',
                onClick: (e: any) => console.log('Custom action clicked', e)
              }
            }
          ]
        }
      }
    ]
  }



  return (
    <React.Fragment>
      <InventoryDetailModal id='zzzzzz' modalRef={modalRef} />
      <BaseFormPage key='1' {...meta} />
    </React.Fragment>
  );

}






