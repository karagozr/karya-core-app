import React from "react";
import { AppForm, AppFormDetail } from "../components/form";
import { AppFormContext, useProvideAppFormContext } from "../contexts";
import { PageFormDetailLayout, PageFormLayout, PageLayout } from "../layouts";
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import type { IBaseFormPageProps, IFormPageSubItemProps } from "./types";

export const BaseFormPage =({ detailItems, formOptions, breadcrumb, caption, detailCaption }
  : React.PropsWithChildren<IBaseFormPageProps>) => {

  const appFormContext = useProvideAppFormContext();
  const { ref: pageFormRef, ...pageFormOptions } = formOptions || {};

  return (
    <AppFormContext.Provider value={appFormContext}>
      <PageLayout breadcrumb={breadcrumb} title={{ title: caption }}>
        {formOptions && <PageFormLayout key={0}><AppForm key={0} ref={pageFormRef} {...pageFormOptions} /></PageFormLayout>}
        {
          detailItems?.filter((item: IFormPageSubItemProps) => !item.inTab).map((item: IFormPageSubItemProps, index: number) => {
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
    </AppFormContext.Provider>
  );
}



 
