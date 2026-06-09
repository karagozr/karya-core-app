import React from "react";
import { AppForm, AppFormDetail } from "../components/form";
import { AppFormContext, useAppFormContext } from "../contexts";
import { PageFormDetailLayout, PageFormLayout, PageLayout } from "../layouts";
import TabPanel, { Item as TabPanelItem } from 'devextreme-react/tab-panel';
import type { IBaseFormPageProps, IFormPageSubItemProps } from "./types";

export function BaseFormPage({ detailItems, formOptions, breadcrumb, caption, detailCaption }: React.PropsWithChildren<IBaseFormPageProps>) {

  const appFormContext = useAppFormContext();

  return (

    <AppFormContext.Provider value={appFormContext}>
        <PageLayout breadcrumb={breadcrumb} title={{ title: caption }}>
        {formOptions && <PageFormLayout key={0}><AppForm key={0} {...formOptions} /></PageFormLayout>}  
        {
          detailItems?.filter((item: IFormPageSubItemProps) => !item.inTab).map((item: IFormPageSubItemProps, index: number) => {
            switch (item.type) {
              case 'form':
                return<PageFormLayout key={index}>
                    <AppForm key={index} {...item.formOptions} />
                </PageFormLayout>
              case 'detail':
                return<PageFormDetailLayout key={index} pageType="form-detail" caption={{ title: item.title }}>
                  <AppFormDetail {...item.formDetailOptions!} />
                </PageFormDetailLayout>
              default:
                return null;
            }
          })
        }{
          detailItems?.some((item: IFormPageSubItemProps) => item.inTab) && (
            <PageFormDetailLayout pageType="form-detail"  caption={{ title: detailCaption }}>
              <TabPanel>
                {detailItems?.filter((item: IFormPageSubItemProps) => item.inTab).map((item: IFormPageSubItemProps, index: number) => (
                  <TabPanelItem key={index} title={item.title}>
                    {
                      item.type === 'form' ? 
                        <AppForm {...item.formOptions} />
                      : item.type === 'detail' ? 
                        <AppFormDetail {...item.formDetailOptions!} />
                      : 
                        <div>diğer</div>
                    }
                  </TabPanelItem>
                ))
                }
              </TabPanel>
            </PageFormDetailLayout>
          )
        }
      </PageLayout>
    </AppFormContext.Provider>
  );
}


