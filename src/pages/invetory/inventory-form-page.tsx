import React from 'react';
import { BaseFormPage, type BaseModalRef } from '../../core';
import { InventoryDetailModal } from './inventory-detail-modal';
import type { IBaseFormPageProps } from '../../core/pages/types/form-page';


export const InventoryFormPage = () => {

  const modalRef = React.useRef<BaseModalRef>(null);


  const meta: IBaseFormPageProps = {
    caption: 'Inventory Form',
    breadcrumb: { path: '/inventory/form' },
    formOptions: {
      id: 'form',
      colCount: 8,
      items: [
        { dataField: 'id', colSpan: 1, validationRules: [{ type: 'required', message: 'Name is required' }] },
        { dataField: 'name', colSpan: 3, isRequired: true, validationRules: [{ type: 'required', message: 'Name is required' }] },
        {
          dataField: 'mainCategoryId', colSpan: 1, editorType: 'dxLookup',
          editorOptions: {
            displayExpr: 'name', valueExpr: 'id',
            dsUrl: 'https://localhost:7131/api/InvMainCategory',
            dsCascadeChildrens: ['categoryId']
          }
        },
        {
          dataField: 'categoryId', colSpan: 1, editorType: 'dxLookup',
          editorOptions: {
            displayExpr: 'name', valueExpr: 'id',
            dsUrl: 'https://localhost:7131/api/InvCategory',
            dsCascadeParents: ['mainCategoryId']
          }
        },
        { dataField: 'brand', colSpan: 1 },

      ],
      operationUrl: "https://localhost:7131/api/Inv",
      toolbarsItems: [
        {
          location: 'after',
          widget: 'dxButton',
          locateInMenu: "auto",
          options: {
            icon: 'bell',
            text: 'Öttür',
            onClick: (e: any) => modalRef.current?.open(e)
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
          operationUrl: "https://localhost:7131/api/invdetail",
          isEditable: true,
          parentFields: ["inventoryId"],
          columns: [
            { dataField: 'id', editorOptions: { readOnly: true } },
            { dataField: 'note', validationRules: [{ type: 'required', message: 'Note is required' }] },
            {
              dataField: 'mainCategoryId',
              calculateDisplayValue: (item: any) => item?.mainCategoryId ? (item?.mainCategoryId + ' - ' + item?.mainCategoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id ? item?.id + ' - ' + item?.name : '',

              },
              dsUrl: 'https://localhost:7131/api/InvMainCategory',
              dsCascadeChildrens: ['categoryId'],
              dsSearchFields: ['id', 'name'],
            },
            {
              dataField: 'categoryId',
              calculateDisplayValue: (item: any) =>  item?.categoryId ? (item?.categoryId + ' - ' + item?.categoryName) :'',
              lookup: {
                valueExpr: 'id',
                displayExpr: (item: any) => item?.id ? item?.id + ' - ' + item?.name : '',

              },
              dsUrl: 'https://localhost:7131/api/InvCategory',
              dsCascadeParents: ['mainCategoryId'],
              dsSearchFields: ['id', 'name'],
            },
          ],
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






