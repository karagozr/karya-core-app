import React from "react";
import { AppForm, AppFormDetail, type AppFormAllowOptions } from "../components/form";
import { AppFormContext, AppModalContext, useProvideAppModalContext, useProvideAppFormContext } from "../contexts";
import { PageFormDetailLayout, PageFormLayout, PageLayout } from "../layouts";
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import type { IBaseFormPageProps, IFormPageSubItemProps } from "./types";
import { AppFormModal } from "../modals";

const defaultFormAllowOptionsForModal :AppFormAllowOptions = { allowNew: false, allowDelete: false, allowEdit: false,allowSave: false };

export const BaseFormPage =({ detailItems, formOptions, breadcrumb, caption, detailCaption, children } : React.PropsWithChildren<IBaseFormPageProps>) => {

  const appFormContext = useProvideAppFormContext();
  const appModalContext = useProvideAppModalContext();
  const { ref: pageFormRef, ...pageFormOptions } = formOptions || {};

  return (
    <AppFormContext.Provider value={appFormContext}>
      <AppModalContext.Provider value={appModalContext}>
      <PageLayout breadcrumb={breadcrumb} title={{ title: caption }}>
        {formOptions && <PageFormLayout key={0}><AppForm key={0} ref={pageFormRef} {...pageFormOptions} /></PageFormLayout>}
        {
          detailItems?.filter((item: IFormPageSubItemProps) => !item.inTab && !item.modal).map((item: IFormPageSubItemProps, index: number) => {
            switch (item.type) {
              case 'form': {
                const { ref: itemFormRef, ...itemFormOptions } = item.formOptions || {};
                return <PageFormLayout key={index}>
                          <AppForm key={index} ref={itemFormRef} {...itemFormOptions} />
                        </PageFormLayout>
              }
              case 'detail': {
                const { ref: itemDetailRef, ...itemDetailOptions } = item.formDetailOptions!;
                return  <PageFormDetailLayout key={index} pageType="form-detail" caption={{ title: item.title }}>
                          <AppFormDetail ref={itemDetailRef} {...itemDetailOptions} />
                        </PageFormDetailLayout>
              }
              default:
                return null;
            }
          })
        }
        {
          detailItems?.filter((item: IFormPageSubItemProps) => !item.inTab && item.modal).map((item: IFormPageSubItemProps, index: number) => {
            switch (item.type) {
              case 'form': {
                const { ref: itemFormRef, ...itemFormOptions } = item.formOptions || {};
                if(!item.modal)  return null;
                
                return <AppFormModal key={index} {...item.modal} title={item.title} modalKey={item.modal.modalKey}>
                          <AppForm modalKey={item.modal.modalKey} key={index} ref={itemFormRef} {...itemFormOptions} formAllowOptions={itemFormOptions.formAllowOptions ?? defaultFormAllowOptionsForModal} />
                        </AppFormModal>
              }
              case 'detail': {
                const { ref: itemDetailRef, ...itemDetailOptions } = item.formDetailOptions!;
                if(!item.modal)  return null;
                return  <AppFormModal key={index} title={item.title} modalKey={item.modal.modalKey}>
                          <AppFormDetail ref={itemDetailRef} {...itemDetailOptions} />
                        </AppFormModal>
              }
              default:
                return null;
            }
          })
        }
        {
          detailItems?.some((item: IFormPageSubItemProps) => item.inTab) && (
            <PageFormDetailLayout pageType="form-detail" caption={{ title: detailCaption }}>
              <TabPanel>
                {detailItems?.filter((item: IFormPageSubItemProps) => item.inTab).map((item: IFormPageSubItemProps, index: number) => (
                  <TabPanelItem key={index} title={item.title}>
                    {
                      item.type === 'form' ? (() => {
                        const { ref: itemFormRef, ...itemFormOptions } = item.formOptions || {};
                        return <AppForm ref={itemFormRef} {...itemFormOptions} />;
                      })()
                        : item.type === 'detail' ? (() => {
                          const { ref: itemDetailRef, ...itemDetailOptions } = item.formDetailOptions!;
                          return <AppFormDetail ref={itemDetailRef} {...itemDetailOptions} />;
                        })()
                          :
                          <div>diğer</div>
                    }
                  </TabPanelItem>
                ))}
              </TabPanel>
            </PageFormDetailLayout>
          )
        }
      </PageLayout>
      {children}
      </AppModalContext.Provider>
    </AppFormContext.Provider>
  );
}



 
